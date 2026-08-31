import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  ACTIVITY_TYPES,
  logActivity,
  getActivityLog,
  clearLog,
} from "../activityLogger.js";

const LOG_KEY = "soroban_quest_activity_log";

describe("activityLogger", () => {
  let storage;
  let dispatchSpy;

  beforeEach(() => {
    storage = {};

    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key) => storage[key] || null),
      setItem: vi.fn((key, value) => {
        storage[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete storage[key];
      }),
    });

    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
    });

    vi.stubGlobal(
      "CustomEvent",
      class CustomEvent {
        constructor(type, options = {}) {
          this.type = type;
          this.detail = options.detail;
        }
      }
    );

    dispatchSpy = window.dispatchEvent;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("ACTIVITY_TYPES", () => {
    it("exports all expected activity type constants", () => {
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

  describe("logActivity", () => {
    it("creates and persists a new entry with the expected schema", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-02T03:04:05.000Z"));
      vi.spyOn(Math, "random").mockReturnValue(0.123456789);

      logActivity("MISSION_STARTED", { missionId: "m1" }, "Started mission");

      const log = getActivityLog();
      expect(log).toHaveLength(1);
      expect(log[0]).toMatchObject({
        id: expect.any(String),
        timestamp: "2026-01-02T03:04:05.000Z",
        type: "MISSION_STARTED",
        data: { missionId: "m1" },
        message: "Started mission",
      });
      expect(new Date(log[0].timestamp).toISOString()).toBe(log[0].timestamp);
      expect(localStorage.setItem).toHaveBeenCalledWith(LOG_KEY, JSON.stringify(log));

      vi.useRealTimers();
    });

    it("prepends new entries (newest first)", () => {
      logActivity("MISSION_STARTED", {}, "first");
      logActivity("MISSION_COMPLETED", {}, "second");

      const log = getActivityLog();
      expect(log).toHaveLength(2);
      expect(log[0].message).toBe("second");
      expect(log[1].message).toBe("first");
    });

    it("trims the log to a maximum of 200 entries", () => {
      for (let i = 0; i < 210; i++) {
        logActivity("STREAK", { index: i }, `entry ${i}`);
      }

      const log = getActivityLog();
      expect(log).toHaveLength(200);
      expect(log[0].message).toBe("entry 209");
      expect(log.at(-1).message).toBe("entry 10");
      expect(log.some((entry) => entry.message === "entry 9")).toBe(false);
    });

    it("dispatches an activity_logged custom event with the new entry", () => {
      logActivity("BADGE_EARNED", { badge: "Explorer" }, "Badge earned");

      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      const event = dispatchSpy.mock.calls[0][0];
      expect(event.type).toBe("activity_logged");
      expect(event.detail.type).toBe("BADGE_EARNED");
      expect(event.detail.data).toEqual({ badge: "Explorer" });
    });

    it("uses default empty data and message when not provided", () => {
      logActivity("LEVEL_UP");

      const log = getActivityLog();
      expect(log[0].data).toEqual({});
      expect(log[0].message).toBe("");
    });

    it("does not throw when localStorage.setItem fails", () => {
      localStorage.setItem = vi.fn(() => {
        throw new Error("QuotaExceededError");
      });

      expect(() => logActivity("EXPORT", {}, "export")).not.toThrow();
    });
  });

  describe("getActivityLog", () => {
    it("returns an empty array when no log exists", () => {
      expect(getActivityLog()).toEqual([]);
    });

    it("returns the parsed log from localStorage", () => {
      const mockLog = [
        { id: "1", timestamp: "2026-01-01T00:00:00.000Z", type: "STREAK", data: {}, message: "test" },
      ];
      storage[LOG_KEY] = JSON.stringify(mockLog);

      const log = getActivityLog();
      expect(log).toEqual(mockLog);
    });

    it("returns an empty array when stored data is corrupted", () => {
      storage[LOG_KEY] = "not valid json {{{";

      expect(getActivityLog()).toEqual([]);
    });

    it.each([JSON.stringify(null), JSON.stringify({ type: "STREAK" }), JSON.stringify("entry")])(
      "returns an empty array for invalid stored log data: %s",
      (invalidLog) => {
        storage[LOG_KEY] = invalidLog;

        expect(getActivityLog()).toEqual([]);
      }
    );
  });

  describe("clearLog", () => {
    it("removes the log from localStorage", () => {
      logActivity("MISSION_STARTED", {}, "test");
      expect(getActivityLog()).toHaveLength(1);

      clearLog();
      expect(getActivityLog()).toEqual([]);
    });

    it("does not throw when no log exists", () => {
      expect(() => clearLog()).not.toThrow();
    });
  });
});
