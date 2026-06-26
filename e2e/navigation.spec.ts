import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/');
  });

  test('homepage loads and navbar links work', async ({ page }) => {
    await expect(page.locator('h1.hero-title')).toContainText('Master');
    await page.click('nav >> text=Missions');
    await expect(page).toHaveURL(/#\/missions/);
    await expect(page.locator('h1.section-title')).toHaveText('Mission Map');

    await page.click('nav >> text=Profile');
    await expect(page).toHaveURL(/#\/profile/);
    await expect(page.locator('.profile-name')).toBeVisible();
  });

  test('campaigns page is reachable from navbar', async ({ page }) => {
    await page.click('nav >> text=Campaigns');
    await expect(page).toHaveURL(/#\/campaigns/);
    await expect(page.locator('h1.section-title, h1')).toContainText('Campaigns');
  });

  test('invalid route shows the 404 page', async ({ page }) => {
    await page.goto('/#/does-not-exist');
    await expect(page.locator('h1')).toHaveText('404');
    await expect(page.locator('text=Return to Base')).toBeVisible();
  });

  test('journal page loads and displays stats', async ({ page }) => {
    await page.click('nav >> text=Journal');
    await expect(page).toHaveURL(/#\/journal/);
    await expect(page.locator('.journal-title')).toHaveText('Adventure Journal');
    await expect(page.locator('.summary-stat')).toHaveCount(5);
  });

  test('skill tree page loads and displays skills', async ({ page }) => {
    await page.goto('/#/skills');
    await expect(page).toHaveURL(/#\/skills/);
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
