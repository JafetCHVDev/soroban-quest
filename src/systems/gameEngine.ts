/* ==========================================
   Game Engine — XP, Levels, Achievement unlocks
   ========================================== */
import { logActivity, ACTIVITY_TYPES } from "./activityLogger";
import { evaluateAchievements, normalizeAchievementIds } from "./achievements";

const LEVEL_BASE = 500;
const LEVEL_EXPONENT = 1.5;

const RANK_TITLES = [
  "Initiate", // 0
  "Apprentice", // 1
  "Scribe", // 2
  "Coder", // 3
  "Architect", // 4
  "Sentinel", // 5
  "Guardian", // 6
  "Master Guardian", // 7
  "Elder", // 8
  "Luminary", // 9
  "Stellar Sovereign", // 10
  "Vault Keeper", // 11
  "Protocol Weaver", // 12
  "DeFi Sage", // 13
  "Stellar Architect", // 14
  "Security Sentinel", // 15+
];

export interface GameState {
  xp: number;
  gold: number;
  level: number;
  completedMissions: string[];
  badges: string[];
  firstTryMissions?: string[];
  currentMission: string | null;
  missionAttempts: Record<string, number>;
  streak: number;
  lastLogin: string | null;
  purchasedItems: string[];
  xpBoostActive: boolean;
  streakFreezeUsed: boolean;
  leveledUp?: boolean;
  alreadyCompleted?: boolean;
  newBadges?: string[];
}

export function getDefaultState(): GameState {
  return {
    xp: 0,
    gold: 0,
    level: 1,
    completedMissions: [],
    badges: [],
    firstTryMissions: [],
    currentMission: null,
    missionAttempts: {},
    streak: 0,
    lastLogin: null,
    purchasedItems: [],
    xpBoostActive: false,
    streakFreezeUsed: false,
  };
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(LEVEL_BASE * Math.pow(level - 1, LEVEL_EXPONENT));
}

export function xpForNextLevel(level: number): number {
  return xpForLevel(level + 1);
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function getRankTitle(level: number): string {
  const index = Math.min(level - 1, RANK_TITLES.length - 1);
  return RANK_TITLES[index];
}

interface XPProgress {
  current: number;
  needed: number;
  percentage: number;
}

export function getXPProgress(state: GameState): XPProgress {
  const currentLevelXP = xpForLevel(state.level);
  const nextLevelXP = xpForNextLevel(state.level);
  const progressXP = state.xp - currentLevelXP;
  const neededXP = nextLevelXP - currentLevelXP;
  return {
    current: progressXP,
    needed: neededXP,
    percentage: Math.min((progressXP / neededXP) * 100, 100),
  };
}

export function awardXP(state: GameState, amount: number): GameState {
  const hasBoost = state.purchasedItems?.includes("xp-boost");
  const multiplied = hasBoost ? amount * 2 : amount;
  const newXP = state.xp + multiplied;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > state.level;

  if (leveledUp) {
    logActivity(
      ACTIVITY_TYPES.LEVEL_UP,
      { level: newLevel },
      `Reached Level ${newLevel}!`
    );
  }

  const nextState: GameState = {
    ...state,
    xp: newXP,
    level: newLevel,
    leveledUp,
  };

  if (hasBoost) {
    nextState.purchasedItems = (state.purchasedItems || []).filter(
      (id) => id !== "xp-boost"
    );
  }

  return nextState;
}

export const GOLD_PER_MISSION_RATIO = 0.5;

export function awardGold(state: GameState, xpReward: number): GameState {
  const goldEarned = Math.floor(xpReward * GOLD_PER_MISSION_RATIO);
  logActivity(
    ACTIVITY_TYPES.GOLD_EARNED,
    { amount: goldEarned },
    `Earned ${goldEarned} gold!`
  );
  return {
    ...state,
    gold: (state.gold || 0) + goldEarned,
  };
}

export function spendGold(state: GameState, amount: number): GameState {
  const currentGold = state.gold || 0;
  if (amount > currentGold) return state;
  return {
    ...state,
    gold: currentGold - amount,
  };
}

export function completeMission(
  state: GameState,
  missionId: string,
  xpReward: number
): GameState {
  if (state.completedMissions.includes(missionId)) {
    return { ...state, alreadyCompleted: true };
  }

  const attempts = state.missionAttempts[missionId] || 0;
  const isFirstTry = attempts <= 1;

  let newState: GameState = {
    ...state,
    completedMissions: [...state.completedMissions, missionId],
    firstTryMissions: isFirstTry
      ? [...(state.firstTryMissions || []), missionId]
      : (state.firstTryMissions || []),
  };

  newState = awardXP(newState, xpReward);
  newState = awardGold(newState, xpReward);
  newState = checkBadges(newState);

  logActivity(
    ACTIVITY_TYPES.MISSION_COMPLETED,
    { missionId },
    `Successfully completed mission: ${missionId}`
  );

  return newState;
}

export function recordAttempt(
  state: GameState,
  missionId: string
): GameState {
  return {
    ...state,
    missionAttempts: {
      ...state.missionAttempts,
      [missionId]: (state.missionAttempts[missionId] || 0) + 1,
    },
  };
}

/**
 * Evaluate achievements (defined in ./achievements) against the state and
 * record newly unlocked ids in `state.badges`, the single persisted store.
 */
export function checkBadges(state: GameState): GameState {
  const current = normalizeAchievementIds(state.badges);
  const unlocked = evaluateAchievements({ ...state, badges: current });
  const newBadges: string[] = unlocked.map((a) => a.id);

  for (const achievement of unlocked) {
    logActivity(
      ACTIVITY_TYPES.BADGE_EARNED,
      { badgeId: achievement.id, badgeName: achievement.name },
      `Earned the "${achievement.name}" badge!`,
    );
  }

  return {
    ...state,
    badges: [...current, ...newBadges],
    newBadges,
  };
}

export function updateStreak(state: GameState): GameState {
  const today = new Date().toISOString().split("T")[0];
  const lastLogin = state.lastLogin;

  if (lastLogin === today) return state;

  let newStreak = 1;
  let consumedFreeze = false;
  if (lastLogin) {
    const last = new Date(lastLogin);
    const now = new Date(today);
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = (state.streak || 0) + 1;
    } else if (
      diffDays > 1 &&
      (state.purchasedItems || []).includes("streak-freeze")
    ) {
      newStreak = state.streak || 0;
      consumedFreeze = true;
    }
  }

  logActivity(
    ACTIVITY_TYPES.STREAK,
    { streak: newStreak },
    `Daily streak: ${newStreak} day${newStreak > 1 ? "s" : ""}!`
  );

  const nextState: GameState = {
    ...state,
    streak: newStreak,
    lastLogin: today,
  };

  if (consumedFreeze) {
    nextState.purchasedItems = (state.purchasedItems || []).filter(
      (id) => id !== "streak-freeze"
    );
  }

  return nextState;
}
