import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const en = read('locales/en.json');
const cs = read('locales/cs.json');
const enKeys = Object.keys(en.strings || {}).sort();
const csKeys = Object.keys(cs.strings || {}).sort();
const missingCs = enKeys.filter(k => !(k in (cs.strings || {})));
const missingEn = csKeys.filter(k => !(k in (en.strings || {})));
if (missingCs.length || missingEn.length) {
  console.error('Localization key parity: FAIL');
  for (const key of missingCs) console.error(`  missing CS: ${key}`);
  for (const key of missingEn) console.error(`  missing EN: ${key}`);
  process.exit(1);
}
const required = ['Home','Settings','Inventory','Quest Log','Continue','Language','Create account','Track quest'];
const untranslated = required.filter(k => !cs.strings[k] || cs.strings[k] === k);
if (untranslated.length) {
  console.error('Czech localization smoke test: FAIL');
  for (const key of untranslated) console.error(`  not translated: ${key}`);
  process.exit(1);
}
const browserFiles = ['demo/index.html','prototypes/web/index.html','prototypes/game/index.html'];
for (const file of browserFiles) {
  const source = fs.readFileSync(path.join(root,file),'utf8');
  if (!source.includes('data-locale="en"') || !source.includes('data-locale="cs"')) {
    console.error(`Language switch markup: FAIL — ${file}`);
    process.exit(1);
  }
}
for (const file of ['godot-demo/localization.gd','godot-demo/locales/en.json','godot-demo/locales/cs.json']) {
  if (!fs.existsSync(path.join(root,file))) {
    console.error(`Godot localization: FAIL — missing ${file}`);
    process.exit(1);
  }
}
console.log(`Localization: PASS — ${enKeys.length} EN/CS strings with matching keys`);
console.log('Browser language switches: PASS — launcher, web and game model cases');
console.log('Godot localization resources: PASS — EN/CS locale files and runtime localizer present');
