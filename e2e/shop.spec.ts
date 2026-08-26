import { test, expect, type Page } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

const DEFAULT_PROGRESS = {
  xp: 0,
  gold: 0,
  level: 1,
  completedMissions: [],
  badges: [],
  firstTryMissions: [],
  currentMission: null,
  missionAttempts: {},
  streak: 0,
  lastLogin: null,
  purchasedItems: [],
  xpBoostActive: false,
  streakFreezeUsed: false,
};

async function seedProgress(page: Page, overrides: Partial<typeof DEFAULT_PROGRESS> = {}) {
  await page.goto('/');
  await page.evaluate((progress) => {
    localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  }, { ...DEFAULT_PROGRESS, ...overrides });
  await page.reload();
}

function shopItem(page: Page, itemName: string) {
  return page.locator('.shop-item').filter({ hasText: itemName });
}

test.describe('Shop Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
  });

  test('renders shop items and the player gold balance', async ({ page }) => {
    await seedProgress(page, { gold: 750 });
    await page.goto('/#/shop');

    await expect(page).toHaveURL(/#\/shop/);
    await expect(page.locator('.shop-title')).toHaveText('Shop');
    await expect(page.locator('.balance-amount')).toHaveText('750');
    await expect(page.locator('.shop-grid .shop-item')).toHaveCount(6);
  });

  test('disables unaffordable purchases without deducting gold', async ({ page }) => {
    await seedProgress(page, { gold: 100 });
    await page.goto('/#/shop');

    const item = shopItem(page, 'Avatar Pack 1');
    await expect(item).toHaveClass(/unaffordable/);
    await expect(item.locator('button')).toBeDisabled();
    await expect(item.locator('button')).toHaveAttribute('aria-label', 'Purchase Avatar Pack 1 for 500 Gold');

    await expect(page.locator('.balance-amount')).toHaveText('100');
    const storedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('soroban_quest_progress') || 'null'));
    expect(storedProgress.gold).toBe(100);
    expect(storedProgress.purchasedItems).toEqual([]);
  });

  test('purchases an affordable item and marks it as owned', async ({ page }) => {
    await seedProgress(page, { gold: 500 });
    await page.goto('/#/shop');

    const item = shopItem(page, 'Avatar Pack 1');
    await item.locator('button').click();

    await expect(page.locator('.balance-amount')).toHaveText('0');
    await expect(item).toHaveClass(/purchased/);
    await expect(item.locator('button')).toHaveText('Purchased');
    await expect(item.locator('button')).toBeDisabled();

    const storedProgress = await page.evaluate(() => JSON.parse(localStorage.getItem('soroban_quest_progress') || 'null'));
    expect(storedProgress.gold).toBe(0);
    expect(storedProgress.purchasedItems).toContain('avatar-pack-1');
  });

  test('persists owned items after a page reload', async ({ page }) => {
    await seedProgress(page, { gold: 500 });
    await page.goto('/#/shop');

    const item = shopItem(page, 'Avatar Pack 1');
    await item.locator('button').click();
    await expect(item.locator('button')).toHaveText('Purchased');

    await page.reload();

    const reloadedItem = shopItem(page, 'Avatar Pack 1');
    await expect(page.locator('.balance-amount')).toHaveText('0');
    await expect(reloadedItem).toHaveClass(/purchased/);
    await expect(reloadedItem.locator('button')).toHaveText('Purchased');
    await expect(reloadedItem.locator('button')).toBeDisabled();
  });
});
