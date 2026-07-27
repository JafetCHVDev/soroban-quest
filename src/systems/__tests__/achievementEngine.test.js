import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the activity logger to avoid browser/localStorage/window side-effects
vi.mock("../activityLogger", () => {
  return {
    logActivity: () => {},
    ACTIVITY_TYPES: {
      BADGE_EARNED: "BADGE_EARNED",
    },
  };
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

globalThis.localStorage = localStorageMock;

import {
  loadAchievementState,
  saveAchievementState,
  isAchievementUnlocked,
  getAchievementProgress,
  checkAchievements,
  getAllAchievements,
  getAchievementsByCategory,
  resetAchievementState,
  getAchievementStats,
} from "../achievementEngine";
import { ACHIEVEMENTS } from "../../data/achievements";

describe("achievementEngine", () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
  });

  const baseGameState = {
    xp: 0,
    level: 1,
    completedMissions: [],
    firstTryMissions: [],
    streak: 0,
  };

  describe("loadAchievementState", () => {
    it("returns default state when localStorage is empty", () => {
      localStorageMock.getItem.mockReturnValue(null);
      const state = loadAchievementState();
      expect(state).toEqual({
        unlocked: [],
        progress: {},
        lastUpdated: null,
      });
    });

    it("loads saved state from localStorage", () => {
      const savedState = {
        unlocked: ["first_steps"],
        progress: {},
        lastUpdated: "2024-01-01T00:00:00.000Z",
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      const state = loadAchievementState();
      expect(state.unlocked).toEqual(["first_steps"]);
      expect(state.lastUpdated).toBe("2024-01-01T00:00:00.000Z");
    });

    it("handles corrupted localStorage data gracefully", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");
      const state = loadAchievementState();
      expect(state).toEqual({
        unlocked: [],
        progress: {},
        lastUpdated: null,
      });
    });
  });

  describe("saveAchievementState", () => {
    it("saves state to localStorage with timestamp", () => {
      const state = {
        unlocked: ["first_steps"],
        progress: {},
        lastUpdated: null,
      };
      saveAchievementState(state);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "soroban_quest_achievements",
        expect.stringContaining("first_steps")
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "soroban_quest_achievements",
        expect.stringContaining("lastUpdated")
      );
    });

    it("handles save errors gracefully", () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });
      const state = { unlocked: [], progress: {}, lastUpdated: null };
      expect(() => saveAchievementState(state)).not.toThrow();
    });
  });

  describe("isAchievementUnlocked", () => {
    it("returns false for non-existent achievement", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      expect(isAchievementUnlocked("non_existent")).toBe(false);
    });

    it("returns false for locked achievement", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      expect(isAchievementUnlocked("first_steps")).toBe(false);
    });

    it("returns true for unlocked achievement", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ unlocked: ["first_steps"], progress: {}, lastUpdated: null })
      );
      expect(isAchievementUnlocked("first_steps")).toBe(true);
    });
  });

  describe("getAchievementProgress", () => {
    it("returns 1 for already unlocked achievement", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ unlocked: ["first_steps"], progress: {}, lastUpdated: null })
      );
      const progress = getAchievementProgress("first_steps", baseGameState, 10);
      expect(progress).toBe(1);
    });

    it("returns 0 for achievement with no progress", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const progress = getAchievementProgress("first_steps", baseGameState, 10);
      expect(progress).toBe(0);
    });

    it("calculates progress for missions_completed", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: ["m1", "m2", "m3"] };
      const progress = getAchievementProgress("apprentice", gameState, 10);
      expect(progress).toBe(0.6); // 3/5 missions
    });

    it("calculates progress for total_xp", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, xp: 250 };
      const progress = getAchievementProgress("xp_collector", gameState, 10);
      expect(progress).toBe(0.5); // 250/500 XP
    });

    it("calculates progress for level", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, level: 2 };
      const progress = getAchievementProgress("level_up", gameState, 10);
      expect(progress).toBeCloseTo(0.667, 2); // 2/3 level
    });

    it("calculates progress for first_try_missions", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, firstTryMissions: ["m1", "m2"] };
      const progress = getAchievementProgress("speed_demon", gameState, 10);
      expect(progress).toBeCloseTo(0.667, 2); // 2/3 first tries
    });

    it("calculates progress for streak", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, streak: 5 };
      const progress = getAchievementProgress("dedicated", gameState, 10);
      expect(progress).toBeCloseTo(0.714, 2); // 5/7 streak
    });

    it("caps progress at 1", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: ["m1", "m2", "m3", "m4", "m5", "m6"] };
      const progress = getAchievementProgress("apprentice", gameState, 10);
      expect(progress).toBe(1);
    });
  });

  describe("checkAchievements", () => {
    it("unlocks achievements when conditions are met", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: ["m1"] };
      const result = checkAchievements(gameState, 10);
      expect(result.newlyUnlocked).toHaveLength(1);
      expect(result.newlyUnlocked[0].id).toBe("first_steps");
    });

    it("does not unlock already unlocked achievements", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ unlocked: ["first_steps"], progress: {}, lastUpdated: null })
      );
      const gameState = { ...baseGameState, completedMissions: ["m1"] };
      const result = checkAchievements(gameState, 10);
      expect(result.newlyUnlocked).toHaveLength(0);
    });

    it("unlocks multiple achievements at once", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = {
        ...baseGameState,
        completedMissions: ["m1", "m2", "m3", "m4", "m5"],
        xp: 600,
        level: 3,
      };
      const result = checkAchievements(gameState, 10);
      expect(result.newlyUnlocked.length).toBeGreaterThan(1);
    });

    it("handles 'all' missions condition correctly", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: ["m1", "m2", "m3", "m4", "m5"] };
      const result = checkAchievements(gameState, 5);
      expect(result.newlyUnlocked.some((a) => a.id === "master")).toBe(true);
    });

    it("returns statistics", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const result = checkAchievements(baseGameState, 10);
      expect(result.totalUnlocked).toBeDefined();
      expect(result.totalAchievements).toBe(ACHIEVEMENTS.length);
    });

    it("saves state when new achievements are unlocked", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: ["m1"] };
      checkAchievements(gameState, 10);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe("getAllAchievements", () => {
    it("returns all achievements with unlock status", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ unlocked: ["first_steps"], progress: {}, lastUpdated: null })
      );
      const all = getAllAchievements(baseGameState, 10);
      expect(all).toHaveLength(ACHIEVEMENTS.length);
      expect(all[0].isUnlocked).toBe(true);
    });

    it("includes progress for each achievement", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: ["m1", "m2"] };
      const all = getAllAchievements(gameState, 10);
      all.forEach((achievement) => {
        expect(typeof achievement.progress).toBe("number");
        expect(achievement.progress).toBeGreaterThanOrEqual(0);
        expect(achievement.progress).toBeLessThanOrEqual(1);
      });
    });
  });

  describe("getAchievementsByCategory", () => {
    it("filters achievements by category", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const missions = getAchievementsByCategory("missions", baseGameState, 10);
      missions.forEach((achievement) => {
        expect(achievement.category).toBe("missions");
      });
    });

    it("returns empty array for non-existent category", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const result = getAchievementsByCategory("non_existent", baseGameState, 10);
      expect(result).toEqual([]);
    });
  });

  describe("resetAchievementState", () => {
    it("clears localStorage and returns default state", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ unlocked: ["first_steps"], progress: {}, lastUpdated: null })
      );
      const state = resetAchievementState();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("soroban_quest_achievements");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("soroban_quest_achievements_progress");
      expect(state).toEqual({
        unlocked: [],
        progress: {},
        lastUpdated: null,
      });
    });

    it("handles reset errors gracefully", () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error("Storage error");
      });
      expect(() => resetAchievementState()).not.toThrow();
    });
  });

  describe("getAchievementStats", () => {
    it("returns correct statistics", () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({ unlocked: ["first_steps", "apprentice"], progress: {}, lastUpdated: null })
      );
      const stats = getAchievementStats();
      expect(stats.total).toBe(ACHIEVEMENTS.length);
      expect(stats.unlocked).toBe(2);
      expect(stats.locked).toBe(ACHIEVEMENTS.length - 2);
      expect(stats.percentage).toBe(Math.round((2 / ACHIEVEMENTS.length) * 100));
    });

    it("handles empty state", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const stats = getAchievementStats();
      expect(stats.total).toBe(ACHIEVEMENTS.length);
      expect(stats.unlocked).toBe(0);
      expect(stats.locked).toBe(ACHIEVEMENTS.length);
      expect(stats.percentage).toBe(0);
    });
  });

  describe("condition evaluation edge cases", () => {
    it("handles unknown condition types gracefully", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState };
      const result = checkAchievements(gameState, 10);
      // Should not throw, just skip unknown conditions
      expect(result).toBeDefined();
    });

    it("handles missing game state properties", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const incompleteState = { xp: 100 };
      const result = checkAchievements(incompleteState, 10);
      expect(result).toBeDefined();
    });

    it("handles zero total missions", () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ unlocked: [], progress: {}, lastUpdated: null }));
      const gameState = { ...baseGameState, completedMissions: [] };
      const result = checkAchievements(gameState, 0);
      expect(result).toBeDefined();
    });
  });
});
