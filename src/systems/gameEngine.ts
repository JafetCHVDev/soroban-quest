function getDefaultState(): GameState {
  return {
    xp: 0,
    gold: 0,
    level: 1,
    completedMissions: [],
    bookmarkedMissions: [],
    badges: [],
    firstTryMissions: [],
    currentMission: null,
    missionAttempts: {},
    streak: 0,
    lastLogin: null,
    inventory: {
      owned: [],
      equipped: [],
    },
    purchasedItems: [],
    xpBoostActive: false,
    streakFreezeUsed: false,
    goldUnlockedHints: {},
  };
}
