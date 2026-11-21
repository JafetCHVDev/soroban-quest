/* ==========================================
   Achievements — single source of truth

   Defines every achievement/badge the player can unlock and evaluates
   them against the game state. Unlocked ids are persisted ONLY in the
   main game state (`state.badges`), so export/import, cloud sync and
   profile reset all carry achievements along with the rest of progress.

   This module replaces the former `BADGES` list in gameEngine and the
   separate `achievementEngine` + `data/achievements` system, which kept
   its own localStorage key. Ids from that system are mapped through
   `legacyIds` so existing unlocks survive migration.
   ========================================== */
import { getMissionCatalog, type MissionCatalog } from './missionLoader';

export type AchievementCategory =
  | 'missions'
  | 'chapters'
  | 'level'
  | 'xp'
  | 'skill'
  | 'streak';

export type AchievementTier = 'bronze' | 'silver' | 'gold';

export type AchievementCondition =
  | { type: 'missions_completed'; value: number | 'all' }
  | { type: 'chapter_completed'; chapter: number }
  | { type: 'level'; value: number }
  | { type: 'total_xp'; value: number }
  | { type: 'first_try_missions'; value: number }
  | { type: 'streak'; value: number };

export interface AchievementReward {
  /**
   * Bonus XP associated with the achievement. Informational for now:
   * neither legacy system ever granted it, so unlocking does not award it.
   */
  xp?: number;
}

export interface Achievement {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  condition: AchievementCondition;
  reward: AchievementReward;
  /** i18n key for the display name. */
  nameKey: string;
  /** i18n key for the description. */
  descriptionKey: string;
  /** English fallback name (activity log, aria labels). */
  name: string;
  /** English fallback description. */
  description: string;
  /** Ids this achievement had in the retired achievementEngine system. */
  legacyIds?: readonly string[];
}

/** Minimal slice of game state needed to evaluate achievements. */
export interface AchievementState {
  xp?: number;
  level?: number;
  streak?: number;
  completedMissions?: string[];
  firstTryMissions?: string[];
  badges?: string[];
}

type AchievementInput = Omit<Achievement, 'nameKey' | 'descriptionKey' | 'reward'> & {
  reward?: AchievementReward;
};

function define(input: AchievementInput): Achievement {
  return {
    reward: {},
    ...input,
    nameKey: `badges.${input.id}.name`,
    descriptionKey: `badges.${input.id}.description`,
  };
}

function chapter(
  n: number,
  name: string,
  icon: string,
  tier: AchievementTier,
): Achievement {
  return define({
    id: `chapter_${n}`,
    category: 'chapters',
    tier,
    icon,
    name,
    description: `Complete all Chapter ${n} missions`,
    condition: { type: 'chapter_completed', chapter: n },
  });
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  // Missions
  define({
    id: 'first_contract',
    category: 'missions',
    tier: 'bronze',
    icon: '📜',
    name: 'First Contract',
    description: 'Complete your first mission',
    condition: { type: 'missions_completed', value: 1 },
    reward: { xp: 50 },
    legacyIds: ['first_steps'],
  }),
  define({
    id: 'triple_threat',
    category: 'missions',
    tier: 'bronze',
    icon: '⚡',
    name: 'Triple Threat',
    description: 'Complete 3 missions',
    condition: { type: 'missions_completed', value: 3 },
  }),
  define({
    id: 'five_star',
    category: 'missions',
    tier: 'silver',
    icon: '🌟',
    name: 'Five Star',
    description: 'Complete 5 missions',
    condition: { type: 'missions_completed', value: 5 },
    reward: { xp: 200 },
    legacyIds: ['apprentice'],
  }),
  define({
    id: 'journeyman',
    category: 'missions',
    tier: 'silver',
    icon: '⚒️',
    name: 'Journeyman',
    description: 'Complete 10 missions',
    condition: { type: 'missions_completed', value: 10 },
    reward: { xp: 500 },
  }),
  define({
    id: 'completionist',
    category: 'missions',
    tier: 'gold',
    icon: '👑',
    name: 'Completionist',
    description: 'Complete all missions',
    condition: { type: 'missions_completed', value: 'all' },
    reward: { xp: 1000 },
    legacyIds: ['master'],
  }),

  // Chapters
  chapter(1, 'Awakening', '🌅', 'bronze'),
  chapter(2, 'Memory Keeper', '🔐', 'bronze'),
  chapter(3, 'Forgemaster', '⚒️', 'silver'),
  chapter(4, 'Data Architect', '🏦', 'silver'),
  chapter(5, 'Protocol Pioneer', '🔗', 'silver'),
  chapter(6, 'Production Master', '⚡', 'gold'),
  chapter(7, 'Security Sentinel', '🛡️', 'gold'),

  // Level
  define({
    id: 'level_3',
    category: 'level',
    tier: 'bronze',
    icon: '🚀',
    name: 'Rising Star',
    description: 'Reach level 3',
    condition: { type: 'level', value: 3 },
    reward: { xp: 150 },
    legacyIds: ['level_up'],
  }),
  define({
    id: 'level_5',
    category: 'level',
    tier: 'silver',
    icon: '🛡️',
    name: 'Stellar Guardian',
    description: 'Reach level 5',
    condition: { type: 'level', value: 5 },
    reward: { xp: 300 },
    legacyIds: ['high_roller'],
  }),

  // XP
  define({
    id: 'xp_500',
    category: 'xp',
    tier: 'bronze',
    icon: '💎',
    name: 'XP Collector',
    description: 'Earn 500 XP',
    condition: { type: 'total_xp', value: 500 },
    reward: { xp: 100 },
    legacyIds: ['xp_collector'],
  }),
  define({
    id: 'xp_1000',
    category: 'xp',
    tier: 'silver',
    icon: '💰',
    name: 'XP Hoarder',
    description: 'Earn 1000 XP',
    condition: { type: 'total_xp', value: 1000 },
  }),
  define({
    id: 'xp_2000',
    category: 'xp',
    tier: 'gold',
    icon: '🏛️',
    name: 'XP Magnate',
    description: 'Earn 2000 XP',
    condition: { type: 'total_xp', value: 2000 },
    reward: { xp: 500 },
    legacyIds: ['xp_hoarder'],
  }),

  // Skill
  define({
    id: 'speed_demon',
    category: 'skill',
    tier: 'bronze',
    icon: '⚡',
    name: 'Speed Demon',
    description: 'Complete a mission on first try',
    condition: { type: 'first_try_missions', value: 1 },
    reward: { xp: 250 },
  }),
  define({
    id: 'perfectionist',
    category: 'skill',
    tier: 'gold',
    icon: '💯',
    name: 'Perfectionist',
    description: 'Complete 5 missions on first try',
    condition: { type: 'first_try_missions', value: 5 },
    reward: { xp: 400 },
  }),

  // Streak
  define({
    id: 'streak_starter',
    category: 'streak',
    tier: 'bronze',
    icon: '🔥',
    name: 'Streak Starter',
    description: 'Maintain a 3-day login streak',
    condition: { type: 'streak', value: 3 },
    reward: { xp: 100 },
  }),
  define({
    id: 'dedicated',
    category: 'streak',
    tier: 'silver',
    icon: '💪',
    name: 'Dedicated',
    description: 'Maintain a 7-day login streak',
    condition: { type: 'streak', value: 7 },
    reward: { xp: 300 },
  }),
  define({
    id: 'committed',
    category: 'streak',
    tier: 'gold',
    icon: '🌠',
    name: 'Committed',
    description: 'Maintain a 30-day login streak',
    condition: { type: 'streak', value: 30 },
    reward: { xp: 1000 },
  }),
];

