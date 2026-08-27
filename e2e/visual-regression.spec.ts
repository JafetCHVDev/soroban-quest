/**
 * Visual Regression Tests
 *
 * These tests capture full-page screenshots of each main route and compare
 * them against stored baseline snapshots. A failing test means a visible
 * change was detected – intentional changes should be committed with updated
 * snapshots (see docs/visual-regression.md).
 *
 * Configuration knobs
 * -------------------
 *  SNAPSHOT_THRESHOLD  – per-pixel colour difference threshold (0–1, default 0.1)
 *  SNAPSHOT_MAX_DIFF   – max fraction of pixels allowed to differ (0–1, default 0.03)
 *
 * Run locally:
 *   npm run test:visual           – compare against existing snapshots
 *   npm run test:visual:update    – regenerate baseline snapshots
 */

import { test, expect } from '@playwright/test';
import {
  clearLocalStorageBeforePageLoad,
  freezeVisualRegressionClock,
  maskDynamicElements,
  seedVisualRegressionState,
  setAppTheme,
  waitForMonaco,
  waitForTestResults,
} from './utils';

const THRESHOLD = parseFloat(process.env.SNAPSHOT_THRESHOLD ?? '0.1');
const MAX_DIFF_PIXELS_RATIO = parseFloat(process.env.SNAPSHOT_MAX_DIFF ?? '0.03');

const snapshotOptions = {
  threshold: THRESHOLD,
  maxDiffPixelRatio: MAX_DIFF_PIXELS_RATIO,
};

const viewports = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

const themes = [
  { name: 'dark', value: 'dark' as const },
  { name: 'light', value: 'light' as const },
];

type Scenario = {
  name: string;
  route: string;
  fixture: string;
  prepare?: (page: import('@playwright/test').Page) => Promise<void>;
};

const scenarios: Scenario[] = [
  { name: 'home', route: '/', fixture: 'home' },
  { name: 'campaigns', route: '/campaigns', fixture: 'campaigns' },
  {
    name: 'campaigns-lore',
    route: '/campaigns',
    fixture: 'campaigns',
    prepare: async (page) => {
      await expect(page.locator('.campaign-card').first()).toBeVisible();
      await page.locator('.campaign-card').first().click();
      await page.locator('.campaign-detail-overlay').waitFor();
    },
  },
  { name: 'mission-map', route: '/missions', fixture: 'mission-map' },
  {
    name: 'mission-map-filtered',
    route: '/missions',
    fixture: 'mission-map',
    prepare: async (page) => {
      await page.locator('.search-input').fill('storage');
      await page.locator('.difficulty-filters button').nth(2).click();
      await page.locator('.chapter-filters button').nth(1).click();
      await page.waitForTimeout(250);
    },
  },
  { name: 'mission-detail', route: '/mission/hello-soroban', fixture: 'mission-detail' },
  {
    name: 'mission-detail-running',
    route: '/mission/hello-soroban',
    fixture: 'mission-detail',
    prepare: async (page) => {
      await waitForMonaco(page);
      await page.getByRole('button', { name: /run tests/i }).first().click({ force: true });
      await waitForTestResults(page);
    },
  },
  {
    name: 'mission-detail-passed',
    route: '/mission/hello-soroban',
    fixture: 'mission-detail',
    prepare: async (page) => {
      await waitForMonaco(page);
      await page.getByRole('button', { name: /solution/i }).first().click({ force: true });
      await page.getByRole('button', { name: /run tests/i }).first().click({ force: true });
      await waitForTestResults(page);
      await expect(page.locator('.modal-content, .terminal-line.pass').first()).toBeVisible({
        timeout: 30000,
      });
    },
  },
  { name: 'profile', route: '/profile', fixture: 'profile' },
  { name: 'journal', route: '/journal', fixture: 'journal' },
  {
    name: 'journal-filters',
    route: '/journal',
    fixture: 'journal',
    prepare: async (page) => {
      await page.locator('input[type="search"]').fill('mission');
      await page.locator('.filter-chip').filter({ hasText: 'Mission' }).click();
      await page.locator('.filter-chip').filter({ hasText: 'Today' }).click();
      await page.waitForTimeout(250);
    },
  },
  { name: 'skill-tree', route: '/skills', fixture: 'skill-tree' },
  { name: 'leaderboard', route: '/leaderboard', fixture: 'leaderboard' },
  { name: 'achievements', route: '/achievements', fixture: 'achievements' },
  { name: 'shop', route: '/shop', fixture: 'shop' },
  {
    name: 'shop-purchased',
    route: '/shop',
    fixture: 'shop',
    prepare: async (page) => {
      await page.locator('.shop-item-btn').filter({ hasText: /buy/i }).first().click();
      await page.waitForTimeout(250);
    },
  },
  { name: 'not-found', route: '/does-not-exist', fixture: 'home' },
];

async function waitForPageReady(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
}

async function prepareScenarioPage(page: import('@playwright/test').Page, viewport: (typeof viewports)[number], theme: (typeof themes)[number], scenario: Scenario) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await freezeVisualRegressionClock(page);
  await clearLocalStorageBeforePageLoad(page);
  await setAppTheme(page, theme.value);
  await seedVisualRegressionState(page, scenario.fixture);
  await page.goto(scenario.route);
  await waitForPageReady(page);

  if (scenario.prepare) {
    await scenario.prepare(page);
  }

  await maskDynamicElements(page);
}

for (const viewport of viewports) {
  for (const theme of themes) {
    for (const scenario of scenarios) {
      test(`${scenario.name} – ${viewport.name} – ${theme.name}`, async ({ page }) => {
        await prepareScenarioPage(page, viewport, theme, scenario);
        await expect(page).toHaveScreenshot(`${scenario.name}-${viewport.name}-${theme.name}.png`, snapshotOptions);
      });
    }
  }
}
