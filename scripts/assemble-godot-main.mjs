import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceDir = path.join(root, 'godot-demo', 'source');
const target = path.join(root, 'godot-demo', 'main.gd');
const files = (await readdir(sourceDir))
  .filter((name) => name.endsWith('.gdpart'))
  .sort();

if (!files.length) throw new Error('No Godot source fragments found.');
const parts = await Promise.all(files.map((name) => readFile(path.join(sourceDir, name), 'utf8')));
await writeFile(target, parts.join(''));
console.log(`Godot main script assembled from ${files.length} ordered source fragments.`);
