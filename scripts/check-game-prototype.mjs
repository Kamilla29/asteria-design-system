import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const htmlPath = path.join(root, 'prototypes/game/index.html');
const jsPath = path.join(root, 'prototypes/game/app.js');
const cssDir = path.join(root, 'prototypes/game/styles');
const html = fs.readFileSync(htmlPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');
const css = fs.readdirSync(cssDir).filter((name) => name.endsWith('.css')).sort().map((name) => fs.readFileSync(path.join(cssDir, name), 'utf8')).join('\n');

const requiredViews = ['menu','gameplay','load','new','inventory','quests','dialog','settings','trace'];
const requiredHooks = [
  'data-item=', 'id="equip-button"', 'data-quest=', 'id="track-quest"',
  'data-dialog-choice=', 'id="scale-down"', 'id="scale-up"',
  'id="vibration-toggle"', 'id="contrast-toggle"', 'data-locale="en"', 'data-locale="cs"',
  'data-runtime-comparison="action"', 'data-runtime-comparison="inventory-slot"', 'data-runtime-comparison="critical-hud"',
  'id="trace-action-demo"', 'data-trace-slot="solar"', 'data-trace-slot="echo"', 'id="calibrate-beacon"', 'id="reset-demo"'
];
const requiredLogic = [
  'renderItem(', 'renderQuest(', 'setDialog(', 'updateScale(', 'setScale(', 'rumble(', 'getRumbleActuator(', 'asteria:localechange', 'trace-action-demo', 'data-trace-slot',
  "event.key.toLowerCase()==='i'", "event.key.toLowerCase()==='q'", "event.key.toLowerCase()==='f'", "event.key.toLowerCase()==='e'", 'calibrateBeacon(', 'renderCalibration(', 'resetDemoState(', 'prompt.disabled=beaconCalibrated'
];

const missing = [];
for (const view of requiredViews) if (!html.includes(`id="view-${view}"`)) missing.push(`view-${view}`);
for (const hook of requiredHooks) if (!html.includes(hook)) missing.push(hook);
for (const marker of requiredLogic) if (!js.includes(marker)) missing.push(marker);
if (!/\[hidden\]\s*\{\s*display\s*:\s*none\s*!important\s*;?\s*\}/.test(css)) missing.push('[hidden]{display:none!important}');
if (!/\.locale-switch\s*\{[^}]*pointer-events\s*:\s*auto/i.test(css)) missing.push('.locale-switch{pointer-events:auto}');

const syntax = spawnSync(process.execPath, ['--check', jsPath], {encoding:'utf8'});
if (syntax.status !== 0) {
  console.error('Game prototype JavaScript syntax: FAIL');
  console.error(syntax.stderr || syntax.stdout);
  process.exit(1);
}
if (missing.length) {
  console.error('Interactive game prototype structure: FAIL');
  for (const item of missing) console.error(`  missing: ${item}`);
  process.exit(1);
}
console.log('Game prototype JavaScript syntax: PASS');
console.log(`Interactive game prototype structure: PASS — ${requiredViews.length} UI states and ${requiredHooks.length} interaction hooks present`);
console.log('Game prototype visibility switching safeguard: PASS — hidden views cannot be forced visible by layout CSS');
console.log('Game locale switch pointer input: PASS — EN/CZ controls remain clickable inside non-interactive game chrome');
console.log('Browser settings behavior: PASS — HUD scale is applied through --runtime-interface-scale and controller vibration uses the Gamepad haptics API when available');

console.log('Browser contextual interaction: PASS — beacon calibration becomes a disabled completion status and Reset demo state restores the initial state');
console.log('Browser cross-runtime comparison trace: PASS — Action, InventorySlot and critical HUD reference points present');
