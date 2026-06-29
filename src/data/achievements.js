/* ==========================================
   ACHIEVEMENTS DATA
   ========================================== */

export const ACHIEVEMENTS = [
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first mission",
    icon: "👣",
    category: "missions",
    condition: {
      type: "missions_completed",
      value: 1,
    },
    reward: {
      xp: 50,
    },
  },
  {
    id: "apprentice",
    name: "Apprentice",
    description: "Complete 5 missions",
    icon: "🎓",
    category: "missions",
    condition: {
      type: "missions_completed",
      value: 5,
    },
    reward: {
      xp: 200,
    },
  },
  {
    id: "journeyman",
    name: "Journeyman",
    description: "Complete 10 missions",
    icon: "⚒️",
    category: "missions",
    condition: {
      type: "missions_completed",
      value: 10,
    },
    reward: {
      xp: 500,
    },
  },
  {
    id: "master",
    name: "Master",
    description: "Complete all available missions",
    icon: "🏆",
    category: "missions",
    condition: {
      type: "missions_completed",
      value: "all",
    },
    reward: {
      xp: 1000,
    },
  },
  {
    id: "xp_collector",
    name: "XP Collector",
    description: "Earn 500 total XP",
    icon: "💎",
    category: "xp",
    condition: {
      type: "total_xp",
      value: 500,
    },
    reward: {
      xp: 100,
    },
  },
  {
    id: "xp_hoarder",
    name: "XP Hoarder",
    description: "Earn 2000 total XP",
    icon: "👑",
    category: "xp",
    condition: {
      type: "total_xp",
      value: 2000,
    },
    reward: {
      xp: 500,
    },
  },
  {
    id: "level_up",
    name: "Level Up",
    description: "Reach level 3",
    icon: "📈",
    category: "level",
    condition: {
      type: "level",
      value: 3,
    },
    reward: {
      xp: 150,
    },
  },
  {
    id: "high_roller",
    name: "High Roller",
    description: "Reach level 5",
    icon: "🎰",
    category: "level",
    condition: {
      type: "level",
      value: 5,
    },
    reward: {
      xp: 300,
    },
  },
  {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Complete 3 missions on first try",
    icon: "⚡",
    category: "skill",
    condition: {
      type: "first_try_missions",
      value: 3,
    },
    reward: {
      xp: 250,
    },
  },
  {
    id: "perfectionist",
    name: "Perfectionist",
    description: "Complete 5 missions on first try",
    icon: "💯",
    category: "skill",
    condition: {
      type: "first_try_missions",
      value: 5,
    },
    reward: {
      xp: 400,
    },
  },
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "Maintain a 3-day login streak",
    icon: "🔥",
    category: "streak",
    condition: {
      type: "streak",
      value: 3,
    },
    reward: {
      xp: 100,
    },
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Maintain a 7-day login streak",
    icon: "💪",
    category: "streak",
    condition: {
      type: "streak",
      value: 7,
    },
    reward: {
      xp: 300,
    },
  },
  {
    id: "committed",
    name: "Committed",
    description: "Maintain a 30-day login streak",
    icon: "🌟",
    category: "streak",
    condition: {
      type: "streak",
      value: 30,
    },
    reward: {
      xp: 1000,
    },
  },
];

export const ACHIEVEMENT_CATEGORIES = {
  missions: "Missions",
  xp: "Experience",
  level: "Level",
  skill: "Skill",
  streak: "Streak",
};
