import { test as setup } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const authFile = 'playwright/.auth/user.json';

setup('authenticate by UI', async ({ page }) => {
  const user = process.env.LOGIN_EMAIL;
  const password = process.env.LOGIN_PASSWORD;

  // Perform authentication steps
  await page.goto('https://admin.moralis.io/login');
  await page.waitForSelector('role=button[name="Accept all"]', { timeout: 10000 });
  await page.waitForTimeout(2200);
  await page.getByRole('button', { name: 'Accept all' }).click();
  await page.waitForTimeout(2200);

  const emailLabel = await page.waitForSelector('label[data-testid="test-input-label"][for="admin-login-email"]');
  await emailLabel.click();
  await page.waitForTimeout(2500);
  const emailField = await page.waitForSelector('#admin-login-email');
  await emailField.fill(user);

  const passwordLabel = await page.waitForSelector('span[data-testid="test-typography"][title="Password"]');
  await passwordLabel.click();
  await page.waitForTimeout(2100);
  const passwordField = await page.$('input[type="password"]');
  await passwordField.fill(password);

  await page.waitForTimeout(2000);
  await page.click('[data-testid="test-checkbox-label"]');
  await page.waitForTimeout(2000);
  await page.click('[data-testid="test-button"]');
  await page.waitForTimeout(4300);

  await page.waitForSelector('span:has-text("Welcome")');

  // Save storage state into a file
  await page.context().storageState({ path: authFile });
}, { timeout: 60000 }); // Increase timeout to 60 seconds
