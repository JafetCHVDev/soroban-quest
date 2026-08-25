import { test, expect } from '@playwright/test';

const ONBOARDING_DONE_KEY = 'sorobanQuest_onboarding_done';
const OVERLAY_TESTID = 'onboarding-overlay';
const NEXT_BUTTON = 'Next';
const SKIP_BUTTON = 'Skip';

async function resetOnboarding(page: Import('@playwright/test').Page, done: boolean) {
  await page.addInitScript(
    ({ key, value }) => {
      if (value) {
        localStorage.setItem(key, value);
      } else {
        localStorage.removeItem(key);
      }
    },
    { key: ONBOARDING_DONE_KEY, value: done ? '1' : null }
  );
  await page.goto('/');
}

test.describe('Onboarding tutorial', () => {
  test('appears on first visit without dismissal flag', async ({ page }) => {
    await resetOnboarding(page, false);
    await expect(page.getByTestId(OVERLAY_TESTID)).toBeVisible();
  });

  test('advances through all 5 steps and completes', async ({ page }) => {
    await resetOnboarding(page, false);

    const overlay = page.getByTestId(OVERLAY_TESTID);
    await expect(overlay).toBeVisible();

    for (let step = 1; step <= 5; step++) {
      await expect(overlay).toContainText(`Step ${step} of 5`);
      await page.getByRole('button', { name: NEXT_BUTTON }).click();
    }

    await expect(overlay).not.toBeVisible();
    await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), ONBOARDING_DONE_KEY)).toBe('1');
  });

  test('skip dismisses overlay and persists flag', async ({ page }) => {
    await resetOnboarding(page, false);

    const overlay = page.getByTestId(OVERLAY_TESTID);
    await expect(overlay).toBeVisible();

    await page.getByRole('button', { name: SKIP_BUTTON }).click();

    await expect(overlay).not.toBeVisible();
    await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), ONBOARDING_DONE_KEY)).toBe('1');
  });

  test('does not appear when flag is set', async ({ page }) => {
    await resetOnboarding(page, true);
    await expect(page.getByTestId(OVERLAY_TESTID)).not.toBeVisible();
  });

  test('Escape key dismisses overlay and sets flag', async ({ page }) => {
    await resetOnboarding(page, false);

    const overlay = page.getByTestId(OVERLAY_TESTID);
    await expect(overlay).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(overlay).not.toBeVisible();
    await expect.poll(() => page.evaluate((k) => localStorage.getItem(k), ONBOARDING_DONE_KEY)).toBe('1');
  });
});