import { test, expect } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

test.describe('SkillTree Page', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
  });

  test('is reachable by route and renders skill categories', async ({ page }) => {
    await page.goto('/#/skills');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/#\/skills/);
    await expect(page.locator('.skill-tree-title')).toHaveText('Soroban Skill Tree');
    await expect(page.locator('.skill-category')).toHaveCount(7);
    await expect(page.locator('.concept-node')).toHaveCount(58);
  });

  test('renders locked visualization for initial progress', async ({ page }) => {
    await page.goto('/#/skills');
    await page.waitForLoadState('networkidle');

    const lockedNodes = page.locator('.concept-node.locked');
    await expect(lockedNodes.first()).toBeVisible();
    await expect(lockedNodes).toHaveCount(58);
    await expect(page.locator('.concept-node.unlocked')).toHaveCount(0);
  });

  test('opens concept modal with mission details', async ({ page }) => {
    await page.goto('/#/skills');
    await page.waitForLoadState('networkidle');

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

  test('supports ordered keyboard navigation and restores focus after the modal closes', async ({ page }) => {
    await page.goto('/#/skills');
    await page.waitForLoadState('networkidle');

    const nodes = page.locator('.concept-node');
    await expect(nodes).toHaveCount(58);
    await nodes.first().focus();
    for (let index = 0; index < 58; index += 1) {
      await expect(nodes.nth(index)).toBeFocused();
      if (index < 57) await page.keyboard.press('Tab');
    }

    const firstNode = nodes.first();
    await firstNode.focus();
    await expect(firstNode).toHaveAttribute('aria-label', /contract.*locked.*not yet completed/i);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.modal-close')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(firstNode).toBeFocused();

    await page.keyboard.press('Space');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(firstNode).toBeFocused();
  });
});
