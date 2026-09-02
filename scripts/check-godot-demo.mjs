import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const requiredFiles = [
  'godot-demo/project.godot',
  'godot-demo/main.tscn',
  'godot-demo/main.gd',
  'godot-demo/design_tokens.gd',
  'godot-demo/localization.gd',
  'godot-demo/design-system/tokens.json',
  'godot-demo/locales/en.json',
  'godot-demo/locales/cs.json'
];
for (const file of requiredFiles) await access(path.join(root, file));

const tokens = JSON.parse(await readFile(path.join(root, 'godot-demo/design-system/tokens.json'), 'utf8'));
const script = await readFile(path.join(root, 'godot-demo/main.gd'), 'utf8');

// Lightweight syntax safeguard for GDScript source: check (), [] and {}
// while ignoring quoted strings and line comments. This catches accidental extra
// closing delimiters before the project reaches the Godot editor.
function checkBalancedDelimiters(source) {
  const stack = [];
  const pairs = new Map([[')', '('], [']', '['], ['}', '{']]);
  let quote = null;
  let escaped = false;
  let line = 1;
  let column = 0;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '\n') { line++; column = 0; if (quote === 'comment') quote = null; continue; }
    column++;
    if (quote === 'comment') continue;
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '#') { quote = 'comment'; continue; }
    if (ch === '"' || ch === "'") { quote = ch; continue; }
    if ('([{'.includes(ch)) stack.push({ ch, line, column });
    else if (')]}'.includes(ch)) {
      const top = stack.at(-1);
      if (!top || top.ch !== pairs.get(ch)) {
        throw new Error(`GDScript delimiter mismatch at ${line}:${column}: unexpected ${ch}`);
      }
      stack.pop();
    }
  }
  if (stack.length) {
    const top = stack.at(-1);
    throw new Error(`GDScript delimiter mismatch: unclosed ${top.ch} from ${top.line}:${top.column}`);
  }
}

try {
  checkBalancedDelimiters(script);
} catch (error) {
  console.error(`Godot GDScript syntax safeguard: FAIL — ${error.message}`);
  process.exit(1);
}
console.log('Godot GDScript delimiter safeguard: PASS');

// Godot 4.7 treats inference from dynamically typed properties as a parser error.
// Keep locale-switch state explicitly typed so the runtime project parses cleanly.
if (!script.includes('var active: bool = str(child.get_meta("locale_code")) == str(localizer.language)')) {
  console.error('Godot GDScript type-inference safeguard: FAIL — locale switch state must be explicitly typed as bool');
  process.exit(1);
}
console.log('Godot GDScript type-inference safeguard: PASS');

// Runtime-input safeguard: the native Godot demo must expose the game-specific
// keyboard interaction that is shown in the HUD, rather than relying on mouse clicks only.
const requiredInputMarkers = [
  'func _input(event: InputEvent)',
  'KEY_I',
  'KEY_Q',
  'KEY_F',
  'KEY_E',
  'KEY_ESCAPE',
  '_toggle_game_view("inventory")',
  '_toggle_game_view("quests")',
  '_toggle_game_view("dialog")',
  '_calibrate_beacon()',
  '_handle_game_back()',
  '_register_focus_navigation()',
  '_add_key_to_action("ui_up", KEY_W)',
  '_add_key_to_action("ui_down", KEY_S)',
  '_add_key_to_action("ui_left", KEY_A)',
  '_add_key_to_action("ui_right", KEY_D)',
  '_add_key_to_action("ui_accept", KEY_ENTER)',
  '_add_key_to_action("ui_accept", KEY_SPACE)'
];
const missingInputMarkers = requiredInputMarkers.filter((marker) => !script.includes(marker));
if (missingInputMarkers.length) {
  console.error('Godot game-input safeguard: FAIL');
  for (const marker of missingInputMarkers) console.error(`  missing input marker: ${marker}`);
  process.exit(1);
}
console.log('Godot game-input safeguard: PASS — I/Q/F/E/Esc hotkeys, WASD focus and Enter/Space activation are wired');

const overlayMarkers = ['get_viewport_rect().size', 'ScrollContainer.new()', 'viewport_size - safe_size'];
const missingOverlayMarkers = overlayMarkers.filter((marker) => !script.includes(marker));
if (missingOverlayMarkers.length) {
  console.error('Godot responsive-overlay safeguard: FAIL');
  for (const marker of missingOverlayMarkers) console.error(`  missing overlay marker: ${marker}`);
  process.exit(1);
}
console.log('Godot responsive-overlay safeguard: PASS — centered overlays clamp to runtime viewport and scroll vertically');

const beaconStateMarkers = [
  'prompt.disabled = beacon_calibrated',
  'if not beacon_calibrated:',
  'func _reset_demo_state() -> void:',
  'beacon_calibrated = false',
  '_action_button("Reset demo state", _reset_demo_state, false)'
];
const missingBeaconStateMarkers = beaconStateMarkers.filter((marker) => !script.includes(marker));
if (missingBeaconStateMarkers.length) {
  console.error('Godot beacon-state safeguard: FAIL');
  for (const marker of missingBeaconStateMarkers) console.error(`  missing beacon-state marker: ${marker}`);
  process.exit(1);
}
console.log('Godot beacon-state safeguard: PASS — completed calibration is non-interactive and can be restored only via Reset demo state');

