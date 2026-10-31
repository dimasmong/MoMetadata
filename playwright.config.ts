import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  fullyParallel: false, // Run cleanly
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'android-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: 'npm.cmd run dev -- --port 5199',
    port: 5199,
    reuseExistingServer: false,
  },
});
