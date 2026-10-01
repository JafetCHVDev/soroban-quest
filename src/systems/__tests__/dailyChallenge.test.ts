import { describe, test, expect } from "vitest";
import { getDailyChallengeMission, isDailyChallengeCompleted, getDateString } from '../dailyChallenge';
import { type Mission } from '../../types/game';

describe('dailyChallenge system', () => {
  const mockMissions: Mission[] = [
    { id: 'm1', chapter: 1, order: 1, difficulty: 'beginner', xpReward: 100, template: '', solution: '', checks: [], conceptsIntroduced: [], i18n: {} },
    { id: 'm2', chapter: 1, order: 2, difficulty: 'beginner', xpReward: 100, template: '', solution: '', checks: [], conceptsIntroduced: [], i18n: {} },
    { id: 'm3', chapter: 1, order: 3, difficulty: 'beginner', xpReward: 100, template: '', solution: '', checks: [], conceptsIntroduced: [], i18n: {} },
  ];

  test('getDailyChallengeMission picks mission deterministically', () => {
    const date1 = new Date(2026, 0, 1); // Jan 1 -> day 1 -> index 0
    const date2 = new Date(2026, 0, 2); // Jan 2 -> day 2 -> index 1
    
    const m1 = getDailyChallengeMission(mockMissions, date1);
    const m2 = getDailyChallengeMission(mockMissions, date2);
    
    expect(m1.id).toBe('m1');
    expect(m2.id).toBe('m2');
  });

  test('isDailyChallengeCompleted tracks completion correctly', () => {
    const completedDates = ['2026-09-25'];
    expect(isDailyChallengeCompleted(completedDates, new Date(2026, 8, 25))).toBe(true);
    expect(isDailyChallengeCompleted(completedDates, new Date(2026, 8, 26))).toBe(false);
  });

  test('getDateString formats local date correctly', () => {
    const d = new Date(2026, 8, 29); // Sep 29, 2026
    expect(getDateString(d)).toBe('2026-09-29');
  });
});
