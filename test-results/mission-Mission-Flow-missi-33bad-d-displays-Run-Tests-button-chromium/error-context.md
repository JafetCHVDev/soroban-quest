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
      - link "Home":
        - /url: "#/"
    - listitem:
      - link "Campaigns":
        - /url: "#/campaigns"
    - listitem:
      - link "Missions":
        - /url: "#/missions"
    - listitem:
      - link "Profile":
        - /url: "#/profile"
    - listitem:
      - link "Journal":
        - /url: "#/journal"
  - button "Select language": EN
  - button "Toggle theme"
  - text: navbar.userProfile Stellar Guardian
  - link "Home":
    - /url: "#/"
  - link "Campaigns":
    - /url: "#/campaigns"
  - link "Missions":
    - /url: "#/missions"
  - link "Profile":
    - /url: "#/profile"
  - link "Journal":
    - /url: "#/journal"
  - button "Select language": EN
  - button "Toggle theme"
  - text: Stellar Guardian
- main
- contentinfo:
  - heading "Platform" [level=4]
  - list:
    - listitem:
      - link "Home":
        - /url: "#/"
    - listitem:
      - link "Missions":
        - /url: "#/missions"
    - listitem:
      - link "Profile":
        - /url: "#/profile"
  - heading "Resources" [level=4]
  - list:
    - listitem:
      - link "Soroban Docs":
        - /url: https://soroban.stellar.org
    - listitem:
      - link "Stellar SDK":
        - /url: https://stellar.org/developers
    - listitem:
      - link "GitHub":
        - /url: https://github.com/JafetCHVDev/soroban-quest
  - heading "Community" [level=4]
  - list:
    - listitem:
      - link "Discord":
        - /url: https://discord.gg/stellarcomm
  - paragraph: Built for the Stellar ecosystem
  - paragraph: MIT License
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
  20 |   test('mission page displays all sections', async ({ page }) => {
  21 |     await page.goto('/#/mission/hello-soroban');
  22 |     await expect(page).toHaveURL(/#\/mission\/hello-soroban/);
  23 |     
  24 |     const runTestsBtn = page.locator('button:has-text("Run Tests")');
  25 |     await expect(runTestsBtn).toBeAttached({ timeout: 20000 });
  26 |   });
  27 | 
  28 |   test('completed mission progress persists in localStorage', async ({ page }) => {
  29 |     await page.goto('/');
  30 |     await page.evaluate(() => {
  31 |       const progress = {
  32 |         completedMissions: ['hello-soroban'],
  33 |         xp: 100,
  34 |         level: 1,
  35 |         badges: [],
  36 |         streak: 0,
  37 |         lastLogin: null
  38 |       };
  39 |       localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  40 |     });
  41 | 
  42 |     await page.goto('/#/journal');
  43 |     await expect(page.locator('.summary-stat').nth(3)).toContainText('100');
  44 |   });
  45 | 
  46 |   test('mission completion state is reflected in mission map', async ({ page }) => {
  47 |     await page.goto('/');
  48 |     await page.evaluate(() => {
  49 |       const progress = {
  50 |         completedMissions: ['hello-soroban'],
  51 |         xp: 100,
  52 |         level: 1,
  53 |         badges: [],
  54 |         streak: 0,
  55 |         lastLogin: null
  56 |       };
  57 |       localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
  58 |     });
  59 | 
  60 |     await page.goto('/#/missions');
  61 |     await expect(page.locator('.mission-card, .mission-item').first()).toBeVisible();
  62 |   });
  63 | });
```