# Godot 4 interactive integration

This folder is a small runnable Godot 4 project demonstrating the game-side platform adapter with native Godot Controls.

## What it demonstrates

At runtime the project reads:

`res://design-system/tokens.json`

The file is synchronized from the generated `dist/game/tokens.json` output by the root build pipeline. The DTCG source remains canonical.

The current Godot integration goes beyond a technical token inspector and presents a game-oriented interaction model:

- full-screen title / main menu;
- simulated gameplay state with contextual objective and HUD;
- native Godot Action buttons with controller focus;
- Inventory with selectable/equippable game-only InventorySlot elements;
- Quest Log and tracked HUD objective;
- Dialog state;
- Pause/Settings state with a small runtime-token readout;
- critical HUD feedback whose color, duration and scale come from `game.hud.critical.*`;
- runtime EN/CZ language switching using synchronized locale dictionaries.
- a **Design system trace** screen that mirrors the browser game demo's Action, InventorySlot and critical-HUD reference points with native Godot Controls;

The critical pulse is applied to the critical progress indicator rather than scaling an entire information panel.

## Prepare the data

From the repository root:

```bash
npm run godot:prepare
```

This rebuilds token outputs, synchronizes game JSON into this project and checks all token paths used by the scene.

## Run in Godot

1. Open Godot 4.
2. In Project Manager choose **Import**.
3. Select `godot-demo/project.godot`.
4. Open the project and press **Run Project**.
5. Test title-screen buttons, Inventory, Quest Log, Dialog, Settings and `Esc` navigation.
6. Use the **EN / CZ** control in the upper-right corner and verify that the current UI state is rebuilt in the selected language.

No external Godot add-ons are required.

## Scope

This remains a reference UI integration, not a complete game. Its purpose is to demonstrate that shared design decisions can be loaded into an actual game engine while game-specific interaction and presentation remain in the game adapter/application layer.


## Keyboard and controller interaction

The runtime scene provides game-oriented input in addition to mouse clicks:

- `I` opens/closes Inventory.
- `Q` opens/closes Quest Log.
- `F` opens/closes Dialog/Talk.
- `Esc` opens Pause/Settings from gameplay and closes the current overlay back to gameplay.
- Arrow keys and Godot's default D-pad UI actions move focus.
- `W`, `A`, `S`, `D` are added at runtime as alternative UI focus navigation.
- `Enter` and `Space` activate the currently focused button.

These controls are intentionally part of the game adapter demonstration: the shared component roles remain reusable while game-specific keyboard/controller interaction is handled by the Godot presentation layer.
