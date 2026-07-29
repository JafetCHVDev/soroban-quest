import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page } from '@playwright/test';

const fixtureDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'fixtures');

export async function clearLocalStorageBeforePageLoad(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('sorobanQuest_onboarding_done', '1');
  });
}

export async function setAppTheme(page: Page, theme: 'dark' | 'light' = 'dark') {
  await page.evaluate((value) => {
    localStorage.setItem('soroban_quest_theme', value);
    document.documentElement.setAttribute('data-theme', value);
  }, theme);
}

export async function freezeVisualRegressionClock(page: Page, time = '2026-01-15T12:00:00.000Z') {
  await page.clock.install({ time: new Date(time) });
}

export async function seedVisualRegressionState(page: Page, fixtureName: string) {
  const fixturePath = path.join(fixtureDirectory, `${fixtureName}.json`);
  const data = JSON.parse(readFileSync(fixturePath, 'utf8'));

  await page.evaluate((payload) => {
    Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
      if (value === undefined) return;
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
    });
  }, data);
}

export async function maskDynamicElements(page: Page) {
  await page.addStyleTag({
    content: `
      .confetti-container, .confetti-piece {
        visibility: hidden !important;
      }
      .toast, [role="status"] {
        display: none !important;
      }
    `,
  });
}

export async function waitForMonaco(page: Page) {
  const editor = page.locator('.monaco-editor textarea, .monaco-editor');
  await expect(editor.first()).toBeVisible({ timeout: 20000 });
}

export async function fillMonacoEditor(page: Page, content: string) {
  // Wait for Monaco editor to load
  await waitForMonaco(page);

  // Try to focus the editor by clicking on it directly
  const editorHost = page.locator('.monaco-editor').first();
  await editorHost.click({ position: { x: 200, y: 100 }, force: true });

  // Wait a moment for focus
  await page.waitForTimeout(500);

  // Select all and type new content
  await page.keyboard.press('Control+A');
  await page.keyboard.type(content, { delay: 10 });
}

/**
 * Wait for test runner results to appear
 */
export async function waitForTestResults(page: Page) {
  const testResultsContainer = page.locator('[class*="test-results"], [class*="TestResults"], .results, [data-testid="test-results"]');
  await expect(testResultsContainer.first()).toBeVisible({ timeout: 30000 });
}

/**
 * Check XP display value in the UI
 */
export async function checkXPDisplay(page: Page, expectedXP: number) {
  // Look for XP display in common locations (Navbar, stats, modal)
  const xpElements = page.locator('text=/XP|xp.*\\d+/, [class*="xp"], [class*="XP"], [data-testid*="xp"]');
  
  // Try to find exact XP value in the page text
  const xpText = page.locator(`text=/${expectedXP}/`);
  await expect(xpText).toBeVisible({ timeout: 5000 });
}

/**
 * Verify localStorage state via page.evaluate()
 */
export async function verifyLocalStorageState(page: Page, key: string, expectedValue: any) {
  const value = await page.evaluate((storageKey) => {
    const item = localStorage.getItem(storageKey);
    return item ? JSON.parse(item) : null;
  }, key);
  
  return expect(value).toEqual(expectedValue);
}

/**
 * Wait for confetti animation element to appear
 */
export async function waitForConfetti(page: Page) {
  const confetti = page.locator('[class*="confetti"], [class*="Confetti"]').first();
  await expect(confetti).toBeVisible({ timeout: 10000 });
}

/**
 * Get mission data from localStorage
 */
export async function getMissionProgressFromStorage(page: Page) {
  const progress = await page.evaluate(() => {
    const progressData = localStorage.getItem('soroban_quest_progress');
    return progressData ? JSON.parse(progressData) : null;
  });
  return progress;
}

/**
 * Check if mission is marked as completed in localStorage
 */
export async function isMissionCompleted(page: Page, missionId: string) {
  const progress = await getMissionProgressFromStorage(page);
  return progress && progress.completedMissions.includes(missionId);
}
