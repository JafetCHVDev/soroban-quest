import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  logActivity,
  getActivityLog,
  clearLog,
  ACTIVITY_TYPES,
} from "../activityLogger.js";

describe("activityLogger", () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => (storage[key] !== undefined ? storage[key] : null),
      setItem: (key, value) => {
        storage[key] = value;
      },
      removeItem: (key) => {
        delete storage[key];
      },
    });
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
    });
    vi.stubGlobal("console", { error: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("logActivity", () => {
    it("adds an entry with correct structure", () => {
      logActivity(ACTIVITY_TYPES.MISSION_COMPLETED, { missionId: "hello-soroban" }, "Completed Hello Soroban");

      const log = getActivityLog();
      expect(log).toHaveLength(1);

      const entry = log[0];
      expect(entry).toHaveProperty("id");
      expect(typeof entry.id).toBe("string");
      expect(entry).toHaveProperty("timestamp");
      expect(typeof entry.timestamp).toBe("string");
      expect(entry.type).toBe("MISSION_COMPLETED");
      expect(entry.data).toEqual({ missionId: "hello-soroban" });
      expect(entry.message).toBe("Completed Hello Soroban");
    });

    it("prepends new entries to show newest first", () => {
      logActivity(ACTIVITY_TYPES.MISSION_STARTED, {}, "First");
      logActivity(ACTIVITY_TYPES.MISSION_COMPLETED, {}, "Second");

      const log = getActivityLog();
      expect(log).toHaveLength(2);
      expect(log[0].message).toBe("Second");
      expect(log[1].message).toBe("First");
    });

    it("dispatches activity_logged custom event", () => {
      logActivity(ACTIVITY_TYPES.LEVEL_UP, { level: 5 }, "Reached level 5");

      expect(window.dispatchEvent).toHaveBeenCalledTimes(1);
      const event = window.dispatchEvent.mock.calls[0][0];
      expect(event.type).toBe("activity_logged");
      expect(event.detail.type).toBe("LEVEL_UP");
      expect(event.detail.data).toEqual({ level: 5 });
    });

    it("handles missing data and message defaults", () => {
      logActivity(ACTIVITY_TYPES.BADGE_EARNED);

      const log = getActivityLog();
      expect(log).toHaveLength(1);
      expect(log[0].data).toEqual({});
      expect(log[0].message).toBe("");
    });

    it("does not break when localStorage throws", () => {
      storage = {};
      vi.stubGlobal("localStorage", {
        getItem: () => { throw new Error("boom"); },
        setItem: () => { throw new Error("boom"); },
        removeItem: () => {},
      });

      expect(() => {
        logActivity(ACTIVITY_TYPES.MISSION_STARTED, {}, "test");
      }).not.toThrow();

      expect(getActivityLog()).toEqual([]);
    });
  });

  describe("getActivityLog", () => {
    it("returns empty array when no log exists", () => {
      const log = getActivityLog();
      expect(log).toEqual([]);
    });

    it("returns empty array when localStorage data is corrupted", () => {
      storage["soroban_quest_activity_log"] = "not valid json";
      const log = getActivityLog();
      expect(log).toEqual([]);
    });

    it("merges previous entries with new ones across calls", () => {
      logActivity(ACTIVITY_TYPES.EXPORT, {}, "Export 1");
      logActivity(ACTIVITY_TYPES.EXPORT, {}, "Export 2");

      const log = getActivityLog();
      expect(log).toHaveLength(2);
    });
  });

  describe("ring buffer overflow", () => {
    it("removes oldest entries when exceeding MAX_LOG_SIZE (200)", () => {
      for (let i = 0; i < 205; i++) {
        logActivity(ACTIVITY_TYPES.MISSION_STARTED, { idx: i }, `Entry ${i}`);
      }

      const log = getActivityLog();
      expect(log).toHaveLength(200);
      // Newest entry should be idx 204
      expect(log[0].data.idx).toBe(204);
      // Oldest kept entry should be idx 5 (since 0-4 were dropped)
      expect(log[199].data.idx).toBe(5);
    });
  });

  describe("clearLog", () => {
    it("removes all entries from localStorage", () => {
      logActivity(ACTIVITY_TYPES.MISSION_COMPLETED, {}, "test");
      clearLog();

      const log = getActivityLog();
      expect(log).toEqual([]);
    });

    it("is safe to call when no log exists", () => {
      expect(() => clearLog()).not.toThrow();
      expect(getActivityLog()).toEqual([]);
    });
  });

  describe("ACTIVITY_TYPES", () => {
    it("defines all expected activity types", () => {
      expect(ACTIVITY_TYPES).toEqual({
        MISSION_STARTED: "MISSION_STARTED",
        MISSION_COMPLETED: "MISSION_COMPLETED",
        BADGE_EARNED: "BADGE_EARNED",
        LEVEL_UP: "LEVEL_UP",
        HINT_USED: "HINT_USED",
        EXPORT: "EXPORT",
        IMPORT: "IMPORT",
        STREAK: "STREAK",
        GOLD_EARNED: "GOLD_EARNED",
        SHOP_PURCHASE: "SHOP_PURCHASE",
      });
    });
  });
});
