# Cross-runtime comparison: Browser Game UI vs Godot

The browser game prototype and the Godot runtime are intentionally **not pixel-identical**. Their purpose is to show that the same generated game token output and the same semantic/component decisions can be realized through different presentation technologies.

Both runtimes expose a **Design system trace** screen with three deliberately comparable reference points:

| Reference point | Shared / platform role | Token paths shown | Browser realization | Godot realization |
|---|---|---|---|---|
| Action | shared component contract + game selected/focus extension | `component.action.background.default`, `component.action.radius`, `game.focus.controller.ringColor` | HTML `button` styled by generated CSS variables | native Godot `Button` with theme overrides |
| InventorySlot | game-only component that reuses shared surface/border semantics | `component.inventorySlot.background`, `component.inventorySlot.border.selected` | HTML inventory slot | native Godot `Button` styled as an inventory slot |
| Critical HUD | shared danger meaning + game-only motion override | `game.hud.critical.color`, `game.hud.critical.pulseDuration`, `game.hud.critical.pulseScale` | CSS progress/animation | Godot `ProgressBar` + Tween |

The comparison is therefore based on **semantic equivalence and token provenance**, not on pixel identity. This directly supports the architecture principle used in the thesis: `shared meaning ≠ identical platform implementation`.
