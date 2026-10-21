/* ==========================================
   Mission completion: awards a completed mission and the
   daily-challenge bonus on top of the saved progress
   ========================================== */

import { loadProgress } from "./storage";
import { completeMission, getLevelFromXP } from "./gameEngine";
import { getAllMissions } from "./missionLoader";
import {
  getDailyChallengeMission,
  isDailyChallengeCompleted,
  getTodayDateString,
} from "./dailyChallenge";
import type { GameState } from "../types/game";

export const DAILY_CHALLENGE_BONUS_XP = 25;

export interface CompletedMissionState extends GameState {
  // Transient flags set by gameEngine.completeMission
  alreadyCompleted?: boolean;
  leveledUp?: boolean;
  newBadges?: string[];
}

export interface MissionCompletionResult {
  newState: CompletedMissionState;
  bonusXp: number;
}

/**
 * Applies a mission completion to the saved progress and, when the mission is
 * today's daily challenge and the bonus has not been claimed yet, adds the
 * daily bonus XP. The caller decides whether to persist the returned state.
 */
export function completeMissionWithDailyBonus(
  missionId: string | undefined,
  xpReward: number,
  language: string,
): MissionCompletionResult {
  const state = loadProgress();
  const completedState = missionId ? completeMission(state, missionId, xpReward) : state;

  // Re-load state immediately before awarding bonus to reduce race window
  const currentState = loadProgress();

  const today = getTodayDateString();
  const dailyChallengeMission = getDailyChallengeMission(getAllMissions(language));
  const isDaily = missionId === dailyChallengeMission.id;
  const isAlreadyCompletedToday = isDailyChallengeCompleted(
    currentState.dailyChallengeCompletedDates || [],
    new Date(),
  );

  let bonusXp = 0;
  let newCompletedDates = currentState.dailyChallengeCompletedDates || [];

  if (isDaily && !isAlreadyCompletedToday) {
    bonusXp = DAILY_CHALLENGE_BONUS_XP;
    newCompletedDates = [...newCompletedDates, today];
  }

  const newState: CompletedMissionState = completedState;
  if (bonusXp > 0) {
    newState.xp += bonusXp;
    newState.level = getLevelFromXP(newState.xp);
    newState.leveledUp = newState.level > state.level;
  }
  newState.dailyChallengeCompletedDates = newCompletedDates;

  return { newState, bonusXp };
}
