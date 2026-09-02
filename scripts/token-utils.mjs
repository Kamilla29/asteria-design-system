import fs from 'node:fs';
import path from 'node:path';

export const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

export function deepMerge(target, source) {
  if (!isObject(target) || !isObject(source)) return structuredClone(source);
  const out = structuredClone(target);
  for (const [key, value] of Object.entries(source)) {
    if (isObject(value) && isObject(out[key]) && !('$value' in value) && !('$value' in out[key])) {
      out[key] = deepMerge(out[key], value);
    } else {
      out[key] = structuredClone(value);
    }
  }
  return out;
}

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);
export const isToken = (v) => isObject(v) && Object.hasOwn(v, '$value');

export function flattenTokens(node, prefix = [], out = new Map()) {
  if (!isObject(node)) return out;
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    const p = [...prefix, key];
    if (isToken(value)) out.set(p.join('.'), value);
    else if (isObject(value)) flattenTokens(value, p, out);
  }
  return out;
}

export function resolveAll(tree) {
  const tokens = flattenTokens(tree);
  const cache = new Map();
  const stack = new Set();

  function resolvePath(tokenPath) {
    if (cache.has(tokenPath)) return cache.get(tokenPath);
    if (!tokens.has(tokenPath)) throw new Error(`Unresolved alias: ${tokenPath}`);
    if (stack.has(tokenPath)) throw new Error(`Circular alias detected at: ${tokenPath}`);
    stack.add(tokenPath);
    const token = tokens.get(tokenPath);
    const value = resolveValue(token.$value);
    stack.delete(tokenPath);
    cache.set(tokenPath, { ...token, $value: value });
    return cache.get(tokenPath);
  }

  function resolveValue(value) {
    if (typeof value === 'string') {
      const exact = value.match(/^\{([^}]+)\}$/);
      if (exact) return resolvePath(exact[1]).$value;
      return value.replace(/\{([^}]+)\}/g, (_, p) => serialize(resolvePath(p).$value));
    }
    if (Array.isArray(value)) return value.map(resolveValue);
    if (isObject(value)) {
      const out = {};
      for (const [k, v] of Object.entries(value)) out[k] = resolveValue(v);
      return out;
    }
    return value;
  }

  for (const key of tokens.keys()) resolvePath(key);
  return cache;
}

export function serialize(value, type) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    if ('hex' in value && 'colorSpace' in value) return value.hex;
    if ('value' in value && 'unit' in value) return `${value.value}${value.unit}`;
    if ('fontFamily' in value && 'fontSize' in value) {
      const family = serialize(value.fontFamily);
      const size = serialize(value.fontSize);
      const weight = serialize(value.fontWeight);
      const line = serialize(value.lineHeight);
      return `${weight} ${size}/${line} ${family}`;
    }
  }
  if (Array.isArray(value)) {
    if (type === 'cubicBezier' && value.length === 4) return `cubic-bezier(${value.join(', ')})`;
    return value.join(', ');
  }
  if (typeof value === 'number') return String(value);
  return String(value);
}

export function effectiveType(token, tokenPath, tree) {
  if (token.$type) return token.$type;
  const parts = tokenPath.split('.');
  let node = tree;
  let inherited;
  for (const part of parts) {
    if (!node || typeof node !== 'object') break;
    node = node[part];
    if (node?.$type) inherited = node.$type;
  }
  return inherited;
}

export function setNested(obj, dotted, value) {
  const parts = dotted.split('.');
  let cur = obj;
  parts.forEach((part, i) => {
    if (i === parts.length - 1) cur[part] = value;
    else cur = cur[part] ??= {};
  });
}

export function loadPlatform(root, platform) {
  const files = ['tokens/core/primitives.tokens.json','tokens/core/semantic.tokens.json','tokens/core/components.tokens.json'];
  let tree = {};
  for (const rel of files) tree = deepMerge(tree, readJson(path.join(root, rel)));
  tree = deepMerge(tree, readJson(path.join(root, `tokens/platforms/${platform}.tokens.json`)));
  return tree;
}
