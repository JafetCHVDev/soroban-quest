import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000, // Reduced from 120s to 60s
  expect: {
    timeout: 15000, // Increased from 10s to 15s for visual tests
    // Default screenshot comparison thresholds (overridable per-assertion).
    toHaveScreenshot: {
      threshold: 0.1,
      maxDiffPixelRatio: 0.03,
      // Optimize screenshot settings for performance
      animations: 'disabled',
      clip: { x: 0, y: 0, width: 1280, height: 900 }, // Clip to viewport size
    },
  },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 1, // Reduce workers to avoid memory issues
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
    acceptDownloads: false, // Disable downloads for faster tests
    actionTimeout: 10000,
    navigationTimeout: 30000, // Added navigation timeout
    trace: 'retain-on-failure',
    // Optimize for performance and deterministic screenshots
    launchOptions: {
      args: [
        '--force-prefers-reduced-motion',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-web-security',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
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
      timeout: 45000, // Reduced timeout for visual tests
      use: {
        ...devices['Desktop Chrome'],
        // Keep a stable viewport regardless of device defaults.
        viewport: { width: 1280, height: 900 },
        // Optimize for visual testing performance
        video: 'off', // Disable video recording for performance
        screenshot: 'only-on-failure',
        // Disable animations for pixel-perfect snapshots.
        launchOptions: {
          args: [
            '--force-prefers-reduced-motion',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-web-security',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--memory-pressure-off',
          ],
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

