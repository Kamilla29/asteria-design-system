# Jak spustit projekt lokálně

Projekt nevyžaduje externí npm balíčky. Je potřeba pouze Node.js (doporučeno LTS).

## 1. Rozbalení a kontrola Node.js

Rozbalte archiv, otevřete terminál ve složce projektu a spusťte:

```bash
node --version
npm --version
```

## 2. Kompletní automatická kontrola

```bash
npm run check
```

Příkaz postupně ověří tokeny a aliasy, vygeneruje platformní výstupy, synchronizuje Godot JSON, zkontroluje model-case token references, JavaScript/interaction structure game prototypu, propagation/isolation experimenty, Godot integration structure a metriky.

Očekávaný výsledek obsahuje mimo jiné:

- `aliases resolve; no cycles detected`,
- `0 unresolved`,
- `Interactive game prototype structure: PASS`,
- `Propagation: PASS`,
- `Isolation: PASS`,
- `Godot integration: PASS`.

## 3. Spuštění browser demonstrace

```bash
npm run demo
```

Otevřete:

- launcher: `http://127.0.0.1:4173`
- web: `http://127.0.0.1:4173/prototypes/web/`
- game: `http://127.0.0.1:4173/prototypes/game/`

Server ukončíte `Ctrl+C`.

> Game preview neotvírejte jen dvojklikem přes `file://`; načítá vygenerovaný JSON pomocí `fetch()`.

## 4. Manuální kontrola Web

- Home, Compendium, Character a Register;
- hover/focus-visible;
- Action, Panel, Status a Progress;
- web-specific Input/Link/form behavior.

## 5. Manuální kontrola Game

1. Na title screenu zvolte **Continue** — musí se otevřít gameplay state s HUD.
2. Otevřete **Inventory** — vyberte jiný relic; detail se musí změnit. `Equip` se změní na `Equipped`.
3. Otevřete **Quest Log** — vyberte `Lost Signals` a `Track quest`; po návratu se musí změnit tracked objective v HUD.
4. Otevřete **Talk** — `Ask about the prism` musí změnit repliku dialogu.
5. Otevřete **Pause/Settings** — tlačítka `+/-` mění interface scale; High Contrast mění HUD indicators.
6. Z gameplay state lze otevřít Inventory klávesou `I`, Quest Log klávesou `Q` a vracet se přes `Esc`.

Tato informační architektura je záměrně odlišná od webového portalu: gameplay je základní kontext a ostatní části se otevírají jako herní stavy/overlays.

## 6. Godot integrace

V kořenové složce spusťte:

```bash
npm run godot:prepare
```

Poté v Godot 4 importujte `godot-demo/project.godot` a zvolte **Run Project**.

V Godot demu ověřte:

- Main Menu → Continue → gameplay HUD;
- Inventory selection/equip;
- Quest Log a návrat do gameplay;
- Dialog;
- Settings;
- controller/keyboard focus;
- lokální pulzování critical progress indicatoru;
- text `Runtime token loading succeeded` na title screenu.

Automatizované kontroly nespouštějí editor Godot. Pro finální akceptaci proto otevřete projekt v Godot 4.7.2, spusťte hlavní scénu a ručně ověřte výše uvedené interakce a vizuální stav.

## Přepnutí jazyka EN / CZ

Launcher, webový modelový případ a herní modelový případ obsahují přepínač **EN / CZ**. V prohlížeči se zvolený jazyk ukládá do `localStorage`, takže zůstane zachován při přechodu mezi webovým a herním demem. Godot demo má vlastní runtime přepínač v pravém horním rohu; při změně jazyka znovu sestaví aktuální UI stav z téhož EN/CS slovníku synchronizovaného příkazem `npm run godot:prepare`.

Lokalizační soubory jsou uloženy v `locales/en.json` a `locales/cs.json`. Nejsou součástí design tokenů, protože představují obsah rozhraní, nikoli vizuální designová rozhodnutí.
