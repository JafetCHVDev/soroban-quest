# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation >> invalid route shows the 404 page
- Location: e2e\navigation.spec.ts:31:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Return to Base')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Return to Base')

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
  - heading "404" [level=1]
  - heading "notFound.title" [level=2]
  - paragraph: notFound.body
  - link "notFound.back":
    - /url: "#/"
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
  4  | test.describe('Navigation', () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await clearLocalStorageBeforePageLoad(page);
  7  |     await page.goto('/');
  8  |     // Force Playwright to wait for components and local files to fully load and settle
  9  |     await page.waitForLoadState('networkidle');
  10 |   });
  11 | 
  12 |   test('homepage loads and navbar links work', async ({ page }) => {
  13 |     await expect(page.locator('h1.hero-title')).toContainText('Master');
  14 |     
  15 |     // Using explicit href routes or nested selectors ensures clicks work even if translations take a millisecond
  16 |     await page.click('nav a[href="#/missions"], nav >> text=Missions');
  17 |     await expect(page).toHaveURL(/#\/missions/);
  18 |     await expect(page.locator('h1.section-title')).toHaveText('Mission Map');
  19 | 
  20 |     await page.click('nav a[href="#/profile"], nav >> text=Profile');
  21 |     await expect(page).toHaveURL(/#\/profile/);
  22 |     await expect(page.locator('.profile-name')).toBeVisible();
  23 |   });
  24 | 
  25 |   test('campaigns page is reachable from navbar', async ({ page }) => {
  26 |     await page.click('nav a[href="#/campaigns"], nav >> text=Campaigns');
  27 |     await expect(page).toHaveURL(/#\/campaigns/);
  28 |     await expect(page.locator('h1.section-title, h1')).toContainText('Campaigns');
  29 |   });
  30 | 
  31 |   test('invalid route shows the 404 page', async ({ page }) => {
  32 |     await page.goto('/#/does-not-exist');
  33 |     await page.waitForLoadState('networkidle');
  34 |     await expect(page.locator('h1')).toHaveText('404');
> 35 |     await expect(page.locator('text=Return to Base')).toBeVisible();
     |                                                       ^ Error: expect(locator).toBeVisible() failed
  36 |   });
  37 | 
  38 |   test('journal page loads and displays stats', async ({ page }) => {
  39 |     await page.click('nav a[href="#/journal"], nav >> text=Journal');
  40 |     await expect(page).toHaveURL(/#\/journal/);
  41 |     await expect(page.locator('.journal-title')).toHaveText('Adventure Journal');
  42 |     await expect(page.locator('.summary-stat')).toHaveCount(5);
  43 |   });
  44 | 
  45 |   test('skill tree page loads and displays skills', async ({ page }) => {
  46 |     await page.goto('/#/skill-tree');
  47 |     await page.waitForLoadState('networkidle');
  48 |     await expect(page).toHaveURL(/#\/skill-tree/);
  49 |     await expect(page.locator('h1').first()).toBeVisible();
  50 |   });
  51 | });
```