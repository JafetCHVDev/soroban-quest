/* ==========================================
   Game Reducer — pure (action -> state)
   ========================================== */
import {
  getDefaultState,
  awardXP,
  completeMission,
  recordAttempt,
  updateStreak,
} from "./gameEngine";

export const GAME_ACTIONS = {
  COMPLETE_MISSION: "COMPLETE_MISSION",
  AWARD_XP: "AWARD_XP",
  UPDATE_STREAK: "UPDATE_STREAK",
  RECORD_ATTEMPT: "RECORD_ATTEMPT",
  RESET_PROGRESS: "RESET_PROGRESS",
  IMPORT_PROGRESS: "IMPORT_PROGRESS",
};

// Engine helpers stamp transient flags (leveledUp/alreadyCompleted/newBadges) on
// the returned state. Those should not leak across dispatches, so every action
// starts from a state with the prior dispatch's transient flags stripped.
function withoutTransient(state) {
  if (
    state.leveledUp === undefined &&
    state.alreadyCompleted === undefined &&
    state.newBadges === undefined
  ) {
    return state;
  }
  const { leveledUp, alreadyCompleted, newBadges, ...rest } = state;
  return rest;
}

export function gameReducer(state, action) {
  const base = withoutTransient(state);

  switch (action.type) {
    case GAME_ACTIONS.COMPLETE_MISSION:
      return completeMission(base, action.payload.missionId, action.payload.xpReward);

    case GAME_ACTIONS.AWARD_XP:
      return awardXP(base, action.payload.amount);

    case GAME_ACTIONS.UPDATE_STREAK:
      return updateStreak(base);

    case GAME_ACTIONS.RECORD_ATTEMPT:
      return recordAttempt(base, action.payload.missionId);

    case GAME_ACTIONS.RESET_PROGRESS:
      return getDefaultState();

    case GAME_ACTIONS.IMPORT_PROGRESS:
      return { ...getDefaultState(), ...action.payload.state };

    default:
      return state;
  }
}

export const gameActions = {
  completeMission: (missionId, xpReward) => ({
    type: GAME_ACTIONS.COMPLETE_MISSION,
    payload: { missionId, xpReward },
  }),
  awardXP: (amount) => ({
    type: GAME_ACTIONS.AWARD_XP,
    payload: { amount },
  }),
  updateStreak: () => ({ type: GAME_ACTIONS.UPDATE_STREAK }),
  recordAttempt: (missionId) => ({
    type: GAME_ACTIONS.RECORD_ATTEMPT,
    payload: { missionId },
  }),
  resetProgress: () => ({ type: GAME_ACTIONS.RESET_PROGRESS }),
  importProgress: (importedState) => ({
    type: GAME_ACTIONS.IMPORT_PROGRESS,
    payload: { state: importedState },
  }),
};
