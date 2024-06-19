import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKeyFilePath = path.join(__dirname, '../playwright/.auth/api_key.json');

test('Create and save API key', async ({ page }) => {
  // Use the stored authenticated state
  await page.goto('https://admin.moralis.io/');
  await page.waitForTimeout(2000);
  
  // Ensure the button to copy the API key is visible and click it
  const copyButton = await page.getByTestId('mui-copy').getByTestId('mui-button');
  await copyButton.click();
  
  // Wait for the API key to be available in the input field
  const apiKeyInput = await page.waitForSelector('input[data-testid="mui-input"]');
  await page.waitForTimeout(2000);
  
  // Ensure the input field is visible and contains the full API key
  await page.getByTestId('mui-showhide').getByTestId('mui-button').click();
  
  // Extract the value of the API key from the input field
  const apiKey = await apiKeyInput.inputValue();
  
  // Verify the length of the API key to ensure it's complete
  expect(apiKey.length).toBeGreaterThan(100);  // Adjust the length based on the expected key length
  
  // Save the API key to a file
  fs.writeFileSync(apiKeyFilePath, JSON.stringify({ apiKey }));
  
  // Log the saved API key to verify in the console (for debugging purposes)
  console.log('Saved API key:', apiKey);
});
