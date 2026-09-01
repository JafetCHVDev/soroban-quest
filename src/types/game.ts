/**
 * @file game.ts
 * Core game domain types: GameState, missions, campaigns, achievements, profiles
 */

/**
 * Language support for the application
 */
export type Language = 'en' | 'es' | 'fr' | 'ja';

/**
 * Mission difficulty levels
 */
export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/**
 * Check type for mission validation
 */
export type CheckType = 
  | 'has_attribute'
  | 'has_function'
  | 'returns_type'
  | 'uses_type'
  | 'contains_pattern'
  | 'storage_operation';

/**
 * A single check for mission validation
 */
export interface Check {
  type: CheckType;
  attribute?: string;
  name?: string;
  params?: string[];
  function?: string;
  returnType?: string;
  typeName?: string;
  pattern?: string;
  operation?: string;
  message: string;
  description?: string;
}

/**
 * Localized mission content (per language)
 */
export interface MissionLocale {
  title: string;
  story: string;
  learningGoal: string;
  hints: string[];
}

/**
 * Complete mission definition
 */
export interface Mission {
  id: string;
  chapter: number;
  order: number;
  difficulty: Difficulty;
  xpReward: number;
  template: string;
  solution: string;
  checks: Check[];
  conceptsIntroduced: string[];
  i18n: Partial<Record<Language, MissionLocale>>;
}

/**
 * Localized mission (flattened for rendering)
 */
export interface LocalizedMission extends Mission {
  title: string;
  story: string;
  learningGoal: string;
  hints: string[];
}

/**
 * Campaign grouping of missions
 */
export interface Campaign {
  id: string;
  name: string;
  description: string;
  missionIds: string[];
  icon?: string;
  chapterNumber?: number;
  requiredLevel?: number;
  heroImage?: string;
  color?: string;
  lore?: string;
}

/**
 * Achievement/Badge
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: GameState) => boolean;
}

/**
 * User profile
 */
export interface Profile {
  name: string;
  avatar: string;
}

/**
 * Profile slot (persisted container)
 */
export interface ProfileSlot {
  id: string;
  profile: Profile;
  progress: GameState;
}

/**
 * Core game state (saved to localStorage)
 */
export interface GameState {
  xp: number;
  gold: number;
  level: number;
  completedMissions: string[];
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

/**
 * Export/Import data format
 */
export interface ExportData {
  state?: GameState;
  profile?: Profile;
  version?: string;
}

/**
 * Achievement data (runtime)
 */
export interface AchievementData {
  id: string;
  unlockedAt?: number;
  progress?: number;
}
