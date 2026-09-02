import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { deepMerge, flattenTokens, readJson } from './token-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreFiles = ['primitives', 'semantic', 'components'];

let core = {};
for (const name of coreFiles) {
  core = deepMerge(core, readJson(path.join(root, `tokens/core/${name}.tokens.json`)));
}

const corePaths = new Set(flattenTokens(core).keys());

console.log(`Shared core tokens: ${corePaths.size}`);

for (const platform of ['web', 'game']) {
  const adapter = readJson(path.join(root, `tokens/platforms/${platform}.tokens.json`));
  const paths = [...flattenTokens(adapter).keys()];
  const overrides = paths.filter((tokenPath) => corePaths.has(tokenPath));
  const additions = paths.filter((tokenPath) => !corePaths.has(tokenPath));

  console.log(
    `${platform}: ${additions.length} platform-specific additions, ${overrides.length} shared-token overrides.`
  );

  if (overrides.length) {
    console.log(`  overrides: ${overrides.join(', ')}`);
  }
}
