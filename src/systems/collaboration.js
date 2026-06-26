import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

const DEFAULT_SIGNALING = [
  "wss://signaling.yjs.dev",
  "wss://y-webrtc-signaling-eu.herokuapp.com",
  "wss://y-webrtc-signaling-us.herokuapp.com",
];

function createId(prefix = "collab") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeRoomId(roomId) {
  return String(roomId || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 96);
}

function getWindowLocation() {
  if (typeof window === "undefined") return null;
  return window.location;
}

function snapshotKey(missionId, roomId) {
  return `soroban_quest_collab:${missionId}:${roomId}`;
}

function readSnapshot(missionId, roomId) {
  try {
    if (typeof localStorage === "undefined") return "";
    return localStorage.getItem(snapshotKey(missionId, roomId)) || "";
  } catch {
    return "";
  }
}

function writeSnapshot(missionId, roomId, code) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(snapshotKey(missionId, roomId), code);
  } catch {
    // Storage may be unavailable in private contexts; Yjs still keeps in-memory state.
  }
}

export function createCollaborationInvite(roomId, location = getWindowLocation()) {
  const safeRoomId = normalizeRoomId(roomId);
  if (!location) return `?collab=${safeRoomId}`;

  const url = new URL(location.href);
  url.searchParams.set("collab", safeRoomId);
  return url.toString();
}

export function readCollaborationRoom(location = getWindowLocation()) {
  if (!location) return "";
  return normalizeRoomId(new URL(location.href).searchParams.get("collab"));
}

export class CollaborationManager {
  constructor({
    roomId,
    missionId,
    user = {},
    initialCode = "",
    providerFactory,
    awarenessFactory,
    signaling = DEFAULT_SIGNALING,
  } = {}) {
    this.roomId = normalizeRoomId(roomId || createId("mission"));
    this.missionId = missionId || "mission";
    this.user = {
      id: user.id || createId("player"),
      name: user.name || "Player",
      color: user.color || "#06d6a0",
    };
    this.signaling = signaling;
    this.providerFactory = providerFactory;
    this.awarenessFactory = awarenessFactory;
    this.doc = new Y.Doc();
    this.code = this.doc.getText("code");
    this.meta = this.doc.getMap("meta");
    this.provider = null;
    this.awareness = null;
    this.connected = false;
    this.destroyed = false;
    const seedCode = readSnapshot(this.missionId, this.roomId) || initialCode;
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

  connect() {
    if (this.destroyed) {
      throw new Error("CollaborationManager has been destroyed");
    }
    if (this.provider) return this;

    const roomName = `soroban-quest:${this.missionId}:${this.roomId}`;
    this.provider = this.providerFactory
      ? this.providerFactory(roomName, this.doc, { signaling: this.signaling })
      : new WebrtcProvider(roomName, this.doc, { signaling: this.signaling });
    this.awareness = this.provider.awareness || this.awarenessFactory?.();

    this.provider.on?.("status", (event) => {
      this.connected = event.status === "connected";
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

  disconnect() {
    this.connected = false;
    this.awareness?.setLocalState?.(null);
    this.provider?.disconnect?.();
    this.emit("status", this.getStatus());
    return this;
  }

  reconnect() {
    if (!this.provider) return this.connect();
    this.provider.connect?.();
    this.emit("status", { ...this.getStatus(), reconnecting: true });
    return this;
  }

  destroy() {
    this.destroyed = true;
    this.connected = false;
    this.awareness?.setLocalState?.(null);
    this.provider?.destroy?.();
    this.doc.destroy();
    Object.values(this.listeners).forEach((listeners) => listeners.clear());
  }

  setCode(nextCode, origin = "local") {
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

  mergeCode(remoteCode) {
    const current = this.getCode();
    const incoming = String(remoteCode ?? "");
    if (incoming === current) return { changed: false, conflict: false, code: current };

    const localChanged = current !== this.lastSyncedCode;
    const remoteChanged = incoming !== this.lastSyncedCode;
    const conflict = localChanged && remoteChanged;

    this.setCode(incoming, "remote");
    this.lastSyncedCode = incoming;
    const result = { changed: true, conflict, code: incoming };
    if (conflict) this.emit("conflict", result);
    return result;
  }

  getCode() {
    return this.code.toString();
  }

  getStatus() {
    return {
      roomId: this.roomId,
      connected: this.connected,
      peerCount: this.getPeers().length,
    };
  }

  getPeers() {
    if (!this.awareness?.getStates) return [];
    return Array.from(this.awareness.getStates().values())
      .map((state) => state.user)
      .filter(Boolean);
  }

  on(type, listener) {
    this.listeners[type]?.add(listener);
    return () => this.listeners[type]?.delete(listener);
  }

  emit(type, payload) {
    this.listeners[type]?.forEach((listener) => listener(payload));
  }
}

export function createCollaborationManager(options) {
  return new CollaborationManager(options);
}
