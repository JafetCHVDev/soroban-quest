import { test, expect, type Page } from '@playwright/test';

const PROGRESS_KEY = 'soroban_quest_progress';
const LANG_KEY = 'soroban_quest_lang';
const ONBOARDING_KEY = 'sorobanQuest_onboarding_done';

const TOTAL_BADGES = 15;

/**
 * Seed the persisted game progress (localStorage) before the app loads.
 * The Achievements page derives its locked/unlocked state from
 * `progress.badges`, so unlocking a badge simply means listing its id there.
 */
async function seedProgress(page: Page, badges: string[], extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ progressKey, onboardingKey, badges, extra }) => {
      const base = {
        xp: 0,
        gold: 0,
        level: 1,
        completedMissions: [],
        badges,
        firstTryMissions: [],
        currentMission: null,
        missionAttempts: {},
        streak: 0,
        lastLogin: null,
      };
      localStorage.setItem(progressKey, JSON.stringify({ ...base, ...extra }));
      localStorage.setItem(onboardingKey, '1');
    },
    { progressKey: PROGRESS_KEY, onboardingKey: ONBOARDING_KEY, badges, extra }
  );
}

/**
 * Force the app locale before first paint via the persisted language key.
 */
async function seedLanguage(page: Page, lang: 'en' | 'es') {
  await page.addInitScript(
    ({ langKey, lang, onboardingKey }) => {
      localStorage.setItem(langKey, lang);
      localStorage.setItem(onboardingKey, '1');
    },
    { langKey: LANG_KEY, lang, onboardingKey: ONBOARDING_KEY }
  );
}

test.describe('Achievements page (Playwright E2E)', () => {
  test('renders the full list of badges with locked visual states', async ({ page }) => {
    await seedProgress(page, []);
    await page.goto('/#/achievements');

    const cards = page.locator('.achievement-card');
    await expect(cards).toHaveCount(TOTAL_BADGES);

    // With no progress, every badge should be locked.
    await expect(page.locator('.achievement-card.locked')).toHaveCount(TOTAL_BADGES);
    await expect(page.locator('.achievement-card.unlocked')).toHaveCount(0);

    // Locked cards use the "?" placeholder icon.
    await expect(page.locator('.achievement-card.locked .achievement-icon').first()).toHaveText('?');
  });

  test('shows correct locked/unlocked visual states for seeded progress', async ({ page }) => {
    const unlocked = ['first_contract', 'triple_threat'];
    await seedProgress(page, unlocked);
    await page.goto('/#/achievements');

    await expect(page.locator('.achievement-card.unlocked')).toHaveCount(unlocked.length);
    await expect(page.locator('.achievement-card.locked')).toHaveCount(
      TOTAL_BADGES - unlocked.length
    );

    // Summary reflects "unlocked/total" and the overall completion percentage.
    await expect(page.locator('.achievements-summary strong')).toHaveText(
      `${unlocked.length}/${TOTAL_BADGES}`
    );
    // 2 / 15 ≈ 13%.
    await expect(page.locator('.achievements-progress')).toContainText('13%');

    // Unlocked badges show their real icon, not the placeholder.
    await expect(page.locator('.achievement-card.unlocked .achievement-icon').first()).not.toHaveText('?');
  });

  test('seeded completion condition shows achievement unlocked on next visit', async ({ page }) => {
    // First visit: seed a completed "First Contract" condition.
    await seedProgress(page, ['first_contract'], { completedMissions: ['mission-1'] });
    await page.goto('/#/achievements');

    const firstContract = page.locator('.achievement-card', { hasText: 'First Contract' });
    await expect(firstContract).toHaveClass(/unlocked/);
    await expect(firstContract.locator('.achievement-status')).toHaveText('Unlocked');

    // Reload (simulating a later visit) — unlocked state must persist.
    await page.reload();
    await expect(
      page.locator('.achievement-card', { hasText: 'First Contract' })
    ).toHaveClass(/unlocked/);
  });

  test('achievement descriptions render correctly in English', async ({ page }) => {
    await seedProgress(page, []);
    await page.goto('/#/achievements');

    const card = page.locator('.achievement-card', { hasText: 'First Contract' });
    await expect(card.locator('.achievement-content p')).toHaveText('Complete your first mission');
    // Header title localized as well.
    await expect(page.locator('.achievements-header h1')).toHaveText('Achievements');
  });

  test('achievement descriptions render correctly in Spanish', async ({ page }) => {
    await seedLanguage(page, 'es');
    await seedProgress(page, []);
    await page.goto('/#/achievements');

    const card = page.locator('.achievement-card', { hasText: 'Primer Contrato' });
    await expect(card.locator('.achievement-content p')).toHaveText('Completa tu primera misión');
    // Header title localized as well.
    await expect(page.locator('.achievements-header h1')).toHaveText('Logros');
  });
});
