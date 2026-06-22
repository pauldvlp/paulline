import { defineConfig, devices } from '@playwright/test';

const E2E_DIR = './e2e';
const DEFAULT_WEB_PORT = 5173;
const DEFAULT_API_PORT = 3000;
const TEST_TIMEOUT_MS = 30_000;
const EXPECT_TIMEOUT_MS = 5_000;
const CI_RETRIES = 2;
const LOCAL_RETRIES = 0;
const CI_WORKERS = 1;

const isCi = Boolean(process.env.CI);
const webPort = Number(process.env.WEB_PORT ?? DEFAULT_WEB_PORT);
const apiPort = Number(process.env.API_PORT ?? DEFAULT_API_PORT);

export const baseURL = `http://localhost:${webPort}`;
export const apiBaseURL = `http://localhost:${apiPort}`;

const WEB_SERVER_TIMEOUT_MS = 120_000;

export default defineConfig({
  testDir: E2E_DIR,
  webServer: {
    command: 'pnpm dev',
    url: baseURL,
    reuseExistingServer: !isCi,
    timeout: WEB_SERVER_TIMEOUT_MS,
  },
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? CI_RETRIES : LOCAL_RETRIES,
  workers: isCi ? CI_WORKERS : undefined,
  timeout: TEST_TIMEOUT_MS,
  expect: { timeout: EXPECT_TIMEOUT_MS },
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