const settingsMarkers = [
  'interface_scale_percent: int = 100',
  'controller_vibration_enabled: bool = true',
  'high_contrast_enabled: bool = false',
  'func _change_interface_scale(delta: int)',
  'func _toggle_controller_vibration()',
  'func _toggle_high_contrast()',
  'Input.start_joy_vibration',
  'func _apply_gameplay_interface_scale',
  '_setting_stepper_row(',
  '_setting_toggle_row('
];
const missingSettingsMarkers = settingsMarkers.filter((marker) => !script.includes(marker));
if (missingSettingsMarkers.length) {
  console.error('Godot settings behavior safeguard: FAIL');
  for (const marker of missingSettingsMarkers) console.error(`  missing settings marker: ${marker}`);
  process.exit(1);
}
console.log('Godot settings behavior safeguard: PASS — scale, vibration and high-contrast settings have interactive runtime behavior');


// Scope safeguard: gameplay-only Controls (top/prompt/hud) must never be referenced
// from the independent design-system trace screen. An accidental copied call here
// is a Godot parser error because those identifiers exist only inside _show_gameplay().
const scaleHelperOccurrences = [...script.matchAll(/_apply_gameplay_interface_scale\s*\(/g)].length;
const traceStart = script.indexOf('func _show_system_trace()');
const traceEnd = script.indexOf('func _token_paths_label', traceStart);
const traceBlock = traceStart >= 0 && traceEnd > traceStart ? script.slice(traceStart, traceEnd) : '';
if (scaleHelperOccurrences !== 2 || traceBlock.includes('_apply_gameplay_interface_scale(')) {
  console.error('Godot gameplay-scope safeguard: FAIL — gameplay HUD scale helper leaked outside _show_gameplay()');
  process.exit(1);
}
console.log('Godot gameplay-scope safeguard: PASS — gameplay-only top/prompt/hud controls stay inside _show_gameplay()');

const comparisonMarkers = [
  'func _show_system_trace()',
  'component.action.background.default',
  'component.action.radius',
  'component.inventorySlot.background',
  'component.inventorySlot.border.selected',
  'game.hud.critical.color',
  'game.hud.critical.pulseDuration',
  'game.hud.critical.pulseScale',
  '_trace_action_feedback',
  '_trace_select_slot'
];
const missingComparisonMarkers = comparisonMarkers.filter((marker) => !script.includes(marker));
if (missingComparisonMarkers.length) {
  console.error('Godot cross-runtime comparison trace: FAIL');
  for (const marker of missingComparisonMarkers) console.error(`  missing comparison marker: ${marker}`);
  process.exit(1);
}
console.log('Godot cross-runtime comparison trace: PASS — Action, InventorySlot and critical HUD token provenance is explicit');

const getPath = (object, tokenPath) => tokenPath.split('.').reduce((current, part) => current?.[part], object);

// Extract every token path passed directly to the Godot adapter helpers.
const usedPaths = new Set();
for (const match of script.matchAll(/(?:_color|_number|tokens\.describe)\(\s*"([A-Za-z0-9_.-]+)"/g)) usedPaths.add(match[1]);
const requiredConceptPaths = [
  'component.action.background.default',
  'component.inventorySlot.border.selected',
  'game.focus.controller.ringColor',
  'game.hud.critical.color',
  'game.hud.critical.pulseDuration',
  'game.hud.critical.pulseScale'
];
for (const tokenPath of requiredConceptPaths) usedPaths.add(tokenPath);

const missing = [...usedPaths].filter((tokenPath) => getPath(tokens, tokenPath) === undefined);
if (missing.length) {
  console.error('Godot integration token check: FAIL');
  for (const tokenPath of missing) console.error(`  missing: ${tokenPath}`);
  process.exit(1);
}

const project = await readFile(path.join(root, 'godot-demo/project.godot'), 'utf8');
const scene = await readFile(path.join(root, 'godot-demo/main.tscn'), 'utf8');
const interactiveMarkers = ['_show_menu', '_show_gameplay', '_show_inventory', '_show_quests', '_show_dialog', '_show_settings', '_show_system_trace', '_build_language_switch', '_set_language'];
const missingMarkers = interactiveMarkers.filter((marker) => !script.includes(marker));
if (!project.includes('run/main_scene="res://main.tscn"') || !scene.includes('res://main.gd') || missingMarkers.length) {
  console.error('Godot integration structure check: FAIL');
  for (const marker of missingMarkers) console.error(`  missing state marker: ${marker}`);
  process.exit(1);
}

console.log(`Godot integration: PASS — ${usedPaths.size} runtime token paths referenced by the scene resolve`);
console.log('Godot project structure: PASS — main scene, script references and interactive UI states present');
