# Metodika ověření navržené architektury

Ověření je navrženo jako technická validace referenční implementace, nikoli jako uživatelská studie. Výsledky proto vypovídají o strukturálních vlastnostech prototypu a o dvou modelových případech, nikoli o všech design systémech nebo všech webových a herních produktech.

## V1 — Integrita tokenového grafu

**Otázka:** Lze všechny aliases vyhodnotit bez chyb a cyklů?

**Postup:** parser načte core a platformní soubor, sloučí strom, rekurzivně vyhodnotí aliases a detekuje unresolved/circular reference.

**Kritérium úspěchu:** 0 unresolved aliases, 0 cycles.

## V2 — Shared-change propagation

**Otázka:** Propaguje se změna jedné primitive hodnoty přes sdílenou sémantiku do obou platformních výstupů?

**Postup:** `primitive.color.brand.500` se experimentálně změní z `#5B67F1` na `#A855F7`; následně se znovu vyhodnotí web i game token graph.

Kontrolované závislé role:
- `semantic.color.action.primary.base`,
- `component.action.background.default`,
- `component.navigationItem.indicator`,
- `component.progress.value`.

**Kritérium úspěchu:** všechny čtyři role se změní v obou platformních reprezentacích bez zásahu do adapter files.

## V3 — Platform isolation

**Otázka:** Zůstávají platform-specific additions izolované?

**Postup:** porovnají se cesty zavedené pouze `web.tokens.json` a `game.tokens.json` s výsledným stromem opačné platformy.

**Kritérium úspěchu:** 0 web-only cest v game tree a 0 game-only cest ve web tree.

## V4 — Reuse component contracts

**Otázka:** Jsou stejné sdílené component contracts skutečně použity v obou modelových rozhraních?

**Kontrolované kontrakty:** Action, Panel, Navigation Item, Status Badge, Progress.

**Kritérium úspěchu:** každý z pěti kontraktů je doložitelný v obou model cases.

## V5 — Model-case token usage

**Otázka:** Jaký podíl přímo referencovaných token roles v každém model case pochází ze shared core a jaký z platform-specific vrstvy?

**Metoda:** statická analýza CSS `var(--token-name)` references a klasifikace proti množině core token paths.

**Interpretace:** procenta charakterizují pouze modelové příklady Asteria a nelze je generalizovat na celé odvětví.

## V6 — Platform override

**Otázka:** Lze zachovat stejnou semantickou roli a současně změnit její konkrétní hodnotu pro game context?

**Příklad:** `semantic.color.background.canvas` a text/background roles jsou ve game adapteru overrideovány pro tmavé rozhraní, aniž by se měnil component contract.

**Kritérium úspěchu:** game preview používá odlišné resolved hodnoty, zatímco web output zůstává nezměněný.
