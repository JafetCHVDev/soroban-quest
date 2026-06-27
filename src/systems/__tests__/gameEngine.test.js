import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock the activity logger to avoid browser/localStorage/window side-effects
vi.mock("../activityLogger", () => {
  return {
    logActivity: () => {},
    ACTIVITY_TYPES: {
      LEVEL_UP: "LEVEL_UP",
      MISSION_COMPLETED: "MISSION_COMPLETED",
      BADGE_EARNED: "BADGE_EARNED",
      STREAK: "STREAK",
    },
  };
});

import {
  xpForLevel,
  xpForNextLevel,
  getLevelFromXP,
  getRankTitle,
  getXPProgress,
  awardXP,
  completeMission,
  recordAttempt,
  checkBadges,
  updateStreak,
  getDefaultState,
  BADGES,
} from "../gameEngine";

describe("gameEngine core logic", () => {
  let baseState;

  beforeEach(() => {
    baseState = getDefaultState();
  });

  describe("xpForLevel", () => {
    it("returns 0 for level 0", () => {
      expect(xpForLevel(0)).toBe(0);
    });

    it("returns 0 for level 1", () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it("is monotonic increasing", () => {
      for (let i = 2; i <= 50; i++) {
        expect(xpForLevel(i)).toBeGreaterThanOrEqual(xpForLevel(i - 1));
      }
    });

    it("handles negative levels gracefully", () => {
      expect(xpForLevel(-5)).toBe(0);
    });

    it("computes a large level (100) without throwing", () => {
      expect(typeof xpForLevel(100)).toBe("number");
      expect(xpForLevel(100)).toBeGreaterThan(0);
    });
  });

  describe("getLevelFromXP", () => {
    it("returns level 1 for XP = 0", () => {
      expect(getLevelFromXP(0)).toBe(1);
    });

    it("returns the correct level at boundary values", () => {
      const level2Min = xpForLevel(2);
      expect(getLevelFromXP(level2Min - 1)).toBe(1);
      expect(getLevelFromXP(level2Min)).toBe(2);
    });

    it("handles very large XP values", () => {
      const bigXP = xpForLevel(15) + 5000;
      expect(getLevelFromXP(bigXP)).toBeGreaterThanOrEqual(15);
    });

    it("handles negative XP by returning level 1", () => {
      expect(getLevelFromXP(-1000)).toBe(1);
    });
  });

  describe("awardXP", () => {
    it("increases XP correctly without level up", () => {
      const s = { ...baseState, xp: 100, level: 1 };
      const newState = awardXP(s, 50);
      expect(newState.xp).toBe(150);
      expect(newState.leveledUp).toBe(false);
      expect(newState.level).toBe(1);
    });

    it("detects a single level up", () => {
      const startXP = xpForLevel(2) - 5; // just below level 2
      const s = { ...baseState, xp: startXP, level: 1 };
      const newState = awardXP(s, 10);
      expect(newState.level).toBeGreaterThan(1);
      expect(newState.leveledUp).toBe(true);
    });

    it("handles multiple level-ups in one award", () => {
      const s = { ...baseState, xp: 0, level: 1 };
      // award enough XP to reach level 4
      const targetXP = xpForLevel(4) + 10;
      const newState = awardXP(s, targetXP);
      expect(newState.level).toBeGreaterThanOrEqual(4);
      expect(newState.leveledUp).toBe(true);
    });

    it("zero XP award leaves state unchanged (except leveledUp false)", () => {
      const s = { ...baseState, xp: 200, level: 1 };
      const newState = awardXP(s, 0);
      expect(newState.xp).toBe(200);
      expect(newState.level).toBe(1);
      expect(newState.leveledUp).toBe(false);
    });

    it("handles negative XP (reduces xp and level may drop)", () => {
      const s = { ...baseState, xp: xpForLevel(3) + 50, level: 3 };
      const newState = awardXP(s, -2000);
      expect(newState.xp).toBeLessThan(s.xp);
      expect(newState.level).toBeGreaterThanOrEqual(1);
      expect(newState.leveledUp).toBe(false);
    });
  });

  describe("completeMission & recordAttempt", () => {
    it("first-time completion grants XP and records mission", () => {
      const s = { ...baseState, xp: 0, level: 1, missionAttempts: {} };
      const newState = completeMission(s, "m1", 42);
      expect(newState.completedMissions).toContain("m1");
      expect(newState.xp).toBeGreaterThanOrEqual(42);
      expect(newState.firstTryMissions).toContain("m1");
      expect(newState.alreadyCompleted).toBeUndefined();
    });

    it("duplicate completion returns alreadyCompleted and doesn't grant XP", () => {
      const s1 = completeMission({ ...baseState, xp: 0, missionAttempts: {} }, "m2", 10);
      const s2 = completeMission(s1, "m2", 10);
      expect(s2.alreadyCompleted).toBe(true);
      expect(s2.xp).toBe(s1.xp);
    });

    it("tracks firstTryMissions correctly when attempts > 1", () => {
      const s = { ...baseState, missionAttempts: { m3: 2 } };
      const newState = completeMission(s, "m3", 10);
      expect(newState.completedMissions).toContain("m3");
      expect(newState.firstTryMissions).not.toContain("m3");
    });

    it("recordAttempt increments attempts counter", () => {
      const s = { ...baseState, missionAttempts: {} };
      const s1 = recordAttempt(s, "mX");
      expect(s1.missionAttempts["mX"]).toBe(1);
      const s2 = recordAttempt(s1, "mX");
      expect(s2.missionAttempts["mX"]).toBe(2);
    });
  });

  describe("updateStreak", () => {
    it("first login initializes streak to 1", () => {
      const s = { ...baseState, lastLogin: null, streak: 0 };
      const out = updateStreak(s);
      expect(out.streak).toBe(1);
      expect(out.lastLogin).toBeDefined();
    });

    it("same-day login does not increase streak", () => {
      const initial = updateStreak({ ...baseState, lastLogin: null, streak: 0 });
      const again = updateStreak(initial);
      expect(again.streak).toBe(initial.streak);
      expect(again.lastLogin).toBe(initial.lastLogin);
    });

    it("consecutive-day login increases streak", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const state = { ...baseState, lastLogin: yesterday.toISOString(), streak: 1 };
      const out = updateStreak(state);
      expect(out.streak).toBeGreaterThanOrEqual(2);
    });

    it("missed-day resets streak to 1", () => {
      const today = new Date();
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);
      const state = { ...baseState, lastLogin: twoDaysAgo.toISOString(), streak: 5 };
      const out = updateStreak(state);
      expect(out.streak).toBe(1);
    });

    it("invalid lastLogin is treated as new login and sets streak to 1", () => {
      const state = { ...baseState, lastLogin: "not-a-date", streak: 10 };
      const out = updateStreak(state);
      expect(out.streak).toBe(1);
    });
  });

  describe("checkBadges", () => {
    it("unlocks badges based on completed missions", () => {
      const s = { ...baseState, completedMissions: ["a", "b", "c"], badges: [] };
      const out = checkBadges(s);
      // should unlock at least first_contract and triple_threat
      expect(out.newBadges).toEqual(expect.arrayContaining(["first_contract", "triple_threat"]));
      expect(out.badges).toEqual(expect.arrayContaining(out.newBadges));
    });

    it("does not duplicate badges when called twice", () => {
      const s = { ...baseState, completedMissions: ["a"], badges: [] };
      const first = checkBadges(s);
      const second = checkBadges(first);
      expect(second.newBadges).toEqual([]);
      expect(second.badges).toEqual(first.badges);
    });

    it("unlocks multiple badges at once for high-achievement state", () => {
      const s = {
        ...baseState,
        completedMissions: ["a", "b", "c", "d", "e"],
        badges: [],
        level: 5,
        xp: 1200,
        firstTryMissions: ["a"],
      };
      const out = checkBadges(s);
      // expect several badges to be present
      expect(out.badges.length).toBeGreaterThanOrEqual(3);
    });

    it("works with an empty/initial state", () => {
      const s = getDefaultState();
      const out = checkBadges(s);
      expect(Array.isArray(out.badges)).toBe(true);
      expect(Array.isArray(out.newBadges)).toBe(true);
    });
  });

  describe("utility getters", () => {
    it("getRankTitle returns expected strings", () => {
      expect(getRankTitle(1)).toBeDefined();
      expect(getRankTitle(100)).toBeDefined();
    });

    it("getXPProgress returns a bounded percentage and numbers", () => {
      const s = { ...baseState, xp: xpForLevel(2) + 25, level: 2 };
      const p = getXPProgress(s);
      expect(p.current).toBeGreaterThanOrEqual(0);
      expect(p.needed).toBeGreaterThan(0);
      expect(p.percentage).toBeGreaterThanOrEqual(0);
      expect(p.percentage).toBeLessThanOrEqual(100);
    });
  });
});

