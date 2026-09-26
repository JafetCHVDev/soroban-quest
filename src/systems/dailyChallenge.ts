import { type Mission } from '../types/game';

/**
 * Returns the day of the year (1-365 or 1-366 in leap years) based on the provided date.
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Deterministically picks a mission from the list based on the date.
 */
export function getDailyChallengeMission(missions: Mission[], date: Date = new Date()): Mission {
  const dayOfYear = getDayOfYear(date);
  // Using simple modulo to pick a mission
  const index = dayOfYear % missions.length;
  return missions[index];
}

/**
 * Checks if the daily challenge was already completed on the given date.
 */
export function isDailyChallengeCompleted(completedDates: string[], date: Date = new Date()): boolean {
  const dateString = date.toISOString().split('T')[0];
  return completedDates.includes(dateString);
}

/**
 * Returns today's date string (YYYY-MM-DD).
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
