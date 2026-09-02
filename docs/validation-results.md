# Validation results

These results describe the **Asteria reference model cases only**. They are evidence about the proposed architecture in the controlled prototype, not universal percentages for all web and game interfaces.

## 1. Shared-change propagation — PASS

The experiment temporarily changes `primitive.color.brand.500` from `#5B67F1` to `#A855F7` in memory and resolves both platform trees again. Four dependent shared roles are checked:

- `semantic.color.action.primary.base`
- `component.action.background.default`
- `component.navigationItem.indicator`
- `component.progress.value`

All four change in both web and game outputs without editing either platform adapter. This demonstrates centralized propagation through aliases for the tested dependency chain.

## 2. Platform isolation — PASS

The web adapter contains 18 platform additions and the game adapter contains 18 platform additions. The validation checks that web-only paths are absent from the game tree and game-only paths are absent from the web tree. No cross-platform leaks were found.

## 3. Token-role usage in model cases

| Model case | Token roles referenced in CSS | Shared-core roles | Platform-specific roles | Shared ratio |
|---|---:|---:|---:|---:|
| Web portal | 45 | 33 | 12 | 73% |
| Game UI | 45 | 30 | 15 | 67% |

The figures describe **direct token references in the prototype stylesheets**, not the total number of available tokens and not an industry-wide reuse rate.

The web-specific references are concentrated in form controls, links, hover and focus-visible behavior. The game-specific references are concentrated in controller focus, selected inventory slots, HUD indicators, locked state and critical feedback.

## 4. Shared component contracts

Five shared contracts are exercised in both model cases:

- Action
- Panel
- Navigation Item
- Status Badge
- Progress

Dialog and Tooltip remain defined in the shared contract layer but are not counted as cross-platform reuse evidence unless the same contract is exercised by both audited model cases.

## 5. Interactive game-model structure — PASS

The browser game model uses a game-oriented state model rather than a dashboard-like preview. A dependency-free structural check validates JavaScript syntax plus the presence of nine distinct UI states and the interaction hooks for inventory selection/equip, quest selection/tracking, dialog progression and settings controls.

This check proves the required interaction structure is present in the source. Final visual/manual interaction remains part of local acceptance testing because the repository intentionally does not add a browser-automation dependency.

## 6. Godot integration

The repository includes a runnable Godot 4 project under `godot-demo/`. The root build process synchronizes `dist/game/tokens.json` to `godot-demo/design-system/tokens.json`. The static integration check validates the project/scene references, the interactive-state markers and every token path required by the scene.

Current automated result:

- 32 runtime token paths referenced by the Godot scene: **PASS**;
- generated game token file synchronized into the Godot project: **PASS**;
- `project.godot` main-scene reference and scene-to-script reference: **PASS**;
- interactive menu/gameplay/inventory/quest/dialog/settings state structure: **PASS**.

The scene was manually launched and visually checked in Godot 4.7.2 during the final acceptance pass. The automated checks below remain complementary: they verify token-path resolution, project structure and required interaction wiring without replacing the manual runtime check.

## Interpretation

The prototype supports the design premise that useful cross-platform reuse occurs at a semantic/contract level rather than through identical implementations. At the same time, approximately one third of direct references in the game model case remain platform-specific, and the interaction structure now visibly differs from the web portal. This illustrates why a platform adapter is necessary instead of forcing both UI environments into one shared presentation model.


## Cross-runtime comparison trace

The browser game prototype and Godot runtime expose the same three reference points (Action, InventorySlot and critical HUD) together with their token paths. This comparison is intended to validate semantic/token provenance across different presentation technologies rather than pixel identity. Static safeguards confirm that the reference points are present in both implementations; final visual/runtime confirmation is performed in the local Godot run.
