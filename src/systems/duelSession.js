import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";

const DEFAULT_SIGNALING = [
  "wss://signaling.yjs.dev",
  "wss://y-webrtc-signaling-eu.herokuapp.com",
  "wss://y-webrtc-signaling-us.herokuapp.com",
];

export const DUEL_PHASES = Object.freeze({
  WAITING: "waiting",
  COUNTDOWN: "countdown",
  IN_PROGRESS: "in-progress",
  FINISHED: "finished",
  FORFEIT: "forfeit",
});

export function createDuelState(overrides = {}) {
  return { phase: DUEL_PHASES.WAITING, countdown: 3, winnerId: null, reason: null, ...overrides };
}

export function transitionDuel(state, event) {
  const current = state || createDuelState();
  switch (event?.type) {
    case "OPPONENT_JOINED":
      return current.phase === DUEL_PHASES.WAITING ? { ...current, phase: DUEL_PHASES.COUNTDOWN } : current;
    case "COUNTDOWN_TICK":
      if (current.phase !== DUEL_PHASES.COUNTDOWN) return current;
      return current.countdown > 1
        ? { ...current, countdown: current.countdown - 1 }
        : { ...current, phase: DUEL_PHASES.IN_PROGRESS, countdown: 0 };
    case "WIN":
      return current.phase === DUEL_PHASES.IN_PROGRESS
        ? { ...current, phase: DUEL_PHASES.FINISHED, winnerId: event.playerId, reason: "completed" }
        : current;
    case "FORFEIT":
      return current.phase === DUEL_PHASES.IN_PROGRESS || current.phase === DUEL_PHASES.COUNTDOWN
        ? { ...current, phase: DUEL_PHASES.FORFEIT, winnerId: event.winnerId || null, reason: "forfeit" }
        : current;
    case "RESET":
      return createDuelState();
    default:
      return current;
  }
}

export function normalizeDuelProgress(progress, totalChecks) {
  const total = Math.max(0, Number(totalChecks) || 0);
  const passed = Math.min(total, Math.max(0, Number(progress?.passed) || 0));
  return { passed, total };
}

function createId() {
  return typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
}

function normalizeRoomId(roomId) {
  return String(roomId || "").trim().replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 96);
}

export function createDuelInvite(roomId, location = typeof window !== "undefined" ? window.location : null) {
  const safeRoomId = normalizeRoomId(roomId);
  if (!location) return `?duel=${safeRoomId}`;
  const url = new URL(location.href);
  url.searchParams.set("duel", safeRoomId);
  return url.toString();
}

export function readDuelRoom(location = typeof window !== "undefined" ? window.location : null) {
  return location ? normalizeRoomId(new URL(location.href).searchParams.get("duel")) : "";
}

export class DuelSession {
  constructor({ roomId, missionId, user = {}, providerFactory, signaling = DEFAULT_SIGNALING } = {}) {
    this.roomId = normalizeRoomId(roomId) || `duel-${createId()}`;
    this.missionId = missionId || "mission";
    this.user = { id: user.id || createId(), name: user.name || "Player", avatar: user.avatar || "⚔️" };
    this.providerFactory = providerFactory;
    this.signaling = signaling;
    this.provider = null;
    this.awareness = null;
    this.destroyed = false;
    this.progress = { passed: 0, total: 0 };
    this.phase = DUEL_PHASES.WAITING;
    this.listeners = { progress: new Set(), peers: new Set(), status: new Set() };
  }

  connect() {
    if (this.destroyed) throw new Error("DuelSession has been destroyed");
    if (this.provider) return this;
    const roomName = `soroban-quest-duel:${this.missionId}:${this.roomId}`;
    this.provider = this.providerFactory
      ? this.providerFactory(roomName, { signaling: this.signaling })
      : new WebrtcProvider(roomName, new Y.Doc(), { signaling: this.signaling });
    this.awareness = this.provider.awareness;
    this.provider.on?.("status", (event) => this.emit("status", { connected: event.status === "connected" }));
    this.awareness?.setLocalStateField?.("duel", this.getLocalState());
    this.awareness?.on?.("change", () => {
      this.emit("peers", this.getPeers());
      this.getPeers().forEach((peer) => this.emit("progress", peer));
    });
    this.emit("peers", this.getPeers());
    return this;
  }

  getLocalState() {
    return { ...this.user, phase: this.phase, progress: this.progress };
  }

  publishProgress(progress, totalChecks) {
    this.progress = normalizeDuelProgress(progress, totalChecks);
    this.awareness?.setLocalStateField?.("duel", this.getLocalState());
    return this.progress;
  }

  publishPhase(phase) {
    this.phase = phase;
    this.awareness?.setLocalStateField?.("duel", this.getLocalState());
  }

  getPeers() {
    if (!this.awareness?.getStates) return [];
    return Array.from(this.awareness.getStates().values()).map((state) => state.duel).filter((peer) => peer && peer.id !== this.user.id);
  }

  on(type, listener) {
    this.listeners[type]?.add(listener);
    return () => this.listeners[type]?.delete(listener);
  }

  emit(type, payload) {
    this.listeners[type]?.forEach((listener) => listener(payload));
  }

  destroy() {
    this.destroyed = true;
    this.awareness?.setLocalState?.(null);
    this.provider?.destroy?.();
    Object.values(this.listeners).forEach((listeners) => listeners.clear());
  }
}