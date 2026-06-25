/**
 * Visual Regression Tests
 *
 * These tests capture full-page screenshots of each main route and compare
 * them against stored baseline snapshots.  A failing test means a visible
 * change was detected – intentional changes should be committed with updated
 * snapshots (see docs/visual-regression.md).
 *
 * Configuration knobs
 * -------------------
 *  SNAPSHOT_THRESHOLD  – per-pixel colour difference threshold (0–1, default 0.1)
 *  SNAPSHOT_MAX_DIFF   – max fraction of pixels allowed to differ (0–1, default 0.005)
 *
 * Run locally:
 *   npm run test:visual           – compare against existing snapshots
 *   npm run test:visual:update    – regenerate baseline snapshots
 */

import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const THRESHOLD = parseFloat(process.env.SNAPSHOT_THRESHOLD ?? '0.1');
const MAX_DIFF_PIXELS_RATIO = parseFloat(process.env.SNAPSHOT_MAX_DIFF ?? '0.005');

/** Standard snapshot options applied to every assertion. */
const snapshotOptions = {
  threshold: THRESHOLD,
  maxDiffPixelRatio: MAX_DIFF_PIXELS_RATIO,
};

/**
 * Wait for all fonts, images and any CSS animations to settle so that
 * screenshots are deterministic.
 */
async function waitForPageReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
  // Give CSS transitions / animations a moment to complete.
  await page.waitForTimeout(400);
}

/**
 * Seed localStorage with a stable progress object so that XP counters,
 * streaks and completed-mission badges are the same on every run.
 */
async function seedProgress(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const progress = {
      completedMissions: ['hello-soroban', 'store-data'],
      xp: 250,
      level: 2,
      badges: ['first-steps'],
      streak: 3,
      lastLogin: '2026-01-01',
    };
    localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  });
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

test.describe('Visual Regression – Main Pages', () => {
  // Each test starts from a clean, seeded state so screenshots are stable.
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/');
    await seedProgress(page);
  });

  // ── Home / Landing page ─────────────────────────────────────────────────
  test('home page matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('home.png', snapshotOptions);
  });

  // ── Mission Map ──────────────────────────────────────────────────────────
  test('mission map page matches snapshot', async ({ page }) => {
    await page.goto('/#/missions');
    await waitForPageReady(page);

    // Ensure at least one mission card is rendered before snapping.
    await expect(page.locator('.mission-card, .mission-item').first()).toBeVisible();

    await expect(page).toHaveScreenshot('missions.png', snapshotOptions);
  });

  // ── Campaigns ────────────────────────────────────────────────────────────
  test('campaigns page matches snapshot', async ({ page }) => {
    await page.goto('/#/campaigns');
    await waitForPageReady(page);

    await expect(page.locator('h1')).toBeVisible();

    await expect(page).toHaveScreenshot('campaigns.png', snapshotOptions);
  });

  // ── Profile ──────────────────────────────────────────────────────────────
  test('profile page matches snapshot', async ({ page }) => {
    await page.goto('/#/profile');
    await waitForPageReady(page);

    await expect(page.locator('.profile-name')).toBeVisible();

    await expect(page).toHaveScreenshot('profile.png', snapshotOptions);
  });

  // ── Journal ──────────────────────────────────────────────────────────────
  test('journal page matches snapshot', async ({ page }) => {
    await page.goto('/#/journal');
    await waitForPageReady(page);

    await expect(page.locator('.journal-title')).toBeVisible();

    await expect(page).toHaveScreenshot('journal.png', snapshotOptions);
  });

  // ── Skill Tree ───────────────────────────────────────────────────────────
  test('skill tree page matches snapshot', async ({ page }) => {
    await page.goto('/#/skills');
    await waitForPageReady(page);

    await expect(page.locator('h1').first()).toBeVisible();

    await expect(page).toHaveScreenshot('skill-tree.png', snapshotOptions);
  });

  // ── Mission Detail ───────────────────────────────────────────────────────
  test('mission detail page (hello-soroban) matches snapshot', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await waitForPageReady(page);

    // Wait for the Run Tests button to confirm the page has fully initialised.
    await expect(
      page.locator('button:has-text("Run Tests")')
    ).toBeAttached({ timeout: 20000 });

    await expect(page).toHaveScreenshot('mission-detail.png', snapshotOptions);
  });

  // ── 404 Page ─────────────────────────────────────────────────────────────
  test('404 page matches snapshot', async ({ page }) => {
    await page.goto('/#/does-not-exist');
    await waitForPageReady(page);

    await expect(page.locator('h1')).toHaveText('404');

    await expect(page).toHaveScreenshot('not-found.png', snapshotOptions);
  });
});

// ---------------------------------------------------------------------------
// Responsive snapshots (mobile viewport)
// ---------------------------------------------------------------------------

test.describe('Visual Regression – Mobile Viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/');
    await page.evaluate(() => {
      const progress = {
        completedMissions: ['hello-soroban'],
        xp: 100,
        level: 1,
        badges: [],
        streak: 1,
        lastLogin: '2026-01-01',
      };
      localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
    });
  });

  test('home page – mobile matches snapshot', async ({ page }) => {
    await page.goto('/');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('home-mobile.png', snapshotOptions);
  });

  test('mission map – mobile matches snapshot', async ({ page }) => {
    await page.goto('/#/missions');
    await waitForPageReady(page);

    await expect(page).toHaveScreenshot('missions-mobile.png', snapshotOptions);
  });
});
