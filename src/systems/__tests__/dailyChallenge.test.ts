import { describe, test, expect } from "vitest";
import { getDailyChallengeMission, isDailyChallengeCompleted } from '../dailyChallenge';

describe('dailyChallenge system', () => {
  const mockMissions = [
    { id: 'm1' },
    { id: 'm2' },
    { id: 'm3' },
  ] as any;

  test('getDailyChallengeMission picks mission deterministically', () => {
    const date1 = new Date(2026, 0, 1);
    const date2 = new Date(2026, 0, 2);
    
    // getDayOfYear for Jan 1:
    // start = new Date(2026, 0, 0) -> Dec 31, 2025.
    // diff = Jan 1 - Dec 31 = 1 day.
    // Math.floor(1 day / 1 day) = 1.
    // So Jan 1 is index 1 % 3 = 1.
    
    const m1 = getDailyChallengeMission(mockMissions, date1);
    const m2 = getDailyChallengeMission(mockMissions, date2);
    
    expect(m1.id).toBe('m2');
    expect(m2.id).toBe('m3');
  });

  test('isDailyChallengeCompleted tracks completion correctly', () => {
    const completedDates = ['2026-09-25'];
    expect(isDailyChallengeCompleted(completedDates, new Date(2026, 8, 25))).toBe(true);
    expect(isDailyChallengeCompleted(completedDates, new Date(2026, 8, 26))).toBe(false);
  });
});
