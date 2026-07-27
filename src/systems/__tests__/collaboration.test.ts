import { describe, expect, it, vi } from "vitest";
import {
  CollaborationManager,
  createCollaborationInvite,
  readCollaborationRoom,
} from "../collaboration";

function createProviderMock() {
  const handlers = new Map<string, any>();
  const awarenessStates = new Map<string, any>();
  return {
    connected: false,
    awareness: {
      setLocalState: vi.fn(),
      setLocalStateField: vi.fn((key: string, value: any) => {
        const current = awarenessStates.get("local") || {};
        awarenessStates.set("local", { ...current, [key]: value });
      }),
      getStates: vi.fn(() => awarenessStates),
      on: vi.fn((event: string, handler: any) => handlers.set(`awareness:${event}`, handler)),
    },
    on: vi.fn((event: string, handler: any) => handlers.set(event, handler)),
    connect: vi.fn(),
    disconnect: vi.fn(),
    destroy: vi.fn(),
    emitStatus(status: any) {
      handlers.get("status")?.({ status });
    },
    addPeer(peer: any) {
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
    const storage: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
    });
    const first = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      initialCode: "hello",
    });

    first.setCode("saved work");

    const second = new CollaborationManager({
      roomId: "mission-one",
      missionId: "basics",
      initialCode: "hello",
    });

    expect(second.getCode()).toBe("saved work");
  });

  it("handles status, awareness, and peer updates", () => {
    const provider = createProviderMock();
    const manager = new CollaborationManager({
      roomId: "room-1",
      missionId: "basics",
      user: { id: "p1", name: "Alice" },
      providerFactory: () => provider,
    });
    const onStatus = vi.fn();
    const onPeers = vi.fn();

    manager.on("status", onStatus);
    manager.on("peers", onPeers);

    manager.connect();
    provider.emitStatus("connected");
    provider.addPeer({ id: "p2", name: "Bob" });

    expect(manager.getStatus()).toEqual({
      roomId: "room-1",
      connected: true,
      peerCount: 2,
    });
    expect(onStatus).toHaveBeenCalledWith(expect.objectContaining({ connected: true }));
    expect(onPeers).toHaveBeenCalled();
  });

  it("merges remote changes and flags merge conflicts", () => {
    const manager = new CollaborationManager({
      roomId: "room-2",
      missionId: "basics",
      initialCode: "base",
    });
    const onConflict = vi.fn();

    manager.on("conflict", onConflict);

    manager.setCode("base-local");
    const result = manager.mergeCode("base-remote");

    expect(result.conflict).toBe(true);
    expect(manager.getCode()).toBe("base-remote");
    expect(onConflict).toHaveBeenCalledWith(expect.objectContaining({ conflict: true }));
  });
});

describe("collaboration invite helpers", () => {
  it("creates and reads stable room links", () => {
    const location = { href: "https://quest.example/#/mission/one?foo=bar" } as any;
    const invite = createCollaborationInvite("room one!", location);

    expect(invite).toContain("collab=room-one-");
    expect(readCollaborationRoom({ href: invite } as any)).toBe("room-one-");
  });
});
