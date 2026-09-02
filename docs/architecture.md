# Reference architecture

## Core idea

The design system uses a shared, platform-neutral semantic layer and two platform adapters. The common layer contains only meanings that can reasonably be reused across web and game UI. Web-only and game-only concepts are not forced into the shared core.

```text
Primitive values
      ↓
Shared semantic core
      ↓
Shared component contracts
      ↓
 ┌────┴────┐
Web adapter Game adapter
    ↓           ↓
CSS/DOM     Game config/UI
```

## Layers

1. **Primitive layer** — raw palette, spacing, size, typography, motion and opacity scales.
2. **Semantic layer** — platform-neutral roles such as `semantic.color.text.primary` or `semantic.color.status.danger`.
3. **Component-contract layer** — shared semantic requirements of Action, Panel, Navigation Item, Status Badge, Progress, Dialog and Tooltip. It does not imply shared source code.
4. **Platform adapters** — add platform-only concepts and may override selected semantic roles without changing the shared contract.
5. **Generated representations** — CSS/JSON outputs for the browser model cases and resolved JSON consumed by the Godot game UI.

## Why this is the thesis contribution

The known token mechanisms are not presented as novel. The contribution of this reference implementation is the selected boundary between shared and platform-specific semantics, the adapter rules, the component contracts, the mapping between environments, and the evaluation of how much can be reused without suppressing platform-specific behavior.


## Localization is orthogonal to the token architecture

The reference implementation includes shared EN/CZ locale dictionaries (`locales/en.json`, `locales/cs.json`) for the model cases. They are deliberately kept outside the DTCG token tree: translatable content is not a design token. Browser model cases read the same locale resources and the build/sync step copies them into the Godot demonstration. This shows shared product content without conflating localization with visual design decisions.
