import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('Streak System', () => {
  test('streak defaults to 0 when not set', async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/#/journal');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.summary-stat').nth(4).locator('.summary-stat-value')).toHaveText('0');
  });

  test('streak is displayed in journal when set via localStorage', async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/#/journal');
    await page.waitForLoadState('networkidle');
    
    // Set progress with streak directly using the profile system
    await page.evaluate(() => {
      const profileSlot = {
        id: 'player-1',
        profile: { name: 'Stellar Guardian', avatar: '🛡️' },
        progress: {
          streak: 5,
          lastLogin: new Date().toISOString().split('T')[0],
          completedMissions: [],
          badges: [],
          xp: 0,
          level: 1,
          gold: 0,
          purchasedItems: [],
          firstTryMissions: [],
          missionAttempts: {},
        },
      };
      localStorage.setItem('soroban_quest_profiles', JSON.stringify([profileSlot]));
      localStorage.setItem('soroban_quest_active_profile', 'player-1');
      localStorage.removeItem('soroban_quest_progress');
      localStorage.removeItem('soroban_quest_profile');
    });

    await page.reload();
    await page.goto('/#/journal');
    await expect(page.locator('.summary-stat').nth(4).locator('.summary-stat-value')).toHaveText('5');
  });
});
