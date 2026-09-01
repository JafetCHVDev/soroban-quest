/* ==========================================
   Activity Logger — Quest Journal System
   ========================================== */

const LOG_KEY = "soroban_quest_activity_log";
const MAX_LOG_SIZE = 200;

export interface ActivityEntry {
  id: string;
  timestamp: string;
  type: string;
  data: Record<string, unknown>;
  message: string;
}

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
};

/**
 * Logs a new activity to localStorage
 * @param type - Use ACTIVITY_TYPES
 * @param data - Metadata for the event (e.g., missionId, badgeName)
 * @param message - Human-readable description
 */
export function logActivity(
  type: string,
  data: Record<string, unknown> = {},
  message = ""
): void {
  try {
    const log = getActivityLog();

    const newEntry: ActivityEntry = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      type,
      data,
      message,
    };

    // Prepend to show newest first, then trim to max size
    const updatedLog = [newEntry, ...log].slice(0, MAX_LOG_SIZE);

    localStorage.setItem(LOG_KEY, JSON.stringify(updatedLog));

    // Dispatch custom event for real-time UI updates if needed
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("activity_logged", { detail: newEntry })
      );
    }
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

/**
 * Retrieves the activity log from localStorage
 * @returns List of activity objects
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
