import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const { LOGIN_EMAIL, LOGIN_PASSWORD } = process.env;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'blob' : 'html',
  use: {
    headless: false,
    trace: 'on-first-retry',
  },
  projects: [
    // Setup project
    {
      name: 'setup',
      testMatch: /.*\.setup\.js/,
      use: {
        user: LOGIN_EMAIL,
        password: LOGIN_PASSWORD,
      },
    },

    // Chromium project
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
