import { describe, it, expect } from "vitest";
import {
  xpForLevel,
  getLevelFromXP,
  getXPProgress,
  getRankTitle,
  awardXP,
  completeMission,
  checkBadges,
  getDefaultState,
} from "../gameEngine.js";

describe("gameEngine", () => {
  describe("xpForLevel", () => {
    it("returns 0 for level 1", () => {
      expect(xpForLevel(1)).toBe(0);
    });

    it("returns correct XP for levels 2-10", () => {
      expect(xpForLevel(2)).toBe(500);
      expect(xpForLevel(3)).toBe(1414);
      expect(xpForLevel(4)).toBe(2598);
      expect(xpForLevel(5)).toBe(4000);
      expect(xpForLevel(6)).toBe(5590);
      expect(xpForLevel(7)).toBe(7348);
      expect(xpForLevel(8)).toBe(9260);
      expect(xpForLevel(9)).toBe(11313);
      expect(xpForLevel(10)).toBe(13500);
    });
  });

  describe("getLevelFromXP", () => {
    it("returns level 1 for 0 XP", () => {
      expect(getLevelFromXP(0)).toBe(1);
    });

    it("returns level 1 for XP less than level 2 threshold", () => {
      expect(getLevelFromXP(499)).toBe(1);
    });

    it("returns level 2 for XP at level 2 threshold", () => {
      expect(getLevelFromXP(500)).toBe(2);
    });

    it("returns correct levels for various XP amounts", () => {
      expect(getLevelFromXP(1413)).toBe(2);
      expect(getLevelFromXP(1414)).toBe(3);
      expect(getLevelFromXP(2597)).toBe(3);
      expect(getLevelFromXP(2598)).toBe(4);
    });
  });

  describe("getXPProgress", () => {
    it("returns correct progress for level 1", () => {
      const state = { level: 1, xp: 250 };
      const progress = getXPProgress(state);
      expect(progress.current).toBe(250);
      expect(progress.needed).toBe(500);
      expect(progress.percentage).toBe(50);
    });

    it("returns 100% at level boundary", () => {
      const state = { level: 1, xp: 500 };
      const progress = getXPProgress(state);
      expect(progress.percentage).toBe(100);
    });

    it("returns correct progress for higher levels", () => {
      const state = { level: 2, xp: 1707 }; // 500 + 1207, so 1207/914 = ~132%, but capped at 100
      const progress = getXPProgress(state);
      expect(progress.current).toBe(1207);
      expect(progress.needed).toBe(914);
      expect(progress.percentage).toBe(100); // capped
    });
  });

  describe("getRankTitle", () => {
    it("returns correct ranks for specific levels", () => {
      expect(getRankTitle(1)).toBe("Initiate");
      expect(getRankTitle(3)).toBe("Scribe");
      expect(getRankTitle(5)).toBe("Architect");
      expect(getRankTitle(7)).toBe("Guardian");
      expect(getRankTitle(10)).toBe("Luminary");
      expect(getRankTitle(15)).toBe("Stellar Sovereign");
    });
  });

  describe("awardXP", () => {
    it("adds XP without leveling up", () => {
      const state = { xp: 0, level: 1 };
      const newState = awardXP(state, 100);
      expect(newState.xp).toBe(100);
      expect(newState.level).toBe(1);
      expect(newState.leveledUp).toBe(false);
    });

    it("adds XP and levels up", () => {
      const state = { xp: 400, level: 1 };
      const newState = awardXP(state, 100);
      expect(newState.xp).toBe(500);
      expect(newState.level).toBe(2);
      expect(newState.leveledUp).toBe(true);
    });

    it("maintains state immutability", () => {
      const state = { xp: 0, level: 1 };
      const newState = awardXP(state, 100);
      expect(state.xp).toBe(0);
      expect(newState).not.toBe(state);
    });
  });

  describe("completeMission", () => {
    it("completes a new mission and awards XP", () => {
      const state = getDefaultState();
      const newState = completeMission(state, "mission1", 100);
      expect(newState.completedMissions).toContain("mission1");
      expect(newState.xp).toBe(100);
    });

    it("prevents duplicate mission completion", () => {
      const state = { ...getDefaultState(), completedMissions: ["mission1"] };
      const newState = completeMission(state, "mission1", 100);
      expect(newState.alreadyCompleted).toBe(true);
      expect(newState.xp).toBe(0);
    });

    it("tracks first try missions", () => {
      const state = getDefaultState();
      const newState = completeMission(state, "mission1", 100);
      expect(newState.firstTryMissions).toContain("mission1");
    });
  });

  describe("checkBadges", () => {
    it("awards first_contract badge after first mission", () => {
      const state = { ...getDefaultState(), completedMissions: ["mission1"] };
      const newState = checkBadges(state);
      expect(newState.newBadges).toContain("first_contract");
      expect(newState.badges).toContain("first_contract");
    });

    it("awards multiple badges when conditions met", () => {
      const state = {
        ...getDefaultState(),
        completedMissions: ["m1", "m2", "m3", "m4", "m5"],
        level: 3,
        xp: 1000,
      };
      const newState = checkBadges(state);
      expect(newState.newBadges.length).toBeGreaterThanOrEqual(2);
    });

    it("does not award already earned badges", () => {
      const state = {
        ...getDefaultState(),
        completedMissions: ["mission1"],
        badges: ["first_contract"],
      };
      const newState = checkBadges(state);
      expect(newState.newBadges).not.toContain("first_contract");
    });
  });
});
