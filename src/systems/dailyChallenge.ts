import { type Mission } from '../types/game';

/**
 * Returns a local date string (YYYY-MM-DD) for a given date.
 */
export function getDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's local date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  return getDateString(new Date());
}

/**
 * Returns the day of the year (1-365 or 1-366 in leap years) based on the provided date in local time, DST-safe.
 */
function getDayOfYear(date: Date): number {
  const year = date.getFullYear();
  // Use noon to avoid any DST transition day length anomalies (23h or 25h)
  const d = new Date(year, date.getMonth(), date.getDate(), 12, 0, 0);
  const start = new Date(year, 0, 1, 12, 0, 0);
  const diff = d.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round(diff / oneDay) + 1;
}

/**
 * Deterministically picks a mission from the list based on the date.
 */
export function getDailyChallengeMission(missions: Mission[], date: Date = new Date()): Mission {
  if (!missions || missions.length === 0) {
    throw new Error('No missions provided for daily challenge');
  }
  const dayOfYear = getDayOfYear(date);
  const index = (dayOfYear - 1) % missions.length;
  return missions[index];
}

/**
 * Checks if the daily challenge was already completed on the given date.
 */
export function isDailyChallengeCompleted(completedDates: string[], date: Date = new Date()): boolean {
  const dateString = getDateString(date);
  return completedDates.includes(dateString);
}
