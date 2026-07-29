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
