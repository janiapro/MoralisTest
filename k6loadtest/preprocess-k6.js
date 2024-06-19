import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Path to the node key file
const nodeKeyFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../playwright/.auth/node_key.json');

// Read the node key from the JSON file
if (!fs.existsSync(nodeKeyFilePath)) {
  throw new Error(`Node key file not found at path: ${nodeKeyFilePath}`);
}

const { nodeKey } = JSON.parse(fs.readFileSync(nodeKeyFilePath, 'utf8'));

if (!nodeKey) {
  throw new Error('Node key is empty.');
}

// Read the K6 test template file
const k6TemplateFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'k6-test-template.js');
const k6TestTemplate = fs.readFileSync(k6TemplateFilePath, 'utf8');

// Replace the placeholder with the actual node key
const k6TestFileContent = k6TestTemplate.replace('<NODE_KEY_PLACEHOLDER>', nodeKey);

// Write the processed K6 test file
const k6TestFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), 'k6-test.js');
fs.writeFileSync(k6TestFilePath, k6TestFileContent);

// Run the K6 script
execSync(`k6 run ${k6TestFilePath}`, { stdio: 'inherit' });
