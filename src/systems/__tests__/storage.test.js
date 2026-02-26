import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  loadProgress,
  saveProgress,
  resetProgress,
  getDefaultState,
} from "../gameEngine.js";
import {
  loadProgress as load,
  saveProgress as save,
  resetProgress as reset,
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
});
