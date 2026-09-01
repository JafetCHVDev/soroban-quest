import { test, expect, type Page } from '@playwright/test';

type ProfileSeed = {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
  completedMissions: string[];
  badges: string[];
};

function makeSlot(
  id: string,
  name: string,
  avatar: string,
  xp: number,
  level: number,
  completedMissions: string[] = [],
  badges: string[] = [],
): ProfileSeed {
  return { id, name, avatar, xp, level, completedMissions, badges };
}

async function seedProfiles(page: Page, profiles: ProfileSeed[], activeId?: string) {
  await page.addInitScript(
    (args: { profiles: ProfileSeed[]; activeId: string | undefined }) => {
      const { profiles, activeId } = args;
      localStorage.clear();
      localStorage.setItem('sorobanQuest_onboarding_done', '1');
      localStorage.setItem(
        'soroban_quest_profiles',
        JSON.stringify(
          profiles.map((p) => ({
            id: p.id,
            profile: { name: p.name, avatar: p.avatar },
            progress: {
              xp: p.xp,
              level: p.level,
              completedMissions: p.completedMissions,
              badges: p.badges,
            },
          })),
        ),
      );
      localStorage.setItem('soroban_quest_active_profile', activeId ?? profiles[0].id);
    },
    { profiles, activeId },
  );
}

test.describe('Leaderboard Page', () => {
  test('renders the ranking table when navigating to /leaderboard', async ({ page }) => {
    await seedProfiles(page, [
      makeSlot('player-1', 'Alice', '🛡️', 120, 2, ['hello-soroban'], ['first-steps']),
    ]);

    await page.goto('/#/leaderboard');

    await expect(page).toHaveURL(/#\/leaderboard/);
    await expect(page.locator('.leaderboard-table')).toBeVisible();
    await expect(page.locator('.leaderboard-table tbody tr')).toHaveCount(1);
  });

  test('shows the current player profile with correct XP and level', async ({ page }) => {
    await seedProfiles(
      page,
      [
        makeSlot('player-1', 'Alice', '🛡️', 120, 2),
        makeSlot('player-2', 'Charlie', '🐉', 300, 4, ['hello-soroban', 'store-data'], ['first-steps']),
        makeSlot('player-3', 'Bob', '⭐', 90, 1),
      ],
      'player-2',
    );

    await page.goto('/#/leaderboard');

    const activeRow = page.locator('.leaderboard-table tbody tr.active');
    await expect(activeRow).toHaveCount(1);
    await expect(activeRow).toContainText('Charlie');
    await expect(activeRow.locator('td').nth(2)).toHaveText('300');
    await expect(activeRow.locator('td').nth(3)).toHaveText('4');
    await expect(activeRow.locator('.leaderboard-status.active')).toHaveText('Active');
  });

  test('sorts entries by XP in descending order', async ({ page }) => {
    await seedProfiles(page, [
      makeSlot('player-1', 'Low', '🛡️', 100, 2),
      makeSlot('player-2', 'High', '🐉', 500, 6),
      makeSlot('player-3', 'Mid', '⭐', 300, 4),
    ]);

    await page.goto('/#/leaderboard');

    const xpValues = await page
      .locator('.leaderboard-table tbody tr td:nth-child(3)')
      .allTextContents();
    expect(xpValues.map(Number)).toEqual([500, 300, 100]);

    await expect(page.locator('.leaderboard-champion-rank')).toHaveText('#1');
    await expect(page.locator('.leaderboard-champion h2')).toHaveText('High');
  });

  test('renders without crashing with a single local profile', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.clear();
      localStorage.setItem('sorobanQuest_onboarding_done', '1');
    });

    await page.goto('/#/leaderboard');

    await expect(page.locator('.leaderboard-page')).toBeVisible();
    await expect(page.locator('.leaderboard-table tbody tr')).toHaveCount(1);
    await expect(page.locator('.leaderboard-champion h2')).toHaveText('Stellar Guardian');
  });
});
