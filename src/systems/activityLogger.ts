/* ==========================================
   Activity Logger — Quest Journal System
   ========================================== */

import { ActivityLog } from '../types';

const LOG_KEY = "soroban_quest_activity_log";
const MAX_LOG_SIZE = 200;

/**
 * Log types for different activities
 */
export const ACTIVITY_TYPES = {
  MISSION_STARTED: "MISSION_STARTED",
  MISSION_COMPLETED: "MISSION_COMPLETED",
  BADGE_EARNED: "BADGE_EARNED",
  LEVEL_UP: "LEVEL_UP",
  HINT_USED: "HINT_USED",
  EXPORT: "EXPORT",
  IMPORT: "IMPORT",
  STREAK: "STREAK",
  GOLD_EARNED: "GOLD_EARNED",
  SHOP_PURCHASE: "SHOP_PURCHASE",
} as const;

export type ActivityType = typeof ACTIVITY_TYPES[keyof typeof ACTIVITY_TYPES] | string;

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: ActivityType;
  data: Record<string, any>;
  message: string;
}

/**
 * Logs a new activity to localStorage
 */
export function logActivity(type: ActivityType, data: Record<string, any> = {}, message = ""): void {
  try {
    const log = getActivityLog();
    
    const newEntry: ActivityEntry = {
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      type,
      data,
      message
    };

    // Prepend to show newest first, then trim to max size
    const updatedLog = [newEntry, ...log].slice(0, MAX_LOG_SIZE);
    
    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));
    
    // Dispatch custom event for real-time UI updates if needed
    window.dispatchEvent(new CustomEvent("activity_logged", { detail: newEntry }));
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Retrieves the activity log from localStorage
 */
export function getActivityLog(): ActivityEntry[] {
  try {
    const data = localStorage.getItem(LOG_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Clears the activity log
 */
export function clearLog(): void {
  localStorage.removeItem(LOG_KEY);
}
