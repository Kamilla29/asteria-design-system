# Asteria Cross-Platform Design System

A reference implementation of a **shared design-token architecture for web and game user interfaces**. The project explores how one semantic design core can be transformed into platform-specific representations without forcing web and game UI to look or behave identically.

![Asteria web companion portal](assets/screenshots/web-home.png)

## What this project demonstrates

- A layered design-token model: **primitives → semantics → component contracts → platform adapters**
- DTCG-style JSON token sources with aliases and validation
- Platform-specific web and game token outputs generated from a shared semantic core
- Interactive browser model cases for both a web companion portal and a game-oriented UI
- A native **Godot 4** runtime adapter consuming the generated game token representation
- Shared EN/CZ localization kept intentionally separate from visual design tokens
- Automated architecture, token, localization and integration checks
- Continuous integration with GitHub Actions

## Architecture

```text
Primitive values
      ↓
Shared semantic core
      ↓
Shared component contracts
      ↓
 ┌────┴─────────┐
Web adapter   Game adapter
    ↓              ↓
CSS / JSON     JSON / Godot
    ↓              ↓
Web UI         Game UI
```

The central design decision is the boundary between **shared semantic meaning** and **platform-specific representation**. Web-only and game-only interaction concepts stay inside their respective adapters instead of being forced into the common layer.

## Tech stack

- JavaScript / Node.js
- HTML5 / CSS3
- JSON design tokens
- DTCG-style token structure
- Godot 4 / GDScript
- GitHub Actions

The current reference implementation intentionally has no external npm runtime dependencies. Token resolution, transformation and validation scripts are implemented directly in Node.js so the pipeline remains transparent and easy to inspect.

## Repository structure

```text
tokens/
├── core/                 # primitive, semantic and component tokens
└── platforms/            # web/game adapter tokens

scripts/                  # build, validation, metrics and integration checks
prototypes/
├── web/                  # browser web model case
└── game/                 # browser game model case

godot-demo/               # native Godot 4 runtime demo
adapters/godot/           # engine adapter example
locales/                  # shared EN/CZ interface text
dist/                     # generated platform outputs
docs/                     # architecture and validation documentation
```

## Quick start

Requirements: **Node.js 20+**.

```bash
npm run check
npm run demo
```

Open:

```text
http://127.0.0.1:4173
```

`npm run check` runs the complete verification pipeline before the demo is started.

## Verification pipeline

```text
Token validation
      ↓
Token build
      ↓
Localization checks
      ↓
Godot token synchronization
      ↓
Model-case audit
      ↓
Browser game checks
      ↓
Architecture validation
      ↓
Godot integration checks
      ↓
Reuse metrics
```

The current baseline verifies:

- alias resolution and cycle detection for web and game token graphs;
- shared-token propagation across both adapters;
- isolation of platform-specific additions and overrides;
- shared component contracts used by both model cases;
- browser-game interaction and state safeguards;
- EN/CZ localization consistency;
- Godot token-path and project-structure integration.

## Current validation snapshot

At the current model-case scope:

- **122** tokens belong to the shared core
- Web adds **18** platform-specific roles
- Game adds **18** platform-specific roles and overrides **8** shared semantic roles
- Web model case directly references **33/45 shared roles (73%)**
- Game model case directly references **30/45 shared roles (67%)**

These percentages describe the included model cases only; they are not presented as universal reuse ratios for all web/game products.

## Model cases

### Web companion portal

The web model case contains home/status, compendium/catalog, character detail and registration views. It demonstrates pointer and keyboard interaction, responsive presentation, web-only controls and generated CSS token consumption.

### Browser game UI

The game-oriented browser model contains title/menu, gameplay HUD, inventory, quest log, dialog, pause/settings and contextual interaction states. Its structure intentionally differs from the web portal while consuming the same shared design semantics.

### Godot runtime

The Godot 4 demo consumes generated game JSON through an engine-native adapter and reproduces the important semantic reference points using native Godot controls. It also includes runtime settings, keyboard/gamepad-oriented focus behavior and contextual gameplay interaction.

## Design-system trace

Both game runtimes include a comparison trace for three reference points:

1. shared `Action` semantics;
2. game-only `InventorySlot` semantics;
3. a critical HUD platform override.

This makes token provenance visible and demonstrates the project's core principle:

> **shared meaning does not require identical implementation**

## Localization

English and Czech locale dictionaries are shared by the model cases but remain outside the token tree. This is deliberate: visual decisions belong in design tokens, while translated interface content belongs in localization resources.

## Useful commands

```bash
npm run validate
npm run build
npm run check:locales
npm run audit:model-cases
npm run validate:architecture
npm run check:game-prototype
npm run godot:check
npm run metrics
npm run check
npm run demo
```

## Documentation

Detailed architecture and evaluation notes are available in `docs/`, including:

- `architecture.md`
- `component-contracts.md`
- `runtime-comparison.md`
- `model-cases.md`
- `validation-plan.md`
- `validation-results.md`

Some documentation remains in Czech because the project originated as the practical implementation for my bachelor's thesis on a web/game design system based on design tokens.

## Project origin and evolution

The first complete version of this project was developed as the practical part of my bachelor's thesis. The repository is now maintained as an independent engineering portfolio project, with the academic implementation serving as a tested baseline rather than being presented as commercial experience.

Planned portfolio evolution includes a React/TypeScript consumer layer, a reusable component package and additional frontend component testing while preserving the existing token and Godot pipeline.

---

**Kamilla Kuanysheva**  
Frontend & QA-focused JavaScript/TypeScript developer
