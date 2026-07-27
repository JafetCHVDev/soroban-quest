/* ==========================================
   ACHIEVEMENT ENGINE
   Evaluates conditions, tracks progress, and persists state
   ========================================== */

import { ACHIEVEMENTS } from "../data/achievements";
import { logActivity, ACTIVITY_TYPES } from "./activityLogger";

const ACHIEVEMENTS_KEY = "soroban_quest_achievements";
const ACHIEVEMENTS_PROGRESS_KEY = "soroban_quest_achievements_progress";

/**
 * Get default achievement state structure
 */
function getDefaultAchievementState() {
  return {
    unlocked: [],
    progress: {},
    lastUpdated: null,
  };
}

/**
 * Load achievement state from localStorage
 */
export function loadAchievementState() {
  try {
    const data = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (!data) {
      return getDefaultAchievementState();
    }
    const parsed = JSON.parse(data);
    return {
      ...getDefaultAchievementState(),
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load achievement state:", error);
    return getDefaultAchievementState();
  }
}

/**
 * Save achievement state to localStorage
 */
export function saveAchievementState(state) {
  try {
    const toSave = {
      ...state,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(toSave));
  } catch (error) {
    console.error("Failed to save achievement state:", error);
  }
}

/**
 * Evaluate a single achievement condition against game state
 */
function evaluateCondition(condition, gameState, totalMissions) {
  const completedMissions = gameState.completedMissions || [];
  
  switch (condition.type) {
    case "missions_completed":
      if (condition.value === "all") {
        return completedMissions.length >= totalMissions;
      }
      return completedMissions.length >= condition.value;

    case "total_xp":
      return (gameState.xp || 0) >= condition.value;

    case "level":
      return (gameState.level || 1) >= condition.value;

    case "first_try_missions":
      return (gameState.firstTryMissions || []).length >= condition.value;

    case "streak":
      return (gameState.streak || 0) >= condition.value;

    default:
      console.warn(`Unknown condition type: ${condition.type}`);
      return false;
  }
}

/**
 * Check if an achievement is unlocked
 */
export function isAchievementUnlocked(achievementId) {
  const state = loadAchievementState();
  return state.unlocked.includes(achievementId);
}

/**
 * Get progress for a specific achievement (0-1)
 */
export function getAchievementProgress(achievementId, gameState, totalMissions) {
  const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!achievement) return 0;

  const state = loadAchievementState();
  
  // If already unlocked, return 1
  if (state.unlocked.includes(achievementId)) return 1;

  const condition = achievement.condition;
  let current = 0;
  let target = condition.value;

  switch (condition.type) {
    case "missions_completed":
      current = gameState.completedMissions.length;
      if (target === "all") target = totalMissions;
      break;

    case "total_xp":
      current = gameState.xp;
      break;

    case "level":
      current = gameState.level;
      break;

    case "first_try_missions":
      current = (gameState.firstTryMissions || []).length;
      break;

    case "streak":
      current = gameState.streak || 0;
      break;

    default:
      return 0;
  }

  return Math.min(current / target, 1);
}

/**
 * Check and unlock achievements based on current game state
 */
export function checkAchievements(gameState, totalMissions = 10) {
  const achievementState = loadAchievementState();
  const newlyUnlocked = [];

  for (const achievement of ACHIEVEMENTS) {
    // Skip if already unlocked
    if (achievementState.unlocked.includes(achievement.id)) {
      continue;
    }

    // Evaluate condition
    const isUnlocked = evaluateCondition(
      achievement.condition,
      gameState,
      totalMissions
    );

    if (isUnlocked) {
      newlyUnlocked.push(achievement);
      achievementState.unlocked.push(achievement.id);
      
      // Log the achievement
      logActivity(
        ACTIVITY_TYPES.BADGE_EARNED,
        { achievementId: achievement.id, achievementName: achievement.name },
        `Achievement unlocked: "${achievement.name}"`
      );
    }
  }

  // Save state if new achievements were unlocked
  if (newlyUnlocked.length > 0) {
    saveAchievementState(achievementState);
  }

  return {
    newlyUnlocked,
    totalUnlocked: achievementState.unlocked.length,
    totalAchievements: ACHIEVEMENTS.length,
  };
}

/**
 * Get all achievements with their unlock status
 */
export function getAllAchievements(gameState, totalMissions = 10) {
  const achievementState = loadAchievementState();

  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    isUnlocked: achievementState.unlocked.includes(achievement.id),
    progress: getAchievementProgress(achievement.id, gameState, totalMissions),
    unlockedAt: achievementState.progress[achievement.id]?.unlockedAt || null,
  }));
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category, gameState, totalMissions = 10) {
  const allAchievements = getAllAchievements(gameState, totalMissions);
  return allAchievements.filter((a) => a.category === category);
}

/**
 * Reset achievement state (for testing/debugging)
 */
export function resetAchievementState() {
  try {
    localStorage.removeItem(ACHIEVEMENTS_KEY);
    localStorage.removeItem(ACHIEVEMENTS_PROGRESS_KEY);
    return getDefaultAchievementState();
  } catch (error) {
    console.error("Failed to reset achievement state:", error);
    return getDefaultAchievementState();
  }
}

/**
 * Get achievement statistics
 */
export function getAchievementStats() {
  const state = loadAchievementState();
  const total = ACHIEVEMENTS.length;
  const unlocked = state.unlocked.length;
  const percentage = total > 0 ? (unlocked / total) * 100 : 0;

  return {
    total,
    unlocked,
    locked: total - unlocked,
    percentage: Math.round(percentage),
  };
}
