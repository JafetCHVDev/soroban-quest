import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

const DEFAULT_SIGNALING = [
  "wss://signaling.yjs.dev",
  "wss://y-webrtc-signaling-eu.herokuapp.com",
  "wss://y-webrtc-signaling-us.herokuapp.com",
];

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface CollaborationStatus {
  roomId: string;
  connected: boolean;
  peerCount: number;
  reconnecting?: boolean;
}

export interface MergeResult {
  changed: boolean;
  conflict: boolean;
  code: string;
}

function createId(prefix = "collab"): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeRoomId(roomId: string): string {
  return String(roomId || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 96);
}

function getWindowLocation(): Location | null {
  if (typeof window === "undefined") return null;
  return window.location;
}

function snapshotKey(missionId: string, roomId: string): string {
  return `soroban_quest_collab:${missionId}:${roomId}`;
}

function readSnapshot(missionId: string, roomId: string): string {
  try {
    if (typeof localStorage === "undefined") return "";
    return localStorage.getItem(snapshotKey(missionId, roomId)) || "";
  } catch {
    return "";
  }
}

function writeSnapshot(
  missionId: string,
  roomId: string,
  code: string
): void {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(snapshotKey(missionId, roomId), code);
  } catch {
    // Storage may be unavailable in private contexts; Yjs still keeps in-memory state.
  }
}

export function createCollaborationInvite(
  roomId: string,
  location: Location | null = getWindowLocation()
): string {
  const safeRoomId = normalizeRoomId(roomId);
  if (!location) return `?collab=${safeRoomId}`;

  const url = new URL(location.href);
  url.searchParams.set("collab", safeRoomId);
  return url.toString();
}

export function readCollaborationRoom(
  location: Location | null = getWindowLocation()
): string {
  if (!location) return "";
  return normalizeRoomId(new URL(location.href).searchParams.get("collab"));
}

interface CollaborationManagerOptions {
  roomId?: string;
  missionId?: string;
  user?: Partial<User>;
  initialCode?: string;
  providerFactory?: (roomName: string, doc: Y.Doc, options: Record<string, unknown>) => unknown;
  awarenessFactory?: () => unknown;
  signaling?: string[];
}

type ListenerType = "code" | "status" | "peers" | "conflict";
type Listener = (payload: unknown) => void;

export class CollaborationManager {
  roomId: string;
  missionId: string;
  user: User;
  signaling: string[];
  providerFactory?: (roomName: string, doc: Y.Doc, options: Record<string, unknown>) => unknown;
  awarenessFactory?: () => unknown;
  doc: Y.Doc;
  code: Y.Text;
  meta: Y.Map<unknown>;
  provider: unknown;
  awareness: unknown;
  connected: boolean;
  destroyed: boolean;
  lastSyncedCode: string;
  listeners: Record<ListenerType, Set<Listener>>;

  constructor(options: CollaborationManagerOptions = {}) {
    this.roomId = normalizeRoomId(options.roomId || createId("mission"));
    this.missionId = options.missionId || "mission";
    this.user = {
      id: options.user?.id || createId("player"),
      name: options.user?.name || "Player",
      color: options.user?.color || "#06d6a0",
    };
    this.signaling = options.signaling || DEFAULT_SIGNALING;
    this.providerFactory = options.providerFactory;
    this.awarenessFactory = options.awarenessFactory;
    this.doc = new Y.Doc();
    this.code = this.doc.getText("code");
    this.meta = this.doc.getMap("meta");
    this.provider = null;
    this.awareness = null;
    this.connected = false;
    this.destroyed = false;
    const seedCode =
      readSnapshot(this.missionId, this.roomId) || options.initialCode || "";
    this.lastSyncedCode = seedCode;
    this.listeners = {
      code: new Set(),
      status: new Set(),
      peers: new Set(),
      conflict: new Set(),
    };

    if (seedCode) {
      this.code.insert(0, seedCode);
    }

    this.code.observe(() => {
      const nextCode = this.getCode();
      writeSnapshot(this.missionId, this.roomId, nextCode);
      this.emit("code", nextCode);
    });
  }

  connect(): this {
    if (this.destroyed) {
      throw new Error("CollaborationManager has been destroyed");
    }
    if (this.provider) return this;

    const roomName = `soroban-quest:${this.missionId}:${this.roomId}`;
    this.provider = this.providerFactory
      ? this.providerFactory(roomName, this.doc, { signaling: this.signaling })
      : new WebrtcProvider(roomName, this.doc, { signaling: this.signaling });
    this.awareness = this.provider.awareness || this.awarenessFactory?.();

    this.provider.on?.("status", (event: unknown) => {
      const eventObj = event as { status?: string };
      this.connected = eventObj?.status === "connected";
      this.emit("status", this.getStatus());
    });

    this.awareness?.setLocalStateField?.("user", this.user);
    this.awareness?.setLocalStateField?.("editing", {
      missionId: this.missionId,
      at: Date.now(),
    });
    this.awareness?.on?.("change", () => this.emit("peers", this.getPeers()));
    this.emit("status", this.getStatus());
    this.emit("peers", this.getPeers());

    return this;
  }

  disconnect(): this {
    this.connected = false;
    this.awareness?.setLocalState?.(null);
    this.provider?.disconnect?.();
    this.emit("status", this.getStatus());
    return this;
  }

  reconnect(): this {
    if (!this.provider) return this.connect();
    this.provider.connect?.();
    this.emit("status", { ...this.getStatus(), reconnecting: true });
    return this;
  }

  destroy(): void {
    this.destroyed = true;
    this.connected = false;
    this.awareness?.setLocalState?.(null);
    this.provider?.destroy?.();
    this.doc.destroy();
    Object.values(this.listeners).forEach((listeners) => listeners.clear());
  }

  setCode(nextCode: string, origin = "local"): boolean {
    const value = String(nextCode ?? "");
    const current = this.getCode();
    if (current === value) return false;

    this.doc.transact(() => {
      this.code.delete(0, this.code.length);
      this.code.insert(0, value);
      this.meta.set("updatedBy", this.user.id);
      this.meta.set("updatedAt", Date.now());
    }, origin);
    return true;
  }

  mergeCode(remoteCode: string): MergeResult {
    const current = this.getCode();
    const incoming = String(remoteCode ?? "");
    if (incoming === current) {
      return { changed: false, conflict: false, code: current };
    }

    const localChanged = current !== this.lastSyncedCode;
    const remoteChanged = incoming !== this.lastSyncedCode;
    const conflict = localChanged && remoteChanged;

    this.setCode(incoming, "remote");
    this.lastSyncedCode = incoming;
    const result = { changed: true, conflict, code: incoming };
    if (conflict) this.emit("conflict", result);
    return result;
  }

  getCode(): string {
    return this.code.toString();
  }

  getStatus(): CollaborationStatus {
    return {
      roomId: this.roomId,
      connected: this.connected,
      peerCount: this.getPeers().length,
    };
  }

  getPeers(): User[] {
    if (!this.awareness?.getStates) return [];
    return Array.from(this.awareness.getStates().values() as Iterable<{ user?: User }>)
      .map((state) => state.user)
      .filter(Boolean);
  }

  on(type: ListenerType, listener: Listener): () => void {
    this.listeners[type]?.add(listener);
    return () => this.listeners[type]?.delete(listener);
  }

  emit(type: ListenerType, payload: unknown): void {
    this.listeners[type]?.forEach((listener) => listener(payload));
  }
}

export function createCollaborationManager(
  options: CollaborationManagerOptions
): CollaborationManager {
  return new CollaborationManager(options);
}
