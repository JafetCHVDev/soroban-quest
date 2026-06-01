import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('Streak System', () => {
  test('streak defaults to 0 when not set', async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/#/journal');
    await expect(page.locator('.summary-stat').nth(4).locator('.summary-stat-value')).toHaveText('0');
  });

  test('streak is displayed in journal when set via localStorage', async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/');
    
    // Set progress with streak directly
    await page.evaluate(() => {
      const progress = {
        streak: 5,
        lastLogin: new Date().toISOString().split('T')[0],
        completedMissions: [],
        badges: [],
        xp: 0,
        level: 1
      };
      localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
    });

    await page.goto('/#/journal');
    await expect(page.locator('.summary-stat').nth(4).locator('.summary-stat-value')).toHaveText('5');
  });
});
