/* ==========================================
   Game Engine — XP, Levels, Achievement unlocks
   ========================================== */
import { logActivity, ACTIVITY_TYPES } from "./activityLogger";
import { evaluateAchievements, normalizeAchievementIds } from "./achievements";
import { playSound, SOUND_TYPES } from "./soundManager";


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

function getDefaultState() {
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
    inventory: {
      owned: [],
      equipped: [],
      hintTokens: 0,
    },
    purchasedItems: [],
    xpBoostActive: false,
    streakFreezeUsed: false,
    goldUnlockedHints: {},
  };
}

export function xpForLevel(level) {
  if (level <= 1) return 0;
  return Math.floor(LEVEL_BASE * Math.pow(level - 1, LEVEL_EXPONENT));
}

export function xpForNextLevel(level) {
  return xpForLevel(level + 1);
}

export function getLevelFromXP(xp) {
  let level = 1;
  while (xpForLevel(level + 1) <= xp) {
    level++;
  }
  return level;
}

export function getRankTitle(level) {
  const index = Math.min(level - 1, RANK_TITLES.length - 1);
  return RANK_TITLES[index];
}

export function getXPProgress(state) {
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

export function awardXP(state, amount) {
  // Check if XP Boost is equipped
  const hasBoost = (state.inventory?.equipped || []).includes('xp-boost') || (state.purchasedItems || []).includes('xp-boost');
  const multiplied = hasBoost ? amount * 2 : amount;
  const newXP = state.xp + multiplied;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > state.level;

  playSound(SOUND_TYPES.XP_GAINED);

  if (leveledUp) {
    playSound(SOUND_TYPES.LEVEL_UP);

    logActivity(ACTIVITY_TYPES.LEVEL_UP, { level: newLevel }, `Reached Level ${newLevel}!`);
  }

  const nextState = {
    ...state,
    xp: newXP,
    level: newLevel,
    leveledUp,
  };

  // If boosted via old system, remove it.
  if (hasBoost && (state.purchasedItems || []).includes('xp-boost')) {
    nextState.purchasedItems = (state.purchasedItems || []).filter(id => id !== 'xp-boost');
  }

  return nextState;
}


export const GOLD_PER_MISSION_RATIO = 0.5;

export function awardGold(state, xpReward) {
  const goldEarned = Math.floor(xpReward * GOLD_PER_MISSION_RATIO);

  playSound(SOUND_TYPES.GOLD_EARNED);

  logActivity(ACTIVITY_TYPES.GOLD_EARNED, { amount: goldEarned }, `Earned ${goldEarned} gold!`);

  return {
    ...state,
    gold: (state.gold || 0) + goldEarned,
  };
}

export function spendGold(state, amount) {
  const currentGold = state.gold || 0;
  if (amount > currentGold) return state;
  return {
    ...state,
    gold: currentGold - amount,
  };
}

/**
 * Default Gold cost to unlock a single hint early.
 */
export const HINT_GOLD_COST = 25;

/**
 * Returns true if the given hint has already been unlocked with Gold for a mission.
 * Once unlocked, revisiting the mission must not re-charge the player.
 */
export function isHintGoldUnlocked(state, missionId, hintIndex) {
  const unlocked = state.goldUnlockedHints?.[missionId] || [];
  return unlocked.includes(hintIndex);
}

/**
 * Spend Gold to instantly unlock a hint for a mission.
 *
 * - If the hint was already gold-unlocked, returns the state unchanged (no re-charge)
 *   with `hintAlreadyUnlocked: true`.
 * - If the player cannot afford the cost, returns the state unchanged with
 *   `insufficientGold: true`.
 * - Otherwise deducts the cost via `spendGold` and records the unlocked hint so it
 *   persists per mission.
 *
 * This is additive: the free progressive-hint tier is unaffected.
 */
export function spendGoldForHint(state, missionId, hintIndex, cost = HINT_GOLD_COST) {
  if (isHintGoldUnlocked(state, missionId, hintIndex)) {
    return { ...state, hintAlreadyUnlocked: true, insufficientGold: false };
  }

  if ((state.gold || 0) < cost) {
    return { ...state, insufficientGold: true, hintAlreadyUnlocked: false };
  }

  const spentState = spendGold(state, cost);
  const missionHints = spentState.goldUnlockedHints?.[missionId] || [];

  return {
    ...spentState,
    goldUnlockedHints: {
      ...(spentState.goldUnlockedHints || {}),
      [missionId]: [...missionHints, hintIndex],
    },
    hintAlreadyUnlocked: false,
    insufficientGold: false,
  };
}

/**
 * Shop id of the consumable Hint Token. The owned quantity lives in
 * `state.inventory.hintTokens` as a count, not as ownership in `owned`.
 */
export const HINT_TOKEN_ID = "hint-token";

/**
 * Number of hint tokens the player currently owns.
 */
export function getHintTokenCount(state) {
  const count = state?.inventory?.hintTokens;
  return Number.isInteger(count) && count > 0 ? count : 0;
}

/**
 * Purchase hint tokens. Tokens stack, and a legacy `hint-token` entry in the
 * owned/purchased lists is dropped so the token never behaves like a permanent
 * equippable item.
 */
export function purchaseHintTokens(state, amount = 1) {
  const inventory = state.inventory || { owned: [], equipped: [] };
  const owned = (inventory.owned || []).filter((id) => id !== HINT_TOKEN_ID);
  const equipped = (inventory.equipped || []).filter((id) => id !== HINT_TOKEN_ID);

  return {
    ...state,
    inventory: {
      ...inventory,
      owned,
      equipped,
      hintTokens: getHintTokenCount(state) + Math.max(0, Math.floor(amount)),
    },
  };
}

/**
 * Consume exactly one hint token. Returns the state unchanged with
 * `insufficientTokens: true` when the player has none left.
 */
export function consumeHintToken(state) {
  const count = getHintTokenCount(state);
  if (count < 1) return { ...state, insufficientTokens: true };

  const inventory = state.inventory || { owned: [], equipped: [] };
  return {
    ...state,
    insufficientTokens: false,
    inventory: { ...inventory, hintTokens: count - 1 },
  };
}

/**
 * Reveal a hint by spending one hint token instead of Gold.
 *
 * Hints already paid for (with Gold or an earlier token) are never re-charged,
 * mirroring `spendGoldForHint`.
 */
export function spendHintTokenForHint(state, missionId, hintIndex) {
  if (isHintGoldUnlocked(state, missionId, hintIndex)) {
    return { ...state, hintAlreadyUnlocked: true, insufficientTokens: false };
  }

  const consumed = consumeHintToken(state);
  if (consumed.insufficientTokens) return consumed;

  const missionHints = consumed.goldUnlockedHints?.[missionId] || [];
  return {
    ...consumed,
    goldUnlockedHints: {
      ...(consumed.goldUnlockedHints || {}),
      [missionId]: [...missionHints, hintIndex],
    },
    hintAlreadyUnlocked: false,
  };
}

export function completeMission(state, missionId, xpReward) {
  if (state.completedMissions.includes(missionId)) {
    return { ...state, alreadyCompleted: true };
  }

  const attempts = state.missionAttempts[missionId] || 0;
  const isFirstTry = attempts <= 1;

  let newState = {
    ...state,
    completedMissions: [...state.completedMissions, missionId],
    firstTryMissions: isFirstTry
      ? [...(state.firstTryMissions || []), missionId]
      : state.firstTryMissions || [],
  };

  newState = awardXP(newState, xpReward);
  newState = awardGold(newState, xpReward);
  newState = checkBadges(newState);

  playSound(SOUND_TYPES.MISSION_COMPLETE);

  logActivity(ACTIVITY_TYPES.MISSION_COMPLETED, { missionId }, `Successfully completed mission: ${missionId}`);

  return newState;
}

export function recordAttempt(state, missionId) {
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
export function checkBadges(state) {
  const current = normalizeAchievementIds(state.badges);
  const unlocked = evaluateAchievements({ ...state, badges: current });
  const newBadges = unlocked.map((a) => a.id);

  for (const achievement of unlocked) {
    playSound(SOUND_TYPES.BADGE_EARNED);
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

export function updateStreak(state) {
  const today = new Date().toISOString().split("T")[0];
  const lastLogin = state.lastLogin;

  if (lastLogin === today) return state;

  let newStreak = 1;
  let consumedFreeze = false;
  if (lastLogin) {
    const last = new Date(lastLogin);
    const now = new Date(today);
    const diffTime = Math.abs(now - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const hasFreeze = (state.inventory?.equipped || []).includes('streak-freeze') || (state.purchasedItems || []).includes('streak-freeze');

    if (diffDays === 1) {
      newStreak = (state.streak || 0) + 1;
    } else if (diffDays > 1 && hasFreeze) {
      newStreak = state.streak || 0;
      consumedFreeze = true;
    }
  }

  logActivity(ACTIVITY_TYPES.STREAK, { streak: newStreak }, `Daily streak: ${newStreak} day${newStreak > 1 ? 's' : ''}!`);

  const nextState = {
    ...state,
    streak: newStreak,
    lastLogin: today,
  };

  if (consumedFreeze && (state.purchasedItems || []).includes('streak-freeze')) {
    nextState.purchasedItems = (state.purchasedItems || []).filter(id => id !== 'streak-freeze');
  }

  return nextState;
}

export { getDefaultState };
