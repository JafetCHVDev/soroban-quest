import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

/**
 * Injects fake progress into localStorage so that a campaign reports
 * 100% completion without having to play through every mission.
 *
 * Chapter 1 missions: 'hello-soroban', 'greetings-protocol'
 */
async function seedCompletedCampaign(page: Parameters<typeof clearLocalStorageBeforePageLoad>[0]) {
  await page.evaluate(() => {
    const progress = {
      completedMissions: ['hello-soroban', 'greetings-protocol'],
      xp: 600,
      badges: [],
      activityLog: [],
      lastActiveDate: null,
      currentStreak: 0,
    };
    localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  });
}

test.describe('Campaign Certificates', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/#/campaigns');
  });

  // ── Visibility rules ──────────────────────────────────────────────────────

  test('"Get Certificate" button is NOT visible for an in-progress campaign', async ({ page }) => {
    // Default state: no missions completed → chapter 1 is in progress
    await expect(
      page.locator('[data-testid="get-certificate-chapter-1-awakening"]'),
    ).not.toBeVisible();
  });

  test('"Get Certificate" button is NOT visible for a locked campaign', async ({ page }) => {
    // Chapter 3 requires level 5 — a fresh account is level 1
    await expect(
      page.locator('[data-testid="get-certificate-chapter-3-forge"]'),
    ).not.toBeVisible();
  });

  test('"Get Certificate" button IS visible for a fully-completed campaign', async ({ page }) => {
    await seedCompletedCampaign(page);
    await page.reload();

    await expect(
      page.locator('[data-testid="get-certificate-chapter-1-awakening"]'),
    ).toBeVisible();
  });

  // ── Download behaviour ────────────────────────────────────────────────────

  test('clicking "Get Certificate" triggers a PNG download for the completed campaign', async ({
    page,
  }) => {
    await seedCompletedCampaign(page);
    await page.reload();

    const downloadPromise = page.waitForEvent('download');

    await page
      .locator('[data-testid="get-certificate-chapter-1-awakening"]')
      .click();

    const download = await downloadPromise;

    // The filename should contain the campaign slug and end with .png
    expect(download.suggestedFilename()).toMatch(/soroban-quest-certificate.*\.png$/);
  });

  // ── Isolation: button for one chapter doesn't appear on another ───────────

  test('"Get Certificate" only appears on completed chapters, not others', async ({ page }) => {
    await seedCompletedCampaign(page);
    await page.reload();

    // Chapter 1 is complete → button visible
    await expect(
      page.locator('[data-testid="get-certificate-chapter-1-awakening"]'),
    ).toBeVisible();

    // Chapter 2 is not complete (its missions not in the seed) → button absent
    await expect(
      page.locator('[data-testid="get-certificate-chapter-2-memory"]'),
    ).not.toBeVisible();
  });
});

test.describe('Campaigns Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('is reachable from navbar and renders campaign cards', async ({ page }) => {
    await page.click('nav >> text=Campaigns');

    await expect(page).toHaveURL(/#\/campaigns/);
    await expect(page.locator('h1.section-title')).toHaveText('Campaigns');
    await expect(page.locator('.campaign-card')).toHaveCount(7);
  });

  test('opens lore modal on first visit and campaign details are visible', async ({ page }) => {
    await page.goto('/#/campaigns');
    await page.waitForLoadState('networkidle');

    const firstUnlockedCampaign = page.locator('.campaign-card:not(.locked)').first();
    await firstUnlockedCampaign.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('#lore-modal-title')).toHaveText('Chapter Introduction');
    await expect(page.locator('.modal-content .btn.btn-primary')).toContainText('Begin Chapter 1');
    await expect(page.locator('.campaign-detail-overlay')).toBeVisible();
    await expect(page.locator('.missions-list .mission-item')).toHaveCount(2);
  });

  test('lore modal is shown only once per campaign', async ({ page }) => {
    await page.goto('/#/campaigns');
    await page.waitForLoadState('networkidle');

    const firstUnlockedCampaign = page.locator('.campaign-card:not(.locked)').first();
    await firstUnlockedCampaign.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.goto('/#/missions');
    await expect(page.locator('h1.section-title')).toHaveText('Mission Map');
    await page.goto('/#/campaigns');
    await expect(page.locator('h1.section-title')).toHaveText('Campaigns');
    await expect(page.locator('.campaign-detail-overlay')).toHaveCount(0);

    const firstUnlockedCampaignAgain = page.locator('.campaign-card:not(.locked)').first();
    await firstUnlockedCampaignAgain.click();

    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.locator('.campaign-detail-overlay')).toBeVisible();
  });
});

