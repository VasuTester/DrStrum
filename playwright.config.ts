import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory where your test files are located
  testDir: './tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build if 'test.only' is committed
  forbidOnly: !!process.env.CI,

  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,

  // Run tests with only 1 worker in CI to avoid concurrency issues
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [['html', { outputDir: 'playwright-report', open: 'never' }]],

  // Global options for all tests
  use: {
    // Collect trace only on first retry
    trace: 'on-first-retry',

    // Capture screenshots on failure
    screenshot: 'only-on-failure',

    // Retain video only when tests fail
    video: 'retain-on-failure',

    // Set a reasonable timeout for tests
    actionTimeout: 30000, // 30 seconds
  },

  // Only run Chromium to prevent multiple runs across different browsers/devices
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Uncomment this if you need to start a dev server before tests
  /*
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  */
});


