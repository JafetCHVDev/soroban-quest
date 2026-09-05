import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, type Page } from '@playwright/test';

const fixtureDirectory = path.resolve(path.dirname(fileURLtoPath(import.meta.url)), '..', 'fixtures');

export async function clearLocalStorageBeforePageLoad(page: Page, options: { onboardingDone?: boolean } = {}) {
  const { onboardingDone = true } = options;
  await page.goto('/');
  await page.waitForLoadState('load');
  await page.evaluate((onboardingDone) => {
    localStorage.clear();
    if (onboardingDone) {
      localStorage.setItem('sorobanQuest_onboarding_done', '1');
    }
  }, onboardingDone);
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
    content: `p
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
  await page.locator('.mission-detail').waitFor({ state: 'attached', timeout: 20000 });
  await page.locator('.mission-detail-skeleton, .loading').waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  const editorTab = page.locator('.tab-btn, [role="tab"]').filter({ hasText: /editor/i }).first();
  if (await editorTab.isVisible().catch(() => false)) {
    await editorTab.click().catch(() => {});
  }
  const editor = page.locator('.monaco-editor');
  await expect(editor.first()).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(500);
}

export async function fillMonacoEditor(page: Page, content: string) {
  await waitForMonaco(page);
  const editorHost = page.locator('.monaco-editor').first();
  await editorHost.click({ position: { x: 200, y: 100 }, force: true });

  // Wait a moment for focus
  await page.waitTimeout(500);

  // Select all and type new content
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(content);
}

export const HELLO_SOROBAN_SOLUTION = `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct HelloContract;

#[contractimpl]
impl HelloContract {
    pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), to]
    }
}`;

/**
 * Wait for test runner results to appear
 */
export async function waitForTestResults(page: Page) {
  const testsTab = page.locator('.tab-btn:has-text("Tests"), button[role="tab"]:has-text("Tests")');
  if (await testsTab.first().isVisible().catch(() => false)) {
    await testsTab.first().click();
  }
  const testResultsContainer = page.locator(
    '.terminal-line, [class*="test-results"], [class*="TestResults"], [data-testid="test-results"]',
  );
  await expect(testResultsContainer.first()).toBeVisible({ timeout: 30000 });
}

/**
 * Check XPdisplay value in the UI */
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
  return page.evaluate(() => {
    const profilesData = localStorage.getItem('soroban_quest_profiles');
    if (profilesData) {
      try {
        const profiles = JSON.parse(profilesData);
        const activeId = localStorage.getItem('soroban_quest_active_profile');
        const slot = profiles.find((entry) => entry.id === activeId) || profiles[0];
        if (slot?.progress) return slot.progress;
      } catch {
        /* fall through */
      }
    }

    const progressData = localStorage.getItem('soroban_quest_progress');
    if (!progressData) return null;
    try {
      return JSON.parse(progressData);
    } catch {
      return null;
    }
  });
}

/**
 * Check if mission is marked as completed in localStorage
 */
export async function isMissionCompleted(page: Page, missionId: string) {
  const progress = await getMissionProgressFromStorage(page);
  return progress && progress.completedMissions.includes(missionId);
}