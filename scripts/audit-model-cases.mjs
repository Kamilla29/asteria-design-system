import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { flattenTokens, loadPlatform } from './token-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modelCases = [
  ['web', 'prototypes/web/styles.css'],
  ['game', 'prototypes/game/styles']
];
const sharedContractMarkers = ['action', 'panel', 'nav-item', 'status-badge', 'progress'];

let failed = false;

for (const [platform, relativePath] of modelCases) {
  const fullPath = path.join(root, relativePath);
  const source = fs.statSync(fullPath).isDirectory()
    ? fs.readdirSync(fullPath).filter((name) => name.endsWith('.css')).sort().map((name) => fs.readFileSync(path.join(fullPath, name), 'utf8')).join('\n')
    : fs.readFileSync(fullPath, 'utf8');
  const referenced = new Set(
    [...source.matchAll(/var\(--([A-Za-z0-9_-]+)/g)]
      .map((match) => match[1].replaceAll('-', '.'))
      .filter((tokenPath) => !tokenPath.startsWith('runtime.'))
  );
  const available = new Set(flattenTokens(loadPlatform(root, platform)).keys());
  const missing = [...referenced].filter((tokenPath) => !available.has(tokenPath));

  console.log(
    `${platform}: ${referenced.size} token references in model-case CSS; ${missing.length} unresolved.`
  );

  if (missing.length) {
    failed = true;
    console.log('  missing:', missing.join(', '));
  }
}

const webHtml = fs.readFileSync(path.join(root, 'prototypes/web/index.html'), 'utf8');
const gameHtml = fs.readFileSync(path.join(root, 'prototypes/game/index.html'), 'utf8');

for (const marker of sharedContractMarkers) {
  if (!webHtml.includes(marker) || !gameHtml.includes(marker)) {
    failed = true;
    console.log(`Shared contract marker missing from a model case: ${marker}`);
  }
}

if (failed) process.exit(1);

console.log('Model-case audit passed.');
