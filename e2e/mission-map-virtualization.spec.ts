import { expect, test, type Page } from '@playwright/test';
import { clearLocalStorageBeforePageLoad } from './utils';

async function openMissionMapWithAllMissionsUnlocked(page: Page) {
  await clearLocalStorageBeforePageLoad(page);
  const missionIds = await page.evaluate(async () => {
    const { missions } = await import('/src/data/missions.js');
    const missionIds = missions.map(({ id }) => id);
    localStorage.setItem(
      'soroban_quest_progress',
      JSON.stringify({ completedMissions: missionIds }),
    );
    return missionIds;
  });

  await page.goto('/#/missions');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('h1.section-title')).toHaveText('Mission Map');
  await expect(page.locator('.mission-card').first()).toBeVisible();
  return missionIds;
}

test.describe('Mission map virtualization', () => {
  test('Tab reaches mission cards outside the mounted window', async ({ page }) => {
    const missionIds = await openMissionMapWithAllMissionsUnlocked(page);
    const cards = page.locator('.mission-card[data-mission-id]');
    const mountedCount = await cards.count();
    expect(mountedCount).toBeLessThan(missionIds.length);
    await cards.first().focus();

    for (let index = 1; index < missionIds.length; index += 1) {
      await page.keyboard.press('Tab');
      await expect
        .poll(() =>
          page.evaluate(() => document.activeElement?.getAttribute('data-mission-id') ?? null),
        )
        .toBe(missionIds[index]);
    }
  });

  test('keeps natural page scrolling on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const missionIds = await openMissionMapWithAllMissionsUnlocked(page);

    const viewport = page.locator('.mission-map-grid-viewport');
    const overflowY = await viewport.evaluate((element) => getComputedStyle(element).overflowY);

    expect(overflowY).toBe('visible');
    expect(await page.locator('.mission-card').count()).toBe(missionIds.length);
  });
});