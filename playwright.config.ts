import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests: the built application, served as it will be, driven in a
 * real Chromium. The museum is never called — `e2e/collectionApiMock.ts`
 * answers every request from recorded files — so the run is the same offline,
 * on a slow day of the museum's, or while it blocks this machine.
 */
const PREVIEW_URL = 'http://localhost:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: PREVIEW_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: PREVIEW_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
