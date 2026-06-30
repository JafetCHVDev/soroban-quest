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
});
