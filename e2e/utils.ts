import { expect, type Page } from '@playwright/test';

export async function clearLocalStorageBeforePageLoad(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('sorobanQuest_onboarding_done', '1');
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
