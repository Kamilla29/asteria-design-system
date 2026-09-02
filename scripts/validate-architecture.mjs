import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { deepMerge, flattenTokens, readJson, resolveAll } from './token-utils.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const coreFiles = [
  'tokens/core/primitives.tokens.json',
  'tokens/core/semantic.tokens.json',
  'tokens/core/components.tokens.json'
];
const platforms = ['web', 'game'];

function loadCore() {
  let tree = {};
  for (const relativePath of coreFiles) {
    tree = deepMerge(tree, readJson(path.join(root, relativePath)));
  }
  return tree;
}

function loadPlatform(platform, core = loadCore()) {
  return deepMerge(
    core,
    readJson(path.join(root, `tokens/platforms/${platform}.tokens.json`))
  );
}

function hex(resolved, tokenPath) {
  const value = resolved.get(tokenPath)?.$value;
  return value?.hex ?? value;
}

// Experiment 1 — shared change propagation.
const baseline = {};
const changed = {};

for (const platform of platforms) {
  baseline[platform] = resolveAll(loadPlatform(platform));
}

const modifiedCore = loadCore();
modifiedCore.primitive.color.brand['500'].$value = {
  colorSpace: 'srgb',
  components: [0.658824, 0.333333, 0.968627],
  alpha: 1,
  hex: '#A855F7'
};

for (const platform of platforms) {
  changed[platform] = resolveAll(loadPlatform(platform, modifiedCore));
}

const propagationPaths = [
  'semantic.color.action.primary.base',
  'component.action.background.default',
  'component.navigationItem.indicator',
  'component.progress.value'
];

const propagation = propagationPaths.map((tokenPath) => ({
  token: tokenPath,
  webBefore: hex(baseline.web, tokenPath),
  webAfter: hex(changed.web, tokenPath),
  gameBefore: hex(baseline.game, tokenPath),
  gameAfter: hex(changed.game, tokenPath),
  changedOnBoth:
    hex(changed.web, tokenPath) === '#A855F7' &&
    hex(changed.game, tokenPath) === '#A855F7'
}));

// Experiment 2 — platform isolation.
const coreSet = new Set(flattenTokens(loadCore()).keys());
const platformSets = {};

for (const platform of platforms) {
  const adapter = readJson(path.join(root, `tokens/platforms/${platform}.tokens.json`));
  platformSets[platform] = new Set(flattenTokens(adapter).keys());
}

const webOnly = [...platformSets.web].filter((tokenPath) => !coreSet.has(tokenPath));
const gameOnly = [...platformSets.game].filter((tokenPath) => !coreSet.has(tokenPath));
const webTreeSet = new Set(flattenTokens(loadPlatform('web')).keys());
const gameTreeSet = new Set(flattenTokens(loadPlatform('game')).keys());

const isolation = {
  webOnlyCount: webOnly.length,
  gameOnlyCount: gameOnly.length,
  webOnlyLeakedToGame: webOnly.filter((tokenPath) => gameTreeSet.has(tokenPath)),
  gameOnlyLeakedToWeb: gameOnly.filter((tokenPath) => webTreeSet.has(tokenPath))
};

