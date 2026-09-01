/**
 * @file achievements.ts
 * Achievement/badge definitions and categories
 */

import type { Badge } from '../types/game';

/**
 * Reward for unlocking an achievement
 */
export interface AchievementReward {
  xp?: number;
  gold?: number;
  badge?: string;
}

/**
 * Condition for unlocking an achievement
 */
export interface AchievementCondition {
  type: string;
  value: number | string;
}

/**
 * Achievement condition metadata
 */
export interface AchievementMeta {
  category: string;
  conditionMeta: AchievementCondition;
  reward: AchievementReward;
}

/**
 * Extended badge with achievement metadata
 */
export interface Achievement extends Badge, AchievementMeta {}

export const ACHIEVEMENTS: readonly Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first mission',
    icon: '👣',
    category: 'missions',
    conditionMeta: {
      type: 'missions_completed',
      value: 1,
    },
    reward: {
      xp: 50,
    },
    condition: (state) => state.completedMissions.length >= 1,
  },
  {
    id: 'apprentice',
    name: 'Apprentice',
    description: 'Complete 5 missions',
    icon: '🎓',
    category: 'missions',
    conditionMeta: {
      type: 'missions_completed',
      value: 5,
    },
    reward: {
      xp: 200,
    },
    condition: (state) => state.completedMissions.length >= 5,
  },
  {
    id: 'journeyman',
    name: 'Journeyman',
    description: 'Complete 10 missions',
    icon: '⚒️',
    category: 'missions',
    conditionMeta: {
      type: 'missions_completed',
      value: 10,
    },
    reward: {
      xp: 500,
    },
    condition: (state) => state.completedMissions.length >= 10,
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Complete all available missions',
    icon: '🏆',
    category: 'missions',
    conditionMeta: {
      type: 'missions_completed',
      value: 'all',
    },
    reward: {
      xp: 1000,
    },
    condition: (state) => state.completedMissions.length >= 19,
  },
  {
    id: 'xp_collector',
    name: 'XP Collector',
    description: 'Earn 500 total XP',
    icon: '💎',
    category: 'xp',
    conditionMeta: {
      type: 'total_xp',
      value: 500,
    },
    reward: {
      xp: 100,
    },
    condition: (state) => state.xp >= 500,
  },
  {
    id: 'xp_hoarder',
    name: 'XP Hoarder',
    description: 'Earn 2000 total XP',
    icon: '👑',
    category: 'xp',
    conditionMeta: {
      type: 'total_xp',
      value: 2000,
    },
    reward: {
      xp: 500,
    },
    condition: (state) => state.xp >= 2000,
  },
  {
    id: 'level_up',
    name: 'Level Up',
    description: 'Reach level 3',
    icon: '📈',
    category: 'level',
    conditionMeta: {
      type: 'level',
      value: 3,
    },
    reward: {
      xp: 150,
    },
    condition: (state) => state.level >= 3,
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Reach level 5',
    icon: '🎰',
    category: 'level',
    conditionMeta: {
      type: 'level',
      value: 5,
    },
    reward: {
      xp: 300,
    },
    condition: (state) => state.level >= 5,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 3 missions on first try',
    icon: '⚡',
    category: 'skill',
    conditionMeta: {
      type: 'first_try_missions',
      value: 3,
    },
    reward: {
      xp: 250,
    },
    condition: (state) => (state.firstTryMissions?.length ?? 0) >= 3,
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 5 missions on first try',
    icon: '💯',
    category: 'skill',
    conditionMeta: {
      type: 'first_try_missions',
      value: 5,
    },
    reward: {
      xp: 400,
    },
    condition: (state) => (state.firstTryMissions?.length ?? 0) >= 5,
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Maintain a 3-day login streak',
    icon: '🔥',
    category: 'streak',
    conditionMeta: {
      type: 'streak',
      value: 3,
    },
    reward: {
      xp: 100,
    },
    condition: (state) => state.streak >= 3,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7-day login streak',
    icon: '💪',
    category: 'streak',
    conditionMeta: {
      type: 'streak',
      value: 7,
    },
    reward: {
      xp: 300,
    },
    condition: (state) => state.streak >= 7,
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Maintain a 30-day login streak',
    icon: '🌟',
    category: 'streak',
    conditionMeta: {
      type: 'streak',
      value: 30,
    },
    reward: {
      xp: 1000,
    },
    condition: (state) => state.streak >= 30,
  },
];

export const ACHIEVEMENT_CATEGORIES = {
  missions: 'Missions',
  xp: 'Experience',
  level: 'Level',
  skill: 'Skill',
  streak: 'Streak',
} as const;

export type AchievementCategory = keyof typeof ACHIEVEMENT_CATEGORIES;
