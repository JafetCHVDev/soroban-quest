import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Seed both soroban_quest_profiles (new storage) AND soroban_quest_progress
 * (legacy mirror) so the app always picks up the correct state regardless of
 * which path it reads first.
 *
 * Why navigate via about:blank?
 * The app uses HashRouter, so going from '/' to '/#/shop' is a fragment-only
 * change in the same document — the browser does NOT reload and React stays
 * mounted with stale state. Routing through about:blank forces a full
 * document load when we arrive at /#/shop, so GameStateContext re-reads
 * the freshly seeded localStorage.
 */
async function gotoShopWithState(
  page: Parameters<typeof clearLocalStorageBeforePageLoad>[0],
  opts: { gold: number; purchasedItems?: string[] },
) {
  const progress = {
    xp: 0,
    gold: opts.gold,
    level: 1,
    completedMissions: [],
    badges: [],
    firstTryMissions: [],
    currentMission: null,
    missionAttempts: {},
    streak: 0,
    lastLogin: null,
    purchasedItems: opts.purchasedItems ?? [],
    xpBoostActive: false,
    streakFreezeUsed: false,
  };

  // We are already on '/' after clearLocalStorageBeforePageLoad.
  // Seed localStorage before navigating away.
  await page.evaluate((payload) => {
    const profileId = 'player-1';
    const slot = {
      id: profileId,
      profile: { name: 'Test Hero', avatar: '🛡️' },
      progress: payload,
    };
    localStorage.setItem('soroban_quest_profiles', JSON.stringify([slot]));
    localStorage.setItem('soroban_quest_active_profile', profileId);
    // Legacy mirror — ensures the app never falls back to a stale snapshot
    localStorage.setItem('soroban_quest_progress', JSON.stringify(payload));
  }, progress);

  // Route through about:blank to force a full document load on the shop URL,
  // so the React app remounts and picks up the seeded localStorage state.
  await page.goto('about:blank');
  await page.goto('http://127.0.0.1:4173/#/shop');
  await page.locator('.shop-grid').waitFor({ state: 'visible' });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Shop Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
  });

  // -------------------------------------------------------------------------
  // 1. Rendering — grid + balance display
  // -------------------------------------------------------------------------
  test('navigating to /shop renders the shop grid and the player gold balance', async ({ page }) => {
    const GOLD = 800;
    await gotoShopWithState(page, { gold: GOLD });

    // Page title
    await expect(page.locator('.shop-title')).toHaveText('Shop');

    // Balance shows seeded gold amount
    await expect(page.locator('.balance-amount')).toHaveText(String(GOLD));

    // All 6 items are visible by default ("All" category)
    await expect(page.locator('.shop-item')).toHaveCount(6);

    // Shop grid is present
    await expect(page.locator('.shop-grid')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // 2. Unaffordable state — no purchase, button disabled
  // -------------------------------------------------------------------------
  test('items costing more gold than the player has are disabled and gold is not deducted', async ({ page }) => {
    // 0 gold → ALL items are unaffordable
    await gotoShopWithState(page, { gold: 0 });

    // Every item card should carry the "unaffordable" class
    const items = page.locator('.shop-item');
    await expect(items).toHaveCount(6);
    for (const item of await items.all()) {
      await expect(item).toHaveClass(/unaffordable/);
    }

    // All buy buttons are disabled
    const buyButtons = page.locator('.shop-item-btn:not(.purchased)');
    for (const btn of await buyButtons.all()) {
      await expect(btn).toBeDisabled();
    }

    // Clicking a disabled button does not change the balance (force to bypass Playwright guard)
    const firstBtn = page.locator('.shop-item-btn').first();
    await firstBtn.click({ force: true });
    await expect(page.locator('.balance-amount')).toHaveText('0');
  });

  // -------------------------------------------------------------------------
  // 3. Successful purchase — gold deducted, item marked owned
  // -------------------------------------------------------------------------
  test('buying an affordable item deducts the correct amount and marks it as owned', async ({ page }) => {
    // 200 gold — enough for Hint Token (150 g) but nothing more expensive
    await gotoShopWithState(page, { gold: 200 });

    await expect(page.locator('.balance-amount')).toHaveText('200');

    // The Hint Token card
    const hintTokenCard = page.locator('.shop-item', { hasText: 'Hint Token' });
    await expect(hintTokenCard).toBeVisible();
    await expect(hintTokenCard).not.toHaveClass(/unaffordable/);

    const buyBtn = hintTokenCard.locator('.shop-item-btn');
    await expect(buyBtn).toHaveText('Buy');
    await expect(buyBtn).not.toBeDisabled();

    // Perform the purchase
    await buyBtn.click();

    // Gold deducted: 200 − 150 = 50
    await expect(page.locator('.balance-amount')).toHaveText('50');

    // Item now shows "Purchased" and the button is disabled
    await expect(buyBtn).toHaveText('Purchased');
    await expect(buyBtn).toBeDisabled();
    await expect(hintTokenCard).toHaveClass(/purchased/);
  });

  // -------------------------------------------------------------------------
  // 4. Persistence — owned items survive a page reload
  // -------------------------------------------------------------------------
  test('purchased items remain owned after a page reload', async ({ page }) => {
    // Pre-seed hint-token as already purchased
    await gotoShopWithState(page, { gold: 500, purchasedItems: ['hint-token'] });

    const hintTokenCard = page.locator('.shop-item', { hasText: 'Hint Token' });
    const btn = hintTokenCard.locator('.shop-item-btn');

    await expect(btn).toHaveText('Purchased');
    await expect(btn).toBeDisabled();
    await expect(hintTokenCard).toHaveClass(/purchased/);

    // Reload and verify the state is still there
    await page.reload();
    await page.locator('.shop-grid').waitFor({ state: 'visible' });

    await expect(hintTokenCard).toHaveClass(/purchased/);
    await expect(btn).toHaveText('Purchased');
    await expect(btn).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // 5. Category filters
  // -------------------------------------------------------------------------
  test('category filter buttons narrow down the visible shop items', async ({ page }) => {
    await gotoShopWithState(page, { gold: 0 });

    // "All" is selected by default — 6 items
    await expect(page.locator('.shop-item')).toHaveCount(6);

    // Avatars category — 2 items (Avatar Pack 1 & 2)
    await page.locator('.shop-category-btn', { hasText: 'Avatars' }).click();
    await expect(page.locator('.shop-item')).toHaveCount(2);

    // Boosts category — 3 items (XP Boost, Streak Freeze, Hint Token)
    await page.locator('.shop-category-btn', { hasText: 'Boosts' }).click();
    await expect(page.locator('.shop-item')).toHaveCount(3);

    // Badges category — 1 item (Premium Badge)
    await page.locator('.shop-category-btn', { hasText: 'Badges' }).click();
    await expect(page.locator('.shop-item')).toHaveCount(1);

    // Back to All
    await page.locator('.shop-category-btn', { hasText: 'All' }).click();
    await expect(page.locator('.shop-item')).toHaveCount(6);
  });

  // -------------------------------------------------------------------------
  // 6. localStorage updated after purchase
  // -------------------------------------------------------------------------
  test('localStorage is updated with correct gold and purchasedItems after a purchase', async ({ page }) => {
    await gotoShopWithState(page, { gold: 400 });

    await expect(page.locator('.balance-amount')).toHaveText('400');

    // Buy Streak Freeze (300 g)
    const streakFreezeCard = page.locator('.shop-item', { hasText: 'Streak Freeze' });
    const buyBtn = streakFreezeCard.locator('.shop-item-btn');
    await expect(buyBtn).not.toBeDisabled();
    await buyBtn.click();

    // Verify UI first
    await expect(page.locator('.balance-amount')).toHaveText('100');

    // Verify localStorage — check soroban_quest_progress (legacy mirror written by saveProgress)
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('soroban_quest_progress');
      return raw ? JSON.parse(raw) : null;
    });

    expect(stored).not.toBeNull();
    expect(stored.gold).toBe(100);
    // Purchases are now tracked in inventory.owned (see storage.js legacy migration)
    // rather than the old purchasedItems array.
    expect(stored.inventory.owned).toContain('streak-freeze');
  });
});
