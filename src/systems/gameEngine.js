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
  1: ['hello-soroban', 'greetings-protocol'],
  2: ['counter-vault', 'guardian-ledger'],
  3: ['token-forge', 'time-lock', 'multi-party-pact'],
  4: ['vault-manager', 'event-emitter', 'approval-manager'],
  5: ['crowdfund', 'escrow-agent', 'subscription'],
  6: ['flash-loan', 'permissions-rbac', 'oracle-feed', 'governor-simple'],
  7: ['reentrancy-guard', 'access-control-fix'],
};

export const BADGES = [
  {
    id: "first_contract",
    name: "First Contract",
    description: "Complete your first mission",
    icon: "📜",
    condition: (state) => state.completedMissions.length >= 1,
  },
  {
    id: "triple_threat",
    name: "Triple Threat",
    description: "Complete 3 missions",
    icon: "⚡",
    condition: (state) => state.completedMissions.length >= 3,
  },
  {
    id: "five_star",
    name: "Five Star",
    description: "Complete 5 missions",
    icon: "🌟",
    condition: (state) => state.completedMissions.length >= 5,
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "Complete all missions",
    icon: "👑",
    condition: (state) => state.completedMissions.length >= 19,
  },
  {
    id: "level_3",
    name: "Rising Star",
    description: "Reach level 3",
    icon: "🚀",
    condition: (state) => state.level >= 3,
  },
  {
    id: "level_5",
    name: "Stellar Guardian",
    description: "Reach level 5",
    icon: "🛡️",
    condition: (state) => state.level >= 5,
  },
  {
    id: "xp_1000",
    name: "XP Hoarder",
    description: "Earn 1000 XP",
    icon: "💰",
    condition: (state) => state.xp >= 1000,
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete a mission on first try",
    icon: "⚡",
    condition: (state) => state.firstTryMissions?.length >= 1,
  },
  {
    id: "chapter_1",
    name: "Awakening",
    description: "Complete all Chapter 1 missions",
    icon: "🌅",
    condition: (state) => CHAPTER_MISSIONS[1].every((id) => state.completedMissions.includes(id)),
  },
  {
    id: "chapter_2",
    name: "Memory Keeper",
    description: "Complete all Chapter 2 missions",
    icon: "🔐",
    condition: (state) => CHAPTER_MISSIONS[2].every((id) => state.completedMissions.includes(id)),
  },
  {
    id: "chapter_3",
    name: "Forgemaster",
    description: "Complete all Chapter 3 missions",
    icon: "⚒️",
    condition: (state) => CHAPTER_MISSIONS[3].every((id) => state.completedMissions.includes(id)),
  },
  {
    id: "chapter_4",
    name: "Data Architect",
    description: "Complete all Chapter 4 missions",
    icon: "🏦",
    condition: (state) => CHAPTER_MISSIONS[4].every((id) => state.completedMissions.includes(id)),
  },
  {
    id: "chapter_5",
    name: "Protocol Pioneer",
    description: "Complete all Chapter 5 missions",
    icon: "🔗",
    condition: (state) => CHAPTER_MISSIONS[5].every((id) => state.completedMissions.includes(id)),
  },
  {
    id: "chapter_6",
    name: "Production Master",
    description: "Complete all Chapter 6 missions",
    icon: "⚡",
    condition: (state) => CHAPTER_MISSIONS[6].every((id) => state.completedMissions.includes(id)),
  },
  {
    id: "chapter_7",
    name: "Security Sentinel",
    description: "Complete all Chapter 7 missions",
    icon: "🛡️",
    condition: (state) => CHAPTER_MISSIONS[7].every((id) => state.completedMissions.includes(id)),
  },
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
  const newXP = state.xp + amount;
  const newLevel = getLevelFromXP(newXP);
  const leveledUp = newLevel > state.level;

  if (leveledUp) {
    logActivity(ACTIVITY_TYPES.LEVEL_UP, { level: newLevel }, `Reached Level ${newLevel}!`);
  }

  return {
    ...state,
    xp: newXP,
    level: newLevel,
    leveledUp,
  };
}

export const GOLD_PER_MISSION_RATIO = 0.5;

export function awardGold(state, xpReward) {
  const goldEarned = Math.floor(xpReward * GOLD_PER_MISSION_RATIO);
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

export function checkBadges(state) {
  const newBadges = [];
  for (const badge of BADGES) {
    if (!state.badges.includes(badge.id) && badge.condition(state)) {
      newBadges.push(badge.id);
      logActivity(ACTIVITY_TYPES.BADGE_EARNED, { badgeId: badge.id, badgeName: badge.name }, `Earned the "${badge.name}" badge!`);
    }
  }

  return {
    ...state,
    badges: [...state.badges, ...newBadges],
    newBadges,
  };
}

export function updateStreak(state) {
  const today = new Date().toISOString().split("T")[0];
  const lastLogin = state.lastLogin;

  if (lastLogin === today) return state;

  let newStreak = 1;
  if (lastLogin) {
    const last = new Date(lastLogin);
    const now = new Date(today);
    const diffTime = Math.abs(now - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak = (state.streak || 0) + 1;
    }
  }

  logActivity(ACTIVITY_TYPES.STREAK, { streak: newStreak }, `Daily streak: ${newStreak} day${newStreak > 1 ? 's' : ''}!`);

  return {
    ...state,
    streak: newStreak,
    lastLogin: today,
  };
}

export { getDefaultState };
