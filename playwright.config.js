import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 120000,
  expect: {
    timeout: 10000,
    // Default screenshot comparison thresholds (overridable per-assertion).
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixelRatio: 0.03,
    },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : 'list',

  // Baseline snapshots are stored here (committed to the repo).
  snapshotDir: './e2e/snapshots',
  // Predictable snapshot filenames: e2e/snapshots/<test-name>/<browser>/<file>.png
  snapshotPathTemplate:
    '{snapshotDir}/{testFilePath}/{projectName}/{arg}{ext}',

  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1280, height: 900 },
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    // Disable CSS animations & transitions for deterministic screenshots.
    launchOptions: {
      args: ['--force-prefers-reduced-motion'],
    },
  },

  projects: [
    // ── Functional tests (existing) ────────────────────────────────────────
    {
      name: 'chromium',
      testIgnore: /visual-regression/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    // ── Visual regression – desktop ────────────────────────────────────────
    {
      name: 'visual-chromium',
      testMatch: /visual-regression/,
      // Visual tests should not retry automatically; a diff is a diff.
      retries: 0,
      use: {
        ...devices['Desktop Chrome'],
        // Keep a stable viewport regardless of device defaults.
        viewport: { width: 1280, height: 900 },
        // Disable animations for pixel-perfect snapshots.
        launchOptions: {
          args: ['--force-prefers-reduced-motion', '--disable-gpu'],
        },
      },
    },
  ],

  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

