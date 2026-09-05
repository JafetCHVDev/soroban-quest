/* ==========================================
   Game Engine — XP, Levels, Badges
   ========================================== */
import { logActivity, ACTIVITY_TYPES } from "./activityLogger";

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

const CHAPTER_MISSIONS = {
  1: ["hello-soroban", "greetings-protocol"],
  2: ["counter-vault", "guardian-ledger"],
  3: ["token-forge", "time-lock", "multi-party-pact"],
  4: ["vault-manager", "event-emitter", "approval-manager"],
  5: ["crowdfund", "escrow-agent", "subscription"],
  6: ["flash-loan", "permissions-rbac", "oracle-feed", "governor-simple"],
  7: ["reentrancy-guard", "access-control-fix"],
};

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
}

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

export const BADGES: Badge[] = [
  {
    id: "first_contract",
    name: "First Contract",
    description: "Complete your first mission",
    icon: "📜",
    condition: (state: GameState) => state.completedMissions.length >= 1,
  },
  {
    id: "triple_threat",
    name: "Triple Threat",
    description: "Complete 3 missions",
    icon: "⚡",
    condition: (state: GameState) => state.completedMissions.length >= 3,
  },
  {
    id: "five_star",
    name: "Five Star",
    description: "Complete 5 missions",
    icon: "🌟",
    condition: (state: GameState) => state.completedMissions.length >= 5,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Complete all missions",
    icon: "👑",
    condition: (state: GameState) => state.completedMissions.length >= 19,
  },
  {
    id: "level_3",
    name: "Rising Star",
    description: "Reach level 3",
    icon: "🚀",
    condition: (state: GameState) => state.level >= 3,
  },
  {
    id: "level_5",
    name: "Stellar Guardian",
    description: "Reach level 5",
    icon: "🛡️",
    condition: (state: GameState) => state.level >= 5,
  },
  {
    id: "xp_1000",
    name: "XP Hoarder",
    description: "Earn 1000 XP",
    icon: "💰",
    condition: (state: GameState) => state.xp >= 1000,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a mission on first try",
    icon: "⚡",
    condition: (state: GameState) => (state.firstTryMissions?.length ?? 0) >= 1,
  },
  {
    id: "chapter_1",
    name: "Awakening",
    description: "Complete all Chapter 1 missions",
    icon: "🌅",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[1 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
  {
    id: "chapter_2",
    name: "Memory Keeper",
    description: "Complete all Chapter 2 missions",
    icon: "🔐",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[2 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
  {
    id: "chapter_3",
    name: "Forgemaster",
    description: "Complete all Chapter 3 missions",
    icon: "⚒️",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[3 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
  {
    id: "chapter_4",
    name: "Data Architect",
    description: "Complete all Chapter 4 missions",
    icon: "🏦",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[4 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
  {
    id: "chapter_5",
    name: "Protocol Pioneer",
    description: "Complete all Chapter 5 missions",
    icon: "🔗",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[5 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
  {
    id: "chapter_6",
    name: "Production Master",
    description: "Complete all Chapter 6 missions",
    icon: "⚡",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[6 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
  {
    id: "chapter_7",
    name: "Security Sentinel",
    description: "Complete all Chapter 7 missions",
    icon: "🛡️",
    condition: (state: GameState) =>
      CHAPTER_MISSIONS[7 as keyof typeof CHAPTER_MISSIONS].every((id) =>
        state.completedMissions.includes(id)
      ),
  },
];

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

export function checkBadges(state: GameState): GameState {
  const newBadges: string[] = [];
  for (const badge of BADGES) {
    if (!state.badges.includes(badge.id) && badge.condition(state)) {
      newBadges.push(badge.id);
      logActivity(
        ACTIVITY_TYPES.BADGE_EARNED,
        { badgeId: badge.id, badgeName: badge.name },
        `Earned the "${badge.name}" badge!`
      );
    }
  }

  return {
    ...state,
    badges: [...state.badges, ...newBadges],
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
