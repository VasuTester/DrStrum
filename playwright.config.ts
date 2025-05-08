// import { defineConfig, devices } from '@playwright/test';

// /**
//  * Read environment variables from file.
//  * https://github.com/motdotla/dotenv
//  */
// // import dotenv from 'dotenv';
// // import path from 'path';
// // dotenv.config({ path: path.resolve(__dirname, '.env') });

// /**
//  * See https://playwright.dev/docs/test-configuration.
//  */
// export default defineConfig({
//   testDir: './tests',
//   /* Run tests in files in parallel */
//   fullyParallel: true,
//   /* Fail the build on CI if you accidentally left test.only in the source code. */
//   forbidOnly: !!process.env.CI,
//   /* Retry on CI only */
//   retries: process.env.CI ? 2 : 0,
//   /* Opt out of parallel tests on CI. */
//   workers: process.env.CI ? 1 : undefined,
//   /* Reporter to use. See https://playwright.dev/docs/test-reporters */
//   reporter: 'html',
//   /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
//   use: {
//     /* Base URL to use in actions like `await page.goto('/')`. */
//     // baseURL: 'http://127.0.0.1:3000',

//     /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
//     trace: 'on-first-retry',
//   },

//   /* Configure projects for major browsers */
//   projects: [
//     {
//       name: 'chromium',
//       use: { ...devices['Desktop Chrome'] },
//     },

//     {
//       name: 'firefox',
//       use: { ...devices['Desktop Firefox'] },
//     },

//     {
//       name: 'webkit',
//       use: { ...devices['Desktop Safari'] },
//     },

//     /* Test against mobile viewports. */
//      {
//        name: 'Android Chrome',
//        use: { ...devices['Pixel 5'] },
//      },
//      {
//       name: 'Iphone Safari',
//        use: { ...devices['iPhone 12'] },
//      },

//     /* Test against branded browsers. */
//     // {
//     //   name: 'Microsoft Edge',
//     //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
//     // },
//     // {
//     //   name: 'Google Chrome',
//     //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
//     // },
//   ],

//   /* Run your local dev server before starting the tests */
//   // webServer: {
//   //   command: 'npm run start',
//   //   url: 'http://127.0.0.1:3000',
//   //   reuseExistingServer: !process.env.CI,
//   // },
// });

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

  // Reporters to use
  reporter: [
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['html', { outputDir: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

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