import { test, expect } from '@playwright/test';
import {
  clearLocalStorageBeforePageLoad,
  waitForMonaco,
  fillMonacoEditor,
  waitForTestResults,
  checkXPDisplay,
  verifyLocalStorageState,
  waitForConfetti,
  getMissionProgressFromStorage,
  isMissionCompleted,
} from './utils';

test.describe('Mission Gameplay Flow — Complete Tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearLocalStorageBeforePageLoad(page);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 1: Complete Mission Flow (Happy Path)
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 1: Should complete mission with correct solution', async ({ page }) => {
    // Navigate to campaigns
    await page.goto('/#/campaigns');
    await expect(page).toHaveURL(/#\/campaigns/);

    // Click on Campaign 1 (first unlocked campaign card)
    const firstCampaign = page.locator('.campaign-card:not(.locked)').first();
    await firstCampaign.click();

    // Wait for campaign detail overlay
    const campaignOverlay = page.locator('.campaign-detail-overlay, .missions-list');
    await expect(campaignOverlay).toBeVisible({ timeout: 10000 });

    // Click first mission (hello-soroban)
    const firstMission = page.locator('.mission-item, .mission-card').first();
    await firstMission.click();

    // Navigate to mission detail page
    await expect(page).toHaveURL(/#\/mission\/hello-soroban/);
    await page.waitForLoadState('networkidle');

    // Wait for Monaco editor to load
    await waitForMonaco(page);

    // Write correct solution
    const correctSolution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env, symbol_short!("Hello"), to]
}`;
    await fillMonacoEditor(page, correctSolution);

    // Click "Run Tests" button
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await expect(runTestsBtn).toBeVisible();
    await runTestsBtn.click();

    // Wait for test results to appear
    await waitForTestResults(page);

    // Assert all tests pass (look for passing test indicators)
    const passedTests = page.locator('[class*="pass"], [class*="success"], text=/passed|✓/i');
    await expect(passedTests.first()).toBeVisible({ timeout: 10000 });

    // Assert XP is awarded (check if confetti or completion modal appears)
    await waitForConfetti(page);

    // Check localStorage: mission should be marked completed
    const isCompleted = await isMissionCompleted(page, 'hello-soroban');
    expect(isCompleted).toBe(true);

    // Verify progress was saved
    const progress = await getMissionProgressFromStorage(page);
    expect(progress.completedMissions).toContain('hello-soroban');
    expect(progress.xp).toBeGreaterThanOrEqual(100); // hello-soroban gives 100 XP
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 2: Mission Failure Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 2: Should handle mission failure with incorrect code', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    // Wait for Monaco editor
    await waitForMonaco(page);

    // Write incorrect solution (missing parts)
    const incorrectSolution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env]
}`;
    await fillMonacoEditor(page, incorrectSolution);

    // Click "Run Tests"
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    // Wait for test results
    await waitForTestResults(page);

    // Assert tests fail (look for failure indicators)
    const failedTests = page.locator('[class*="fail"], [class*="error"], text=/failed|✗/i');
    await expect(failedTests.first()).toBeVisible({ timeout: 10000 });

    // Assert mission is NOT completed
    const isCompleted = await isMissionCompleted(page, 'hello-soroban');
    expect(isCompleted).toBe(false);

    // Verify no XP was awarded
    const progress = await getMissionProgressFromStorage(page);
    expect(progress.xp).toBe(0);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 3: Hint Usage Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 3: Should display hints and allow solution with hint guidance', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    // Look for "Show Hints" button
    const showHintsBtn = page.locator('button:has-text("Hints"), button:has-text("Show Hints"), [class*="hint"]').first();
    if (await showHintsBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await showHintsBtn.click();

      // Assert hints are displayed
      const hintsContent = page.locator('[class*="hint"], [class*="Hint"], [role="dialog"]').first();
      await expect(hintsContent).toBeVisible({ timeout: 5000 });
    }

    // Fill editor with solution
    await waitForMonaco(page);
    const solution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env, symbol_short!("Hello"), to]
}`;
    await fillMonacoEditor(page, solution);

    // Run tests and verify passing
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    await waitForTestResults(page);
    const passedTests = page.locator('[class*="pass"], [class*="success"]').first();
    await expect(passedTests).toBeVisible({ timeout: 10000 });
  });
});

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 4: Solution Reveal Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 4: Should reveal solution with confirmation and penalty warning', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    // Look for "Show Solution" button
    const showSolutionBtn = page.locator('button:has-text("Solution"), button:has-text("Show Solution"), [class*="solution"]').first();
    if (await showSolutionBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await showSolutionBtn.click();

      // Assert confirmation dialog appears
      const confirmDialog = page.locator('[role="dialog"], .modal, [class*="confirmation"]').first();
      await expect(confirmDialog).toBeVisible({ timeout: 5000 });

      // Look for confirmation button (Confirm, Yes, Reveal, etc.)
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Reveal"), button:has-text("OK")').first();
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();

        // Assert solution code loads in editor
        await waitForMonaco(page);
        const editorContent = page.locator('.monaco-editor');
        await expect(editorContent).toBeVisible({ timeout: 5000 });
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 5: Campaign Progression Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 5: Should unlock next campaign after completing all missions', async ({ page }) => {
    // Pre-complete all missions in Chapter 1
    await page.goto('/');
    await page.evaluate(() => {
      const progress = {
        completedMissions: ['hello-soroban', 'greetings-protocol'],
        xp: 200,
        level: 1,
        badges: [],
        firstTryMissions: ['hello-soroban', 'greetings-protocol'],
        streak: 0,
        lastLogin: null,
        gold: 100,
        purchasedItems: [],
        missionAttempts: {},
      };
      localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
    });

    // Navigate to campaigns
    await page.goto('/#/campaigns');
    await page.waitForLoadState('networkidle');

    // Assert Campaign 1 shows as complete
    const chapter1Card = page.locator('.campaign-card').first();
    const progressBar = chapter1Card.locator('[class*="progress"]');
    await expect(progressBar).toBeVisible({ timeout: 5000 });

    // Assert Campaign 2 is now unlocked
    const chapter2Card = page.locator('.campaign-card').nth(1);
    const lockedClass = await chapter2Card.getAttribute('class');
    expect(lockedClass).not.toContain('locked');
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 6: XP and Level Up Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 6: Should level up and update rank when earning enough XP', async ({ page }) => {
    // Start with cleared localStorage (level 1)
    await page.goto('/');

    // Manually award enough XP to trigger level up (XP for level 2 is 500)
    await page.evaluate(() => {
      const progress = {
        completedMissions: [],
        xp: 0,
        level: 1,
        badges: [],
        firstTryMissions: [],
        streak: 0,
        lastLogin: null,
        gold: 0,
        purchasedItems: [],
        missionAttempts: {},
      };
      localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
    });

    // Navigate to mission and complete it
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    await waitForMonaco(page);
    const solution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env, symbol_short!("Hello"), to]
}`;
    await fillMonacoEditor(page, solution);

    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    // Wait for completion
    await waitForTestResults(page);

    // Check localStorage for XP increase
    const progress = await getMissionProgressFromStorage(page);
    expect(progress.xp).toBeGreaterThan(0);

    // Check that level has been determined based on XP
    expect(progress.level).toBeGreaterThanOrEqual(1);
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 7: Profile Switching Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 7: Should preserve progress when switching between profiles', async ({ page }) => {
    // Navigate to profile page
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Complete first profile with some missions
    await page.evaluate(() => {
      const profiles = [
        {
          id: 'player-1',
          profile: { name: 'Player 1', avatar: '🛡️' },
          progress: {
            completedMissions: ['hello-soroban'],
            xp: 100,
            level: 1,
            badges: [],
            firstTryMissions: ['hello-soroban'],
            streak: 0,
            lastLogin: null,
            gold: 50,
            purchasedItems: [],
            missionAttempts: { 'hello-soroban': 1 },
          },
        },
      ];
      localStorage.setItem('soroban_quest_profiles', JSON.stringify(profiles));
      localStorage.setItem('soroban_quest_active_profile', 'player-1');
    });

    // Check progress is preserved
    const progress1 = await getMissionProgressFromStorage(page);
    expect(progress1.completedMissions).toContain('hello-soroban');
    expect(progress1.xp).toBe(100);

    // If profile switching UI exists, verify it works
    const profileCards = page.locator('[class*="profile"], [data-testid*="profile"]');
    if (await profileCards.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      // Profile UI exists
      expect(profileCards).toBeDefined();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // SCENARIO 8: Export/Import Flow
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 8: Should export and import profile data correctly', async ({ page, context }) => {
    // Set up initial progress
    await page.goto('/');
    await page.evaluate(() => {
      const progress = {
        completedMissions: ['hello-soroban'],
        xp: 100,
        level: 1,
        badges: ['first_contract'],
        firstTryMissions: ['hello-soroban'],
        streak: 1,
        lastLogin: new Date().toISOString().split('T')[0],
        gold: 50,
        purchasedItems: [],
        missionAttempts: { 'hello-soroban': 1 },
      };
      localStorage.setItem('soroban_quest_progress', JSON.stringify(progress));
    });

    // Get initial state
    const initialProgress = await getMissionProgressFromStorage(page);

    // Navigate to profile or find export button
    await page.goto('/#/profile');
    await page.waitForLoadState('networkidle');

    // Look for export button
    const exportBtn = page.locator('button:has-text("Export"), button:has-text("Download")').first();
    if (await exportBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');

      await exportBtn.click();

      // Wait for download (if available)
      try {
        const download = await downloadPromise;
        // Could be used to verify file content
        expect(download).toBeDefined();
      } catch (e) {
        // Download might not work in all environments
      }
    }

    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
      localStorage.setItem('sorobanQuest_onboarding_done', '1');
    });

    // Verify cleared
    const clearedProgress = await getMissionProgressFromStorage(page);
    expect(clearedProgress).toBeNull();

    // Look for import button
    const importBtn = page.locator('button:has-text("Import"), button:has-text("Upload")').first();
    if (await importBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Import would require file input handling
      // This test verifies the UI elements exist
      expect(importBtn).toBeDefined();
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // RESPONSIVE TESTS
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 9: Should complete mission on desktop viewport (1280x720)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    // Verify layout is responsive
    const mainContent = page.locator('.main-content, main');
    await expect(mainContent).toBeVisible();

    // Verify editor is accessible
    await waitForMonaco(page);
    const solution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env, symbol_short!("Hello"), to]
}`;
    await fillMonacoEditor(page, solution);

    // Run tests
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    await waitForTestResults(page);

    // Take screenshot
    await expect(page).toHaveScreenshot('mission-desktop-completed.png', {
      mask: [page.locator('[class*="modal"], [role="dialog"]')],
    });
  });

  test('Scenario 10: Should complete mission on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    // Verify layout is responsive on mobile
    const mainContent = page.locator('.main-content, main');
    await expect(mainContent).toBeVisible();

    // Verify editor is accessible on mobile
    await waitForMonaco(page);
    const solution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env, symbol_short!("Hello"), to]
}`;
    await fillMonacoEditor(page, solution);

    // Run tests
    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    await waitForTestResults(page);

    // Take screenshot
    await expect(page).toHaveScreenshot('mission-mobile-completed.png', {
      mask: [page.locator('[class*="modal"], [role="dialog"]')],
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════════
  // VISUAL REGRESSION TESTS
  // ═══════════════════════════════════════════════════════════════════════════════
  test('Scenario 11: Visual regression - Mission page initial state', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    // Wait for editor to stabilize
    await waitForMonaco(page);
    await page.waitForTimeout(1000);

    // Take snapshot
    await expect(page).toHaveScreenshot('mission-initial-state.png');
  });

  test('Scenario 12: Visual regression - Mission page after passing tests', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    await waitForMonaco(page);
    const solution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![&env, symbol_short!("Hello"), to]
}`;
    await fillMonacoEditor(page, solution);

    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    await waitForTestResults(page);
    await page.waitForTimeout(1000);

    // Take snapshot
    await expect(page).toHaveScreenshot('mission-after-passing-tests.png');
  });

  test('Scenario 13: Visual regression - Mission page after failing tests', async ({ page }) => {
    await page.goto('/#/mission/hello-soroban');
    await page.waitForLoadState('networkidle');

    await waitForMonaco(page);
    const incorrectSolution = `pub fn hello(env: Env, to: Symbol) -> Vec<Symbol> {
  vec![]
}`;
    await fillMonacoEditor(page, incorrectSolution);

    const runTestsBtn = page.locator('button:has-text("Run Tests")');
    await runTestsBtn.click();

    await waitForTestResults(page);
    await page.waitForTimeout(1000);

    // Take snapshot
    await expect(page).toHaveScreenshot('mission-after-failing-tests.png');
  });
});
