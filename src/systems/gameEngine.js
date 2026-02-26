/* ==========================================
   Game Engine — XP, Levels, Badges
   ========================================== */

const LEVEL_BASE = 500;
const LEVEL_EXPONENT = 1.5;

const RANK_TITLES = [
  'Initiate', // 0
  'Apprentice', // 1
  'Scribe', // 2
  'Coder', // 3
  'Architect', // 4
  'Sentinel', // 5
  'Guardian', // 6
  'Master Guardian', // 7
  'Elder', // 8
  'Luminary', // 9
  'Stellar Sovereign', // 10+
];

export const BADGES = [
  {
    id: 'first_contract',
    name: 'First Contract',
    description: 'Complete your first mission',
    icon: '📜',
    condition: (state) => state.completedMissions.length >= 1,
  },
  {
    id: 'triple_threat',
    name: 'Triple Threat',
    description: 'Complete 3 missions',
    icon: '⚡',
    condition: (state) => state.completedMissions.length >= 3,
  },
  {
    id: 'five_star',
    name: 'Five Star',
    description: 'Complete 5 missions',
    icon: '🌟',
    condition: (state) => state.completedMissions.length >= 5,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    description: 'Complete all missions',
    icon: '👑',
    condition: (state) => state.completedMissions.length >= 7,
  },
  {
    id: 'level_3',
    name: 'Rising Star',
    description: 'Reach level 3',
    icon: '🚀',
    condition: (state) => state.level >= 3,
  },
  {
    id: 'level_5',
    name: 'Stellar Guardian',
    description: 'Reach level 5',
    icon: '🛡️',
    condition: (state) => state.level >= 5,
  },
  {
    id: 'xp_1000',
    name: 'XP Hoarder',
    description: 'Earn 1000 XP',
    icon: '💰',
    condition: (state) => state.xp >= 1000,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a mission on first try',
    icon: '⚡',
    condition: (state) => state.firstTryMissions?.length >= 1,
  },
];

function getDefaultState() {
  return {
    xp: 0,
    level: 1,
    completedMissions: [],
    badges: [],
    firstTryMissions: [],
    currentMission: null,
    missionAttempts: {},
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
  const index = Math.min(level, RANK_TITLES.length - 1);
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

  return {
    ...state,
    xp: newXP,
    level: newLevel,
    leveledUp,
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
  newState = checkBadges(newState);

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
    }
  }

  if (newBadges.length === 0) return state;

  return {
    ...state,
    badges: [...state.badges, ...newBadges],
    newBadges,
  };
}

export { getDefaultState };
