/* ==========================================
   Leaderboard — per-category rankings of local profiles
   ========================================== */

export const LEADERBOARD_CATEGORIES = ['xp', 'missions', 'streak', 'badges', 'gold'] as const;

export type LeaderboardCategory = (typeof LEADERBOARD_CATEGORIES)[number];

export const DEFAULT_LEADERBOARD_CATEGORY: LeaderboardCategory = 'xp';

/** Minimal profile slot shape needed for ranking. Missing progress counts as 0. */
export interface RankableProfile {
  id: string;
  profile?: { name?: string };
  progress?: {
    xp?: number;
    level?: number;
    gold?: number;
    streak?: number;
    completedMissions?: unknown[];
    badges?: unknown[];
  };
}

export function isLeaderboardCategory(value: unknown): value is LeaderboardCategory {
  return (
    typeof value === 'string' &&
    (LEADERBOARD_CATEGORIES as readonly string[]).includes(value)
  );
}

function num(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function count(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/** The value a profile is ranked by in the given category. */
export function getCategoryValue(slot: RankableProfile, category: LeaderboardCategory): number {
  const progress = slot.progress ?? {};
  switch (category) {
    case 'xp':
      return num(progress.xp);
    case 'missions':
      return count(progress.completedMissions);
    case 'streak':
      return num(progress.streak);
    case 'badges':
      return count(progress.badges);
    case 'gold':
      return num(progress.gold);
    default:
      return 0;
  }
}

function compareText(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Rank profiles for a category, highest first. Pure: returns a new array.
 *
 * Deterministic tie-breaking: category value, then XP, level and completed
 * missions (all descending), then profile name and finally profile id
 * (ascending, plain code-unit order so the result never depends on locale).
 */
export function rankProfiles<T extends RankableProfile>(
  profiles: readonly T[],
  category: LeaderboardCategory,
): T[] {
  return [...profiles].sort((a, b) => {
    const diffs = [
      getCategoryValue(b, category) - getCategoryValue(a, category),
      num(b.progress?.xp) - num(a.progress?.xp),
      num(b.progress?.level) - num(a.progress?.level),
      count(b.progress?.completedMissions) - count(a.progress?.completedMissions),
    ];
    for (const diff of diffs) {
      if (diff !== 0) return diff;
    }
    return (
      compareText(a.profile?.name ?? '', b.profile?.name ?? '') ||
      compareText(a.id, b.id)
    );
  });
}
