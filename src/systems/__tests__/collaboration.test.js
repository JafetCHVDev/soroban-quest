import { describe, expect, it, vi } from "vitest";
import {
  CollaborationManager,
  createCollaborationInvite,
  readCollaborationRoom,
} from "../collaboration";

function createProviderMock() {
  const handlers = new Map();
  const awarenessStates = new Map();
  return {
    connected: false,
    awareness: {
      setLocalState: vi.fn(),
      setLocalStateField: vi.fn((key, value) => {
        const current = awarenessStates.get("local") || {};
        awarenessStates.set("local", { ...current, [key]: value });
      }),
      getStates: vi.fn(() => awarenessStates),
      on: vi.fn((event, handler) => handlers.set(`awareness:${event}`, handler)),
    },
    on: vi.fn((event, handler) => handlers.set(event, handler)),
    connect: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    emitStatus(status) {
      handlers.get("status")?.({ status });
    },
    addPeer(peer) {
      awarenessStates.set(peer.id, { user: peer });
      handlers.get("awareness:change")?.();
    },
  };
}

describe("CollaborationManager", () => {
  it("syncs local code changes through the shared Yjs document", () => {
    const provider = createProviderMock();
    const manager = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      initialCode: "hello",
      providerFactory: () => provider,
    });
    const onCode = vi.fn();

    manager.on("code", onCode);
    manager.connect();

    expect(manager.getCode()).toBe("hello");
    expect(manager.setCode("hello world")).toBe(true);
    expect(manager.getCode()).toBe("hello world");
    expect(onCode).toHaveBeenCalledWith("hello world");
  });

  it("restores a local snapshot so work survives reconnects", () => {
    const storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => {
        storage[key] = value;
      },
    });
    const first = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      initialCode: "seed",
      providerFactory: () => createProviderMock(),
    });

    first.setCode("saved work");
    const second = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      initialCode: "seed",
      providerFactory: () => createProviderMock(),
    });

    expect(second.getCode()).toBe("saved work");
    vi.unstubAllGlobals();
  });

  it("reports connected peers through awareness updates", () => {
    const provider = createProviderMock();
    const manager = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      providerFactory: () => provider,
    });
    const onPeers = vi.fn();

    manager.on("peers", onPeers);
    manager.connect();
    provider.addPeer({ id: "peer-1", name: "Ada", color: "#8b5cf6" });

    expect(manager.getPeers()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "peer-1", name: "Ada" }),
      ]),
    );
    expect(onPeers).toHaveBeenCalled();
  });

  it("emits status updates for disconnect and reconnect flows", () => {
    const provider = createProviderMock();
    const manager = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      providerFactory: () => provider,
    });
    const onStatus = vi.fn();

    manager.on("status", onStatus);
    manager.connect();
    provider.emitStatus("connected");
    manager.disconnect();
    manager.reconnect();

    expect(onStatus).toHaveBeenCalledWith(expect.objectContaining({ connected: true }));
    expect(provider.disconnect).toHaveBeenCalled();
    expect(provider.connect).toHaveBeenCalled();
  });

  it("flags conflicts when remote code arrives after local divergence", () => {
    const provider = createProviderMock();
    const manager = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      initialCode: "base",
      providerFactory: () => provider,
    });
    const onConflict = vi.fn();

    manager.on("conflict", onConflict);
    manager.connect();
    manager.lastSyncedCode = "base";
    manager.code.insert(4, "-local");

    const result = manager.mergeCode("base-remote");

    expect(result.conflict).toBe(true);
    expect(manager.getCode()).toBe("base-remote");
    expect(onConflict).toHaveBeenCalledWith(expect.objectContaining({ conflict: true }));
  });

  it("simulates a two-client collaborative session syncing edits and awareness", () => {
    const provider1 = createProviderMock();
    const provider2 = createProviderMock();

    const client1 = new CollaborationManager({
      roomId: "two-peer-room",
      missionId: "basics",
      initialCode: "pub fn start() {}",
      user: { id: "user-1", name: "Alice", color: "#06d6a0" },
      providerFactory: () => provider1,
    });

    const client2 = new CollaborationManager({
      roomId: "two-peer-room",
      missionId: "basics",
      initialCode: "pub fn start() {}",
      user: { id: "user-2", name: "Bob", color: "#8b5cf6" },
      providerFactory: () => provider2,
    });

    client1.connect();
    client2.connect();

    // Mutual peer awareness discovery
    provider1.addPeer({ id: "user-2", name: "Bob", color: "#8b5cf6" });
    provider2.addPeer({ id: "user-1", name: "Alice", color: "#06d6a0" });

    expect(client1.getPeers()).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Bob" })])
    );
    expect(client2.getPeers()).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "Alice" })])
    );

    // Client 1 edits code and syncs to Client 2
    client1.setCode("pub fn start() { let x = 42; }");
    const syncResult = client2.mergeCode(client1.getCode());

    expect(syncResult.changed).toBe(true);
    expect(syncResult.conflict).toBe(false);
    expect(client2.getCode()).toBe("pub fn start() { let x = 42; }");
  });
});

describe("collaboration invite helpers", () => {
  it("creates and reads stable room links", () => {
    const location = { href: "https://quest.example/#/mission/one?foo=bar" };
    const invite = createCollaborationInvite("room one!", location);

    expect(invite).toContain("collab=room-one-");
    expect(readCollaborationRoom({ href: invite })).toBe("room-one-");
  });
});
