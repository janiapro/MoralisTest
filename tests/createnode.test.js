import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nodeKeyFilePath = path.join(__dirname, '../playwright/.auth/node_key.json');

test('Create and save node key', async ({ page }) => {
  await page.goto('https://admin.moralis.io/');
  await page.getByRole('button', { name: 'Nodes New' }).click();
  await page.getByTestId('mui-button-primary').click();
  await page.getByTestId('test-CardCountrySelect').selectOption('Ethereum');
  await page.getByTestId('mui-select').selectOption('0x1-Mainnet');
  await page.getByTestId('mui-modal').getByTestId('mui-button-primary').click();
  await page.getByTestId('mui-button').first().click();
  await page.waitForTimeout(4000);

  // Click the text field to copy the node key
  await page.locator('div').filter({ hasText: /^Site 1$/ }).getByTestId('mui-input').click();

  // Extract the value of the node key from the text field
  const nodeKey = await page.locator('div').filter({ hasText: /^Site 1$/ }).getByTestId('mui-input').inputValue();

  // Save the node key to a file
  fs.writeFileSync(nodeKeyFilePath, JSON.stringify({ nodeKey }));
});
