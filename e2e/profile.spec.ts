import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('Profile and Data Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
    await page.goto('/#/profile');
  });

  test('editing name and avatar persists after reload', async ({ page }) => {
    await page.click('button:has-text("Edit Profile")');
    await page.fill('input[placeholder="Enter name"]', 'Star Voyager');
    await page.click('button:has-text("🐉")');
    await page.click('button:has-text("Save")');

    await expect(page.locator('.profile-name')).toHaveText('Star Voyager');
    await expect(page.locator('.profile-avatar')).toHaveText('🐉');

    await page.reload();
    await expect(page.locator('.profile-name')).toHaveText('Star Voyager');
    await expect(page.locator('.profile-avatar')).toHaveText('🐉');
  });

  test('export button is available on profile page', async ({ page }) => {
    await expect(page.locator('button:has-text("Export")')).toBeVisible();
  });

  test('reset button is available on profile page', async ({ page }) => {
    await expect(page.locator('button:has-text("Reset")')).toBeVisible();
  });

  test('import button is available on profile page', async ({ page }) => {
    await expect(page.locator('button:has-text("Import")')).toBeVisible();
  });
});