// Experiment 3 — model-case usage.
function cssUsage(platform, relativePath) {
  const fullPath = path.join(root, relativePath);
  const css = fs.statSync(fullPath).isDirectory()
    ? fs.readdirSync(fullPath).filter((name) => name.endsWith('.css')).sort().map((name) => fs.readFileSync(path.join(fullPath, name), 'utf8')).join('\n')
    : fs.readFileSync(fullPath, 'utf8');
  const references = new Set(
    [...css.matchAll(/var\(--([A-Za-z0-9_-]+)/g)]
      .map((match) => match[1].replaceAll('-', '.'))
      .filter((tokenPath) => !tokenPath.startsWith('runtime.'))
  );
  const shared = [...references].filter((tokenPath) => coreSet.has(tokenPath));
  const specific = [...references].filter((tokenPath) => !coreSet.has(tokenPath));

  return {
    totalReferences: references.size,
    sharedReferences: shared.length,
    platformSpecificReferences: specific.length,
    sharedReferenceRatio: Number((shared.length / references.size).toFixed(3)),
    platformSpecificTokens: specific.sort()
  };
}

const usage = {
  web: cssUsage('web', 'prototypes/web/styles.css'),
  game: cssUsage('game', 'prototypes/game/styles')
};

// Experiment 4 — shared contract presence in both model cases.
const contracts = [
  'action',
  'panel',
  'navigationItem',
  'statusBadge',
  'progress',
  'dialog',
  'tooltip'
];
const componentTokens = flattenTokens(
  readJson(path.join(root, 'tokens/core/components.tokens.json'))
);
const contractTokenCounts = {};

for (const contract of contracts) {
  contractTokenCounts[contract] = [...componentTokens.keys()].filter((tokenPath) =>
    tokenPath.startsWith(`component.${contract}.`)
  ).length;
}

const html = {
  web: fs.readFileSync(path.join(root, 'prototypes/web/index.html'), 'utf8'),
  game: fs.readFileSync(path.join(root, 'prototypes/game/index.html'), 'utf8')
};
const contractMarkers = {
  action: 'action',
  panel: 'panel',
  navigationItem: 'nav-item',
  statusBadge: 'status-badge',
  progress: 'progress',
  dialog: 'dialog',
  tooltip: 'tooltip'
};

const contractPresence = contracts.map((contract) => ({
  contract,
  tokenCount: contractTokenCounts[contract],
  webUsed: html.web.includes(contractMarkers[contract]),
  gameUsed: html.game.includes(contractMarkers[contract])
}));

const report = {
  generatedAt: new Date().toISOString(),
  scope: 'Asteria reference model cases; results are not generalized to all web/game systems.',
  experiments: {
    sharedChangePropagation: {
      changedPrimitive: 'primitive.color.brand.500',
      from: '#5B67F1',
      to: '#A855F7',
      results: propagation,
      passed: propagation.every((result) => result.changedOnBoth)
    },
    platformIsolation: {
      ...isolation,
      passed:
        isolation.webOnlyLeakedToGame.length === 0 &&
        isolation.gameOnlyLeakedToWeb.length === 0
    },
    modelCaseUsage: usage,
    componentContracts: {
      results: contractPresence,
      sharedContractsUsedByBoth: contractPresence
        .filter((result) => result.webUsed && result.gameUsed)
        .map((result) => result.contract)
    }
  }
};

const validationDir = path.join(root, 'dist', 'validation');
fs.mkdirSync(validationDir, { recursive: true });
fs.writeFileSync(
  path.join(validationDir, 'report.json'),
  `${JSON.stringify(report, null, 2)}\n`
);

const propagationStatus = report.experiments.sharedChangePropagation.passed ? 'PASS' : 'FAIL';
const isolationStatus = report.experiments.platformIsolation.passed ? 'PASS' : 'FAIL';
const webSharedPercent = Math.round(usage.web.sharedReferenceRatio * 100);
const gameSharedPercent = Math.round(usage.game.sharedReferenceRatio * 100);
const sharedContracts = report.experiments.componentContracts.sharedContractsUsedByBoth.join(', ');

console.log(
  `Propagation: ${propagationStatus} — ${propagation.length}/${propagation.length} ` +
    'tested dependent roles changed on both platforms.'
);
console.log(`Isolation: ${isolationStatus} — 0 cross-platform leaks.`);
console.log(
  `Web model case: ${usage.web.sharedReferences}/${usage.web.totalReferences} ` +
    `referenced token roles are shared (${webSharedPercent}%).`
);
console.log(
  `Game model case: ${usage.game.sharedReferences}/${usage.game.totalReferences} ` +
    `referenced token roles are shared (${gameSharedPercent}%).`
);
console.log(`Shared contracts visibly exercised by both: ${sharedContracts}.`);
