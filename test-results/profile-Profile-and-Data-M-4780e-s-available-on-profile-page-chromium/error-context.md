# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile and Data Management >> reset button is available on profile page
- Location: e2e\profile.spec.ts:30:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button:has-text("Reset Progress")')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('button:has-text("Reset Progress")')

```

```yaml
- link "common.skipToContent":
  - /url: "#main-content"
- navigation "navbar.ariaMain":
  - link "navbar.ariaHome":
    - /url: "#/"
    - text: SOROBAN QUEST
  - list:
    - listitem:
      - link "navbar.home":
        - /url: "#/"
    - listitem:
      - link "navbar.campaigns":
        - /url: "#/campaigns"
    - listitem:
      - link "navbar.missions":
        - /url: "#/missions"
    - listitem:
      - link "navbar.profile":
        - /url: "#/profile"
    - listitem:
      - link "navbar.journal":
        - /url: "#/journal"
  - button "common.selectLanguage": EN
  - button "common.toggleTheme"
  - text: navbar.userProfile Stellar Guardian
  - link "navbar.home":
    - /url: "#/"
  - link "navbar.campaigns":
    - /url: "#/campaigns"
  - link "navbar.missions":
    - /url: "#/missions"
  - link "navbar.profile":
    - /url: "#/profile"
  - link "navbar.journal":
    - /url: "#/journal"
  - button "common.selectLanguage": EN
  - button "common.toggleTheme"
  - text: Stellar Guardian
- main:
  - 'img "Active avatar character: 🛡️"': 🛡️
  - 'heading "Adventurer Name: Stellar Guardian" [level=1]'
  - text: "Rank Title: ranks.0 profile.xpBar.current profile.xpBar.total"
  - button "profile.edit"
  - link "profile.viewJournal":
    - /url: "#/journal"
  - region "Adventurer stats dashboard": 0 profile.stats.missions 0 profile.stats.badges
  - heading "profile.sections.badges" [level=2]
  - region "Badges progression collection"
  - heading "profile.sections.completedMissions" [level=2]
  - region "profile.aria.completedListing":
    - status: profile.noMissions
  - heading "profile.sections.data" [level=2]
  - group "Game progress backup controls":
    - button "profile.data.export"
    - button "profile.data.import"
    - button "profile.data.reset"
- contentinfo:
  - heading "footer.platform.heading" [level=4]
  - list:
    - listitem:
      - link "footer.platform.home":
        - /url: "#/"
    - listitem:
      - link "footer.platform.missions":
        - /url: "#/missions"
    - listitem:
      - link "footer.platform.profile":
        - /url: "#/profile"
  - heading "footer.resources.heading" [level=4]
  - list:
    - listitem:
      - link "footer.resources.docs":
        - /url: https://soroban.stellar.org
    - listitem:
      - link "footer.resources.sdk":
        - /url: https://stellar.org/developers
    - listitem:
      - link "footer.resources.github":
        - /url: https://github.com/JafetCHVDev/soroban-quest
  - heading "footer.community.heading" [level=4]
  - list:
    - listitem:
      - link "footer.community.discord":
        - /url: "#"
    - listitem:
      - link "footer.community.telegram":
        - /url: "#"
  - paragraph: footer.credits.tagline
  - paragraph: footer.credits.license
- status
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { clearLocalStorageBeforePageLoad } from './utils';
  3  | 
  4  | test.describe('Profile and Data Management', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await clearLocalStorageBeforePageLoad(page);
  7  |     await page.goto('/#/profile');
  8  |   });
  9  | 
  10 |   test('editing name and avatar persists after reload', async ({ page }) => {
  11 |     await page.click('button:has-text("Edit Character Profile")');
  12 |     await page.fill('input[placeholder="Enter name"]', 'Star Voyager');
  13 |     await page.click('button:has-text("🐉")');
  14 |     await page.click('button:has-text("Save")');
  15 | 
  16 |     // ✅ FIXED: Using toContainText to ignore the screen-reader-only accessible prefix
  17 |     await expect(page.locator('.profile-name')).toContainText('Star Voyager');
  18 |     await expect(page.locator('.profile-avatar')).toHaveText('🐉');
  19 | 
  20 |     await page.reload();
  21 |     // ✅ FIXED: Using toContainText here as well
  22 |     await expect(page.locator('.profile-name')).toContainText('Star Voyager');
  23 |     await expect(page.locator('.profile-avatar')).toHaveText('🐉');
  24 |   });
  25 | 
  26 |   test('export button is available on profile page', async ({ page }) => {
  27 |     await expect(page.locator('button:has-text("Export Progress File")')).toBeVisible();
  28 |   });
  29 | 
  30 |   test('reset button is available on profile page', async ({ page }) => {
> 31 |     await expect(page.locator('button:has-text("Reset Progress")')).toBeVisible();
     |                                                                     ^ Error: expect(locator).toBeVisible() failed
  32 |   });
  33 | 
  34 |   test('import button is available on profile page', async ({ page }) => {
  35 |     await expect(page.locator('button:has-text("Import Progress File")')).toBeVisible();
  36 |   });
  37 | });
```