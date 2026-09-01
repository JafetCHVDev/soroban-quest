/**
 * Core game state (saved to localStorage)
 */
export interface GameState {
  xp: number;
  gold: number;
  level: number;
  completedMissions: string[];
  bookmarkedMissions: string[];
  badges: string[];
  firstTryMissions: string[];
  currentMission: string | null;
  missionAttempts: Record<string, number>;
  streak: number;
  lastLogin: string | null;
  purchasedItems: string[];
  xpBoostActive: boolean;
  streakFreezeUsed: boolean;
  skillPoints?: number[];
  inventory?: {
    owned: string[];
    equipped: string[];
  };
  goldUnlockedHints?: Record<string, number[]>;
}