export const ACHIEVEMENT_CATEGORIES: readonly AchievementCategory[] = [
  'missions',
  'chapters',
  'level',
  'xp',
  'skill',
  'streak',
];

/** localStorage keys used by the retired achievementEngine. */
export const LEGACY_ACHIEVEMENT_STORAGE_KEYS = [
  'soroban_quest_achievements',
  'soroban_quest_achievements_progress',
] as const;

const LEGACY_ID_MAP = new Map<string, string>(
  ACHIEVEMENTS.flatMap((a) => (a.legacyIds ?? []).map((legacy) => [legacy, a.id] as [string, string])),
);

/**
 * Map legacy ids to their unified id and drop duplicates, preserving order.
 * Unknown ids are kept so data from newer versions is never discarded.
 */
export function normalizeAchievementIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of ids) {
    if (typeof raw !== 'string') continue;
    const id = LEGACY_ID_MAP.get(raw) ?? raw;
    if (!seen.has(id)) {
      seen.add(id);
      result.push(id);
    }
  }
  return result;
}

/** Distinct completed ids that are real catalog missions (not theory quests). */
function countCatalogMissions(completed: string[], catalog: MissionCatalog): number {
  const missionIds = new Set(catalog.missionIds);
  return new Set(completed.filter((id) => missionIds.has(id))).size;
}

export function isConditionMet(
  condition: AchievementCondition,
  state: AchievementState,
  catalog: MissionCatalog = getMissionCatalog(),
): boolean {
  const completed = state.completedMissions ?? [];

  switch (condition.type) {
    case 'missions_completed':
      if (condition.value === 'all') {
        return (
          catalog.totalMissions > 0 &&
          catalog.missionIds.every((id) => completed.includes(id))
        );
      }
      return countCatalogMissions(completed, catalog) >= condition.value;
    case 'chapter_completed': {
      const ids = catalog.chapters[condition.chapter] ?? [];
      return ids.length > 0 && ids.every((id) => completed.includes(id));
    }
    case 'level':
      return (state.level ?? 1) >= condition.value;
    case 'total_xp':
      return (state.xp ?? 0) >= condition.value;
    case 'first_try_missions':
      return new Set(state.firstTryMissions ?? []).size >= condition.value;
    case 'streak':
      return (state.streak ?? 0) >= condition.value;
    default:
      return false;
  }
}

/**
 * Return the achievements that the state now satisfies but has not
 * unlocked yet, in definition order. Pure: does not mutate the state.
 */
export function evaluateAchievements(
  state: AchievementState,
  catalog: MissionCatalog = getMissionCatalog(),
): Achievement[] {
  const unlocked = new Set(normalizeAchievementIds(state.badges));
  return ACHIEVEMENTS.filter(
    (a) => !unlocked.has(a.id) && isConditionMet(a.condition, state, catalog),
  );
}
