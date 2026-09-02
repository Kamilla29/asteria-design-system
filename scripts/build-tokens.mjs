import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlatform, flattenTokens, resolveAll, serialize, effectiveType, setNested } from './token-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

for (const platform of ['web', 'game']) {
  const tree = loadPlatform(root, platform);
  const flat = flattenTokens(tree);
  const resolved = resolveAll(tree);
  const nested = {};

  for (const [tokenPath, token] of resolved.entries()) {
    const type = effectiveType(flat.get(tokenPath), tokenPath, tree);
    setNested(nested, tokenPath, token.$value);
  }

  const dir = path.join(root, 'dist', platform);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify(nested, null, 2) + '\n');

  const lines = [':root {'];
  for (const [tokenPath, original] of [...flat.entries()].sort(([a],[b]) => a.localeCompare(b))) {
    const type = effectiveType(original, tokenPath, tree);
    const resolvedToken = resolved.get(tokenPath);
    lines.push(`  --${tokenPath.replaceAll('.', '-')}: ${serialize(resolvedToken.$value, type)};`);
  }
  lines.push('}', '');
  fs.writeFileSync(path.join(dir, 'tokens.css'), lines.join('\n'));
}

console.log('Built web and game token outputs.');
