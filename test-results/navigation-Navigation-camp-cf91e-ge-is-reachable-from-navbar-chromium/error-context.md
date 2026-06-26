# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Navigation >> campaigns page is reachable from navbar
- Location: e2e\navigation.spec.ts:25:3

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h1.section-title, h1')
Expected substring: "Campaigns"
Received string:    "campaigns.title"
Timeout: 10000ms

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('h1.section-title, h1')
    23 × locator resolved to <h1 class="section-title">campaigns.title</h1>
       - unexpected value "campaigns.title"

```

```yaml
- heading "campaigns.title" [level=1]
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
> 28 |     await expect(page.locator('h1.section-title, h1')).toContainText('Campaigns');
     |                                                        ^ Error: expect(locator).toContainText(expected) failed
  29 |   });
  30 | 
  31 |   test('invalid route shows the 404 page', async ({ page }) => {
  32 |     await page.goto('/#/does-not-exist');
  33 |     await page.waitForLoadState('networkidle');
  34 |     await expect(page.locator('h1')).toHaveText('404');
  35 |     await expect(page.locator('text=Return to Base')).toBeVisible();
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