# Component contracts

The shared layer defines **semantic contracts**, not reusable source code. A contract describes which design roles a component needs; each platform chooses its own implementation.

| Contract | Shared roles | Web realization | Game realization |
|---|---|---|---|
| Action | background, text, height, radius, padding, disabled/pressed | HTML `button`, adds hover/focus-visible | game control, adds controller-selected state |
| Panel | background, border, radius, padding | content/card container | menu/HUD container |
| Navigation Item | default/active text, indicator, gap | page navigation | menu/screen navigation |
| Status Badge | success/warning/danger/info, radius | content status | rarity/mission status |
| Progress | track, value, danger, radius | completion/progress | health, energy, quest progress |
| Dialog | elevated background, text, radius, padding | modal/dialog | character dialogue panel |
| Tooltip | background, text, radius, padding | pointer/focus help | contextual game help |

Platform-only components remain outside the shared contract set: `Input` and `Link` in the web adapter; `Inventory Slot` and `HUD Indicator` in the game adapter.
