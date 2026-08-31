import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getDefaultState,
} from "../gameEngine.js";
import {
  loadProgress as load,
  saveProgress as save,
  resetProgress as reset,
  loadProfiles,
  addProfile,
  setActiveProfileId,
  loadProfile,
  saveProfile,
  mergeProgress,
  summarizeMerge,
  MAX_PROFILES,
} from "../storage.js";

describe("storage", () => {
  let storage;

  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] || null,
      setItem: (key, value) => {
        storage[key] = value;
      },
      removeItem: (key) => {
        delete storage[key];
      },
    });
  });

  describe("saveProgress", () => {
    it("saves progress to localStorage", () => {
      const state = {
        xp: 100,
        level: 2,
        completedMissions: ["mission1"],
        badges: ["first_contract"],
        leveledUp: true, // should be excluded
        newBadges: ["test"], // should be excluded
      };
      save(state);
      const saved = JSON.parse(storage["soroban_quest_progress"]);
      expect(saved.xp).toBe(100);
      expect(saved.level).toBe(2);
      expect(saved.completedMissions).toEqual(["mission1"]);
      expect(saved.badges).toEqual(["first_contract"]);
      expect(saved.leveledUp).toBeUndefined();
      expect(saved.newBadges).toBeUndefined();
    });
  });

  describe("loadProgress", () => {
    it("returns default state when no data exists", () => {
      const state = load();
      expect(state).toEqual(getDefaultState());
    });

    it("loads and merges saved progress", () => {
      const savedState = {
        xp: 200,
        level: 3,
        completedMissions: ["mission1", "mission2"],
      };
      storage["soroban_quest_progress"] = JSON.stringify(savedState);
      const state = load();
      expect(state.xp).toBe(200);
      expect(state.level).toBe(3);
      expect(state.completedMissions).toEqual(["mission1", "mission2"]);
      // Should have default values for missing properties
      expect(state.badges).toEqual([]);
    });

    it("returns default state when data is corrupted", () => {
      storage["soroban_quest_progress"] = "invalid json";
      const state = load();
      expect(state).toEqual(getDefaultState());
    });
  });

  describe("resetProgress", () => {
    it("clears localStorage and returns default state", () => {
      storage["soroban_quest_progress"] = JSON.stringify({ xp: 1000 });
      const state = reset();
      expect(state).toEqual(getDefaultState());
      expect(storage["soroban_quest_progress"]).toBeUndefined();
    });
  });

  describe("profiles", () => {
    it("migrates legacy profile and progress into the first profile slot", () => {
      storage["soroban_quest_profile"] = JSON.stringify({
        name: "Legacy Player",
        avatar: "A",
      });
      storage["soroban_quest_progress"] = JSON.stringify({
        xp: 900,
        level: 3,
      });

      const profiles = loadProfiles();

      expect(profiles).toHaveLength(1);
      expect(profiles[0].profile.name).toBe("Legacy Player");
      expect(profiles[0].profile.avatar).toBe("A");
      expect(profiles[0].progress.xp).toBe(900);
      expect(profiles[0].progress.level).toBe(3);
    });

    it("loads and saves data for the active profile", () => {
      const profiles = loadProfiles();
      addProfile({ name: "Second Player", avatar: "B" });
      const secondProfile = loadProfiles()[1];

      setActiveProfileId(secondProfile.id);
      saveProfile({ name: "Pilot", avatar: "C" });
      save({ xp: 1200, level: 4, completedMissions: ["m1"] });

      expect(loadProfile().name).toBe("Pilot");
      expect(load().xp).toBe(1200);
      expect(load().completedMissions).toEqual(["m1"]);
      expect(loadProfiles()[0].id).toBe(profiles[0].id);
      expect(loadProfiles()[0].progress.xp).toBe(0);
    });

    it("syncs legacy progress writes after profiles have been initialized", () => {
      loadProfiles();
      storage["soroban_quest_progress"] = JSON.stringify({
        completedMissions: ["hello-soroban"],
        xp: 100,
        level: 1,
        badges: [],
        streak: 5,
        lastLogin: "2026-06-28",
      });

      const state = load();
      const activeProfile = loadProfiles()[0];

      expect(state.xp).toBe(100);
      expect(state.streak).toBe(5);
      expect(activeProfile.progress.xp).toBe(100);
      expect(activeProfile.progress.streak).toBe(5);
    });

    it("limits local profiles to five slots", () => {
      for (let i = 0; i < MAX_PROFILES + 2; i++) {
        addProfile({ name: `Player ${i}` });
      }

      expect(loadProfiles()).toHaveLength(MAX_PROFILES);
    });
  });

  describe("mergeProgress", () => {
    it("takes the max of numeric fields (xp, gold, streak)", () => {
      const local = { ...getDefaultState(), xp: 5100, gold: 300, streak: 7 };
      const imported = { ...getDefaultState(), xp: 4200, gold: 500, streak: 3 };

      const merged = mergeProgress(local, imported);

      expect(merged.xp).toBe(5100);
      expect(merged.gold).toBe(500);
      expect(merged.streak).toBe(7);
    });

    it("keeps level consistent with the merged xp total", () => {
      const local = { ...getDefaultState(), xp: 0, level: 1 };
      const imported = { ...getDefaultState(), xp: 5000, level: 4 };

      const merged = mergeProgress(local, imported);

      expect(merged.xp).toBe(5000);
      // Level must reflect the merged XP, never a stale/lower value.
      expect(merged.level).toBeGreaterThanOrEqual(4);
    });

    it("unions set-like fields without duplicates", () => {
      const local = {
        ...getDefaultState(),
        completedMissions: ["m1", "m2"],
        badges: ["b1"],
        purchasedItems: ["xp-boost"],
      };
      const imported = {
        ...getDefaultState(),
        completedMissions: ["m2", "m3"],
        badges: ["b1", "b2"],
        purchasedItems: ["streak-freeze"],
      };

      const merged = mergeProgress(local, imported);

      expect(merged.completedMissions.sort()).toEqual(["m1", "m2", "m3"]);
      expect(merged.badges.sort()).toEqual(["b1", "b2"]);
      expect(merged.purchasedItems.sort()).toEqual(["streak-freeze", "xp-boost"]);
    });

    it("takes the higher attempt count per mission", () => {
      const local = { ...getDefaultState(), missionAttempts: { m1: 3, m2: 1 } };
      const imported = { ...getDefaultState(), missionAttempts: { m1: 2, m3: 5 } };

      const merged = mergeProgress(local, imported);

      expect(merged.missionAttempts).toEqual({ m1: 3, m2: 1, m3: 5 });
    });

    it("ORs boolean flags so a used flag stays used", () => {
      const local = { ...getDefaultState(), streakFreezeUsed: false, xpBoostActive: true };
      const imported = { ...getDefaultState(), streakFreezeUsed: true, xpBoostActive: false };

      const merged = mergeProgress(local, imported);

      expect(merged.streakFreezeUsed).toBe(true);
      expect(merged.xpBoostActive).toBe(true);
    });

    it("keeps the most recent lastLogin", () => {
      const local = { ...getDefaultState(), lastLogin: "2026-08-01T00:00:00Z" };
      const imported = { ...getDefaultState(), lastLogin: "2026-08-20T00:00:00Z" };

      expect(mergeProgress(local, imported).lastLogin).toBe("2026-08-20T00:00:00Z");
      expect(mergeProgress(imported, local).lastLogin).toBe("2026-08-20T00:00:00Z");
    });

    it("dedupes append-only log entries by timestamp", () => {
      const local = {
        ...getDefaultState(),
        activityLog: [
          { timestamp: 1, message: "a" },
          { timestamp: 2, message: "b" },
        ],
      };
      const imported = {
        ...getDefaultState(),
        activityLog: [
          { timestamp: 2, message: "b" },
          { timestamp: 3, message: "c" },
        ],
      };

      const merged = mergeProgress(local, imported);

      expect(merged.activityLog.map((e) => e.timestamp)).toEqual([1, 2, 3]);
    });

    it("does not mutate its inputs", () => {
      const local = { ...getDefaultState(), xp: 100, completedMissions: ["m1"] };
      const imported = { ...getDefaultState(), xp: 200, completedMissions: ["m2"] };

      mergeProgress(local, imported);

      expect(local.xp).toBe(100);
      expect(local.completedMissions).toEqual(["m1"]);
      expect(imported.completedMissions).toEqual(["m2"]);
    });

    it("handles missing/partial inputs gracefully", () => {
      const merged = mergeProgress(null, { xp: 50 });
      expect(merged.xp).toBe(50);
      expect(merged.completedMissions).toEqual([]);
    });
  });

  describe("summarizeMerge", () => {
    it("reports before/after values and count deltas", () => {
      const local = {
        ...getDefaultState(),
        xp: 4200,
        completedMissions: ["m1", "m2"],
        badges: ["b1"],
      };
      const imported = {
        ...getDefaultState(),
        xp: 5100,
        completedMissions: ["m2", "m3", "m4"],
        badges: ["b1", "b2"],
      };

      const summary = summarizeMerge(local, imported);

      expect(summary.xp).toEqual({ before: 4200, after: 5100 });
      expect(summary.completedMissions).toEqual({ before: 2, after: 4, added: 2 });
      expect(summary.badges).toEqual({ before: 1, after: 2, added: 1 });
    });
  });
});
