import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlatform, flattenTokens, resolveAll } from './token-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;
for (const platform of ['web', 'game']) {
  try {
    const tree = loadPlatform(root, platform);
    const flat = flattenTokens(tree);
    resolveAll(tree);
    console.log(`✓ ${platform}: ${flat.size} tokens; aliases resolve; no cycles detected.`);
  } catch (err) {
    failed = true;
    console.error(`✗ ${platform}: ${err.message}`);
  }
}
if (failed) process.exit(1);
