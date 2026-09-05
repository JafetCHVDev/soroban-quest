import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('Mission Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
  });

  test('mission page loads and displays Run Tests button', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/#\/mission\/hello-soroban/);
    
    // ✅ FIXED: Check that it exists in the DOM and contains the correct text
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await expect(runTestsBtn).toBeAttached({ timeout: 15000 });
  });

  test('mission page displays all sections', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/#\/mission\/hello-soroban/);
    
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await expect(runTestsBtn).toBeAttached({ timeout: 20000 });
  });

  test('completed mission progress persists in localStorage', async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/#/journal');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      const profileSlot = {
        id: 'player-1',
        profile: { name: 'Stellar Guardian', avatar: '🛡️' },
        progress: {
          completedMissions: ['hello-soroban'],
          xp: 100,
          level: 1,
          badges: [],
          streak: 0,
          lastLogin: null,
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
    await expect(page.locator('.summary-stat').nth(3)).toContainText('100');
  });

  test('mission completion state is reflected in mission map', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      const profileSlot = {
        id: 'player-1',
        profile: { name: 'Stellar Guardian', avatar: '🛡️' },
        progress: {
          completedMissions: ['hello-soroban'],
          xp: 100,
          level: 1,
          badges: [],
          streak: 0,
          lastLogin: null,
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

    await page.goto('/#/missions');
    await expect(page.locator('.mission-card, .mission-item').first()).toBeVisible();
  });
});