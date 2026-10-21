import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("../soundManager", () => ({
  playSound: vi.fn(),
  SOUND_TYPES: { MISSION_COMPLETE: "complete", XP_GAINED: "xp", LEVEL_UP: "level" },
}));

import { completeMissionWithDailyBonus, DAILY_CHALLENGE_BONUS_XP } from "../missionCompletion";
import { getDefaultState, xpForLevel } from "../gameEngine";
import { getAllMissions } from "../missionLoader";
import { getDailyChallengeMission, getTodayDateString } from "../dailyChallenge";
import { saveProgress } from "../storage";

const dailyMission = getDailyChallengeMission(getAllMissions("en"));
const otherMission = getAllMissions("en").find((m) => m.id !== dailyMission.id);

function seedProgress(overrides = {}) {
  saveProgress({ ...getDefaultState(), ...overrides });
}

describe("completeMissionWithDailyBonus", () => {
  beforeEach(() => {
    const storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (key) => storage[key] ?? null,
      setItem: (key, value) => {
        storage[key] = value;
      },
      removeItem: (key) => {
        delete storage[key];
      },
    });
    seedProgress();
  });

  it("awards the mission XP without a bonus for a regular mission", () => {
    const { newState, bonusXp } = completeMissionWithDailyBonus(otherMission.id, 100, "en");

    expect(bonusXp).toBe(0);
    expect(newState.completedMissions).toContain(otherMission.id);
    expect(newState.xp).toBe(100);
    expect(newState.dailyChallengeCompletedDates).toEqual([]);
  });

  it("adds the daily bonus and records today for today's daily challenge", () => {
    const { newState, bonusXp } = completeMissionWithDailyBonus(dailyMission.id, 100, "en");

    expect(bonusXp).toBe(DAILY_CHALLENGE_BONUS_XP);
    expect(DAILY_CHALLENGE_BONUS_XP).toBe(25);
    expect(newState.xp).toBe(125);
    expect(newState.dailyChallengeCompletedDates).toEqual([getTodayDateString()]);
  });

  it("does not award the daily bonus twice on the same day", () => {
    seedProgress({ dailyChallengeCompletedDates: [getTodayDateString()] });

    const { newState, bonusXp } = completeMissionWithDailyBonus(dailyMission.id, 100, "en");

    expect(bonusXp).toBe(0);
    expect(newState.xp).toBe(100);
    expect(newState.dailyChallengeCompletedDates).toEqual([getTodayDateString()]);
  });

  it("flags a level up when the daily bonus crosses a level threshold", () => {
    const xp = xpForLevel(2) - 110;
    seedProgress({ xp, level: 1 });

    const { newState } = completeMissionWithDailyBonus(dailyMission.id, 100, "en");

    expect(newState.level).toBe(2);
    expect(newState.leveledUp).toBe(true);
  });

  it("marks an already completed mission without awarding XP", () => {
    seedProgress({ completedMissions: [otherMission.id], xp: 300 });

    const { newState } = completeMissionWithDailyBonus(otherMission.id, 100, "en");

    expect(newState.alreadyCompleted).toBe(true);
    expect(newState.xp).toBe(300);
  });

  it("does not persist anything itself", () => {
    completeMissionWithDailyBonus(otherMission.id, 100, "en");

    const stored = JSON.parse(localStorage.getItem("soroban_quest_progress") || "{}");
    expect(stored.completedMissions).toEqual([]);
  });
});
