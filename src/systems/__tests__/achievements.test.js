import { describe, it, expect, vi } from "vitest";

vi.mock("../activityLogger", () => ({
  logActivity: () => {},
  ACTIVITY_TYPES: {
    LEVEL_UP: "LEVEL_UP",
    MISSION_COMPLETED: "MISSION_COMPLETED",
    BADGE_EARNED: "BADGE_EARNED",
    STREAK: "STREAK",
    GOLD_EARNED: "GOLD_EARNED",
  },
}));

import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  evaluateAchievements,
  isConditionMet,
  normalizeAchievementIds,
} from "../achievements";
import { getMissionCatalog, getAllMissions } from "../missionLoader";
import { checkBadges, getDefaultState } from "../gameEngine";
import en from "../../i18n/locales/en.json";
import es from "../../i18n/locales/es.json";
import fr from "../../i18n/locales/fr.json";
import ja from "../../i18n/locales/ja.json";
import zhCN from "../../i18n/locales/zh-CN.json";

const ids = (list) => list.map((a) => a.id);
const getAchievementById = (id) => ACHIEVEMENTS.find((a) => a.id === id);

describe("achievements (unified model)", () => {
  describe("definitions", () => {
    it("has unique ids and no id collides with another entry's legacy id", () => {
      const all = ids(ACHIEVEMENTS);
      expect(new Set(all).size).toBe(all.length);

      const legacy = ACHIEVEMENTS.flatMap((a) => a.legacyIds ?? []);
      expect(new Set(legacy).size).toBe(legacy.length);
      for (const legacyId of legacy) {
        expect(all).not.toContain(legacyId);
      }
    });

    it("every achievement has a known category, tier and i18n keys", () => {
      for (const a of ACHIEVEMENTS) {
        expect(ACHIEVEMENT_CATEGORIES).toContain(a.category);
        expect(["bronze", "silver", "gold"]).toContain(a.tier);
        expect(a.nameKey).toBe(`badges.${a.id}.name`);
        expect(a.descriptionKey).toBe(`badges.${a.id}.description`);
        expect(a.reward).not.toBeNull();
        expect(typeof a.reward).toBe("object");
      }
    });

    it.each([
      ["en", en],
      ["es", es],
      ["fr", fr],
      ["ja", ja],
      ["zh-CN", zhCN],
    ])("has %s translations for every achievement", (_lang, locale) => {
      for (const a of ACHIEVEMENTS) {
        expect(locale.badges?.[a.id]?.name, `${a.id}.name`).toEqual(expect.stringMatching(/\S/));
        expect(locale.badges?.[a.id]?.description, `${a.id}.description`).toEqual(
          expect.stringMatching(/\S/),
        );
      }
    });

    it("keeps every badge id from the former gameEngine BADGES list", () => {
      const formerBadges = [
        "first_contract", "triple_threat", "five_star", "completionist",
        "level_3", "level_5", "xp_1000", "speed_demon",
        "chapter_1", "chapter_2", "chapter_3", "chapter_4",
        "chapter_5", "chapter_6", "chapter_7",
      ];
      for (const id of formerBadges) {
        expect(getAchievementById(id), id).toBeDefined();
      }
    });

    it("maps every former achievementEngine id to a unified achievement", () => {
      const formerAchievements = [
        "first_steps", "apprentice", "journeyman", "master",
        "xp_collector", "xp_hoarder", "level_up", "high_roller",
        "speed_demon", "perfectionist", "streak_starter", "dedicated", "committed",
      ];
      const normalized = normalizeAchievementIds(formerAchievements);
      for (const id of normalized) {
        expect(getAchievementById(id), id).toBeDefined();
      }
      expect(normalized).toHaveLength(formerAchievements.length);
    });
  });

  describe("mission catalog", () => {
    it("derives the mission count from the mission loader, not a hard-coded default", () => {
      const catalog = getMissionCatalog();
      expect(catalog.totalMissions).toBe(getAllMissions("en").length);
      expect(catalog.totalMissions).toBeGreaterThan(10);
    });

    it("groups campaign missions by chapter", () => {
      const { chapters } = getMissionCatalog();
      expect(chapters[1]).toEqual(["hello-soroban", "greetings-protocol"]);
      expect(chapters[7]).toEqual(["reentrancy-guard", "access-control-fix"]);
    });
  });

  describe("isConditionMet", () => {
    const catalog = {
      missionIds: ["m1", "m2", "m3"],
      totalMissions: 3,
      chapters: { 1: ["m1", "m2"], 2: ["m3"] },
    };

    it("'all missions' requires every mission in the catalog", () => {
      const cond = { type: "missions_completed", value: "all" };
      expect(isConditionMet(cond, { completedMissions: ["m1", "m2"] }, catalog)).toBe(false);
      // Other completions (e.g. theory quests) do not count toward "all".
      expect(
        isConditionMet(cond, { completedMissions: ["m1", "m2", "quest-x"] }, catalog),
      ).toBe(false);
      expect(isConditionMet(cond, { completedMissions: ["m3", "m1", "m2"] }, catalog)).toBe(true);
    });

    it("'all missions' uses the real catalog size (22+ missions)", () => {
      const cond = { type: "missions_completed", value: "all" };
      const real = getMissionCatalog();
      const nineteen = real.missionIds.slice(0, 19);
      expect(isConditionMet(cond, { completedMissions: nineteen })).toBe(false);
      expect(isConditionMet(cond, { completedMissions: real.missionIds })).toBe(true);
    });

    it("evaluates chapter completion from the catalog", () => {
      const cond = { type: "chapter_completed", chapter: 1 };
      expect(isConditionMet(cond, { completedMissions: ["m1"] }, catalog)).toBe(false);
      expect(isConditionMet(cond, { completedMissions: ["m1", "m2"] }, catalog)).toBe(true);
      expect(
        isConditionMet({ type: "chapter_completed", chapter: 99 }, { completedMissions: [] }, catalog),
      ).toBe(false);
    });

    it("counts only distinct catalog missions toward mission thresholds", () => {
      const cond = { type: "missions_completed", value: 2 };
      // Theory quests / unknown ids do not count.
      expect(isConditionMet(cond, { completedMissions: ["m1", "quest-x"] }, catalog)).toBe(false);
      // Duplicates do not count twice.
      expect(isConditionMet(cond, { completedMissions: ["m1", "m1"] }, catalog)).toBe(false);
      expect(isConditionMet(cond, { completedMissions: ["m1", "m2"] }, catalog)).toBe(true);
    });

    it("counts distinct first-try missions", () => {
      const cond = { type: "first_try_missions", value: 2 };
      expect(isConditionMet(cond, { firstTryMissions: ["m1", "m1"] }, catalog)).toBe(false);
      expect(isConditionMet(cond, { firstTryMissions: ["m1", "m2"] }, catalog)).toBe(true);
    });

    it("evaluates numeric thresholds", () => {
      expect(isConditionMet({ type: "level", value: 3 }, { level: 3 }, catalog)).toBe(true);
      expect(isConditionMet({ type: "total_xp", value: 500 }, { xp: 499 }, catalog)).toBe(false);
      expect(isConditionMet({ type: "streak", value: 7 }, { streak: 7 }, catalog)).toBe(true);
      expect(
        isConditionMet({ type: "first_try_missions", value: 1 }, { firstTryMissions: ["a"] }, catalog),
      ).toBe(true);
      expect(isConditionMet({ type: "missions_completed", value: 5 }, {}, catalog)).toBe(false);
    });
  });

  describe("evaluateAchievements", () => {
    it("returns only newly satisfied achievements", () => {
      const state = { ...getDefaultState(), completedMissions: ["hello-soroban"], badges: [] };
      expect(ids(evaluateAchievements(state))).toEqual(["first_contract"]);
      expect(evaluateAchievements({ ...state, badges: ["first_contract"] })).toEqual([]);
    });

    it("treats a legacy id as already unlocked", () => {
      const state = {
        ...getDefaultState(),
        completedMissions: ["hello-soroban"],
        badges: ["first_steps"],
      };
      expect(evaluateAchievements(state)).toEqual([]);
    });

    it("unlocks streak achievements", () => {
      const state = { ...getDefaultState(), streak: 7 };
      expect(ids(evaluateAchievements(state))).toEqual(["streak_starter", "dedicated"]);
    });
  });

  describe("checkBadges (gameEngine integration)", () => {
    it("stores unlocks in state.badges and reports newBadges", () => {
      const state = { ...getDefaultState(), xp: 2000 };
      const out = checkBadges(state);
      expect(out.newBadges).toEqual(["xp_500", "xp_1000", "xp_2000"]);
      expect(out.badges).toEqual(["xp_500", "xp_1000", "xp_2000"]);
    });

    it("normalizes legacy ids already present in state", () => {
      const state = { ...getDefaultState(), badges: ["apprentice", "five_star", "master"] };
      const out = checkBadges(state);
      expect(out.badges).toEqual(["five_star", "completionist"]);
      expect(out.newBadges).toEqual([]);
    });
  });

  describe("normalizeAchievementIds", () => {
    it("maps legacy ids, removes duplicates, keeps unknown ids and order", () => {
      expect(
        normalizeAchievementIds(["level_up", "level_3", "future_badge", "first_steps", 42, null]),
      ).toEqual(["level_3", "future_badge", "first_contract"]);
    });

    it("returns an empty array for non-array input", () => {
      expect(normalizeAchievementIds(undefined)).toEqual([]);
      expect(normalizeAchievementIds("first_contract")).toEqual([]);
    });
  });
});
