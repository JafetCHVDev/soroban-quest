import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('Campaigns Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/');
  });

  test('is reachable from navbar and renders campaign cards', async ({ page }) => {
    await page.click('nav >> text=Campaigns');

    await expect(page).toHaveURL(/#\/campaigns/);
    await expect(page.locator('h1.section-title')).toHaveText('Campaigns');
    await expect(page.locator('.campaign-card')).toHaveCount(3);
  });

  test('opens lore modal on first visit and campaign details are visible', async ({ page }) => {
    await page.goto('/#/campaigns');

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

    const firstUnlockedCampaign = page.locator('.campaign-card:not(.locked)').first();
    await firstUnlockedCampaign.click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.goto('/#/missions');
    await page.goto('/#/campaigns');

    const firstUnlockedCampaignAgain = page.locator('.campaign-card:not(.locked)').first();
    await firstUnlockedCampaignAgain.click();

    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    await expect(page.locator('.campaign-detail-overlay')).toBeVisible();
  });
});
