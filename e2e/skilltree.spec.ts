import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('SkillTree Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
  });

  test('is reachable by route and renders skill categories', async ({ page }) => {
    await page.goto('/#/skills');

    await expect(page).toHaveURL(/#\/skills/);
    await expect(page.locator('.skill-tree-title')).toHaveText('Soroban Skill Tree');
    await expect(page.locator('.skill-category')).toHaveCount(7);
    await expect(page.locator('.concept-node')).toHaveCount(58);
  });

  test('renders locked visualization for initial progress', async ({ page }) => {
    await page.goto('/#/skills');

    const lockedNodes = page.locator('.concept-node.locked');
    await expect(lockedNodes.first()).toBeVisible();
    await expect(lockedNodes).toHaveCount(58);
    await expect(page.locator('.concept-node.unlocked')).toHaveCount(0);
  });

  test('opens concept modal with mission details', async ({ page }) => {
    await page.goto('/#/skills');

    await page
      .locator('.concept-node .concept-name')
      .filter({ hasText: /^contract$/ })
      .click();

    await expect(page.locator('.concept-detail-modal')).toBeVisible();
    await expect(page.locator('.modal-title')).toHaveText('contract');
    await expect(page.locator('.mission-info')).toBeVisible();
    await expect(page.locator('.start-mission-btn')).toBeVisible();
    await expect(page.locator('.start-mission-btn')).toHaveAttribute('href', '/mission/hello-soroban');
  });
});
