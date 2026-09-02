import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const tokenSource = path.join(root, 'dist', 'game', 'tokens.json');
const tokenDir = path.join(root, 'godot-demo', 'design-system');
const tokenTarget = path.join(tokenDir, 'tokens.json');

await mkdir(tokenDir, { recursive: true });
await copyFile(tokenSource, tokenTarget);
console.log(`Godot token sync: ${path.relative(root, tokenSource)} -> ${path.relative(root, tokenTarget)}`);

const localeDir = path.join(root, 'godot-demo', 'locales');
await mkdir(localeDir, { recursive: true });
for (const code of ['en', 'cs']) {
  const source = path.join(root, 'locales', `${code}.json`);
  const target = path.join(localeDir, `${code}.json`);
  await copyFile(source, target);
}
console.log('Godot locale sync: locales/{en,cs}.json -> godot-demo/locales/');
