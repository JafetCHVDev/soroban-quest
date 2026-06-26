# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mission.spec.ts >> Mission Flow >> mission page loads and displays Run Tests button
- Location: e2e\mission.spec.ts:9:3

# Error details

```
Error: expect(locator).toBeAttached() failed

Locator: locator('button:has-text("Run Tests")')
Expected: attached
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeAttached" with timeout 15000ms
  - waiting for locator('button:has-text("Run Tests")')

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
- main
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
  4  | test.describe('Mission Flow', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await clearLocalStorageBeforePageLoad(page);
  7  |   });
  8  | 
  9  |   test('mission page loads and displays Run Tests button', async ({ page }) => {
  10 |     await page.goto('/#/mission/hello-soroban');
  11 |     await page.waitForLoadState('networkidle');
  12 |     
  13 |     await expect(page).toHaveURL(/#\/mission\/hello-soroban/);
  14 |     
  15 |     // ✅ FIXED: Check that it exists in the DOM and contains the correct text
  16 |     const runTestsBtn = page.locator('button:has-text("Run Tests")');
> 17 |     await expect(runTestsBtn).toBeAttached({ timeout: 15000 });
     |                               ^ Error: expect(locator).toBeAttached() failed
  18 |   });
  19 | 
  20 |   test('mission page displays mission content', async ({ page }) => {
  21 |     await page.goto('/#/mission/hello-soroban');
  22 |     await page.waitForLoadState('networkidle');
  23 |     
  24 |     await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  25 |     
  26 |     // ✅ FIXED: Assert structural DOM delivery instead of strict viewport paint dimensions
  27 |     const runTestsBtn = page.locator('button:has-text("Run Tests")');
  28 |     await expect(runTestsBtn).toBeAttached({ timeout: 15000 });
  29 |   });
  30 | 
  31 |   test('completed mission progress persists in localStorage', async ({ page }) => {
  32 |     await page.goto('/');
  33 |     await page.evaluate(() => {
  34 |       const progress = {
  35 |         completedMissions: ['hello-soroban'],
  36 |         xp: 100,
  37 |         level: 1,
  38 |         badges: [],
  39 |         streak: 0,
  40 |         lastLogin: null
  41 |       };
  42 |       localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  43 |     });
  44 | 
  45 |     await page.goto('/#/journal');
  46 |     await expect(page.locator('.summary-stat').nth(3)).toContainText('100');
  47 |   });
  48 | 
  49 |   test('mission completion state is reflected in mission map', async ({ page }) => {
  50 |     await page.goto('/');
  51 |     await page.evaluate(() => {
  52 |       const progress = {
  53 |         completedMissions: ['hello-soroban'],
  54 |         xp: 100,
  55 |         level: 1,
  56 |         badges: [],
  57 |         streak: 0,
  58 |         lastLogin: null
  59 |       };
  60 |       localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  61 |     });
  62 | 
  63 |     await page.goto('/#/missions');
  64 |     await expect(page.locator('.mission-card, .mission-item').first()).toBeVisible();
  65 |   });
  66 | });
```