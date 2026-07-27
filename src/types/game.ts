/* ==========================================
   Game Data & State Types
   ========================================== */

export interface MissionCheck {
  type: string;
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

export interface MissionI18nEntry {
  title?: string;
  story?: string;
  learningGoal?: string;
  hints?: string[];
}

export interface Mission {
  id: string;
  chapter: number;
  order: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | string;
  xpReward: number;
  title?: string;
  story?: string;
  learningGoal?: string;
  hints?: string[];
  template: string;
  solution: string;
  checks: MissionCheck[];
  conceptsIntroduced: string[];
  i18n?: Record<string, MissionI18nEntry>;
}

export interface CampaignI18nEntry {
  title?: string;
  description?: string;
  lore?: string;
}

export interface Campaign {
  id: string;
  heroImage: string;
  chapterNumber: number;
  missionIds: string[];
  requiredLevel: number;
  requiredMissionsCompleted?: number;
  color: string;
  icon?: string;
  difficulty?: string;
  title?: string;
  description?: string;
  lore?: string;
  missions?: string[];
  i18n?: Record<string, CampaignI18nEntry>;
}

export interface AchievementCondition {
  type: 'missions_completed' | 'total_xp' | 'level' | 'first_try_missions' | 'streak' | string;
  value: number | 'all';
}

export interface AchievementReward {
  xp: number;
  badge?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'missions' | 'xp' | 'level' | 'skill' | 'streak' | string;
  condition: AchievementCondition;
  reward: AchievementReward;
  unlockedAt?: string | null;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
}

export interface Profile {
  username: string;
  avatar: string;
  title: string;
  bio: string;
  joinedDate: string;
}

export interface ActivityLog {
  id: string;
  type: string;
  timestamp: string;
  details: Record<string, any>;
}

export interface MissionProgressEntry {
  code?: string;
  completed?: boolean;
  completedAt?: string;
  attempts?: number;
  bestTime?: number;
  firstTry?: boolean;
  hintsUsed?: number;
}

export interface GameState {
  level: number;
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  completedMissions: string[];
  missionProgress: Record<string, MissionProgressEntry>;
  unlockedAchievements: string[];
  equippedAvatar: string;
  unlockedAvatars: string[];
  profile: Profile;
  activityLogs?: ActivityLog[];
  savedCode?: Record<string, string>;
}
