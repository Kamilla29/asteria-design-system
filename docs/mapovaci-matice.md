# Mapovací matice shared → web / game

Tato matice zachycuje reprezentativní výřez architektury. Úplné machine-readable hodnoty jsou v `tokens/` a vygenerované reprezentace v `dist/`.

| Sdílená role | Component contract | Web použití | Game použití | Typ adaptace |
|---|---|---|---|---|
| `semantic.color.action.primary.base` | `component.action.background.default` | primární CTA/button | Continue / Equip action | sdílená hodnota |
| `semantic.color.text.primary` | Panel / Action / Navigation | hlavní text | hlavní text game menu | game override |
| `semantic.color.background.surface` | `component.panel.background` | cards / form surface | inventory / quest panel | game override |
| `semantic.color.status.danger` | Status / Progress | error / danger state | HUD critical state | shared semantic + game behavior extension |
| `semantic.color.status.warning` | `component.statusBadge.*` | warning badge | rare relic status | sdílená hodnota |
| `semantic.spacing.component.md` | Action / Panel | padding | padding | sdílená hodnota |
| `semantic.radius.control` | Action | web button radius | game action radius | sdílená hodnota |
| `component.navigationItem.indicator` | Navigation Item | active nav | active game nav | shared contract, odlišná prezentace |
| `component.progress.value` | Progress | world/quest progress | quest/HUD progress | sdílená hodnota |
| — | Input | form input/focus | — | web-only addition |
| — | Inventory Slot | — | selected/locked inventory | game-only addition |
| — | HUD Indicator | — | energy/health/objective | game-only addition |
| — | controller focus | — | selected state | game-only interaction |
| — | responsive breakpoints | layout | responsive web | — | web-only environment |

## Pravidla mapování

1. Pokud je význam prvku stejný v obou prostředích, token má zůstat v `shared semantic core`.
2. Pokud je stejný význam, ale platforma vyžaduje jiné vizuální vyjádření, platform adapter smí hodnotu overrideovat bez změny názvu semantické role.
3. Pokud význam existuje pouze v jedné platformě, přidává se jako platform-specific token a nevstupuje do shared core.
4. Component contract popisuje očekávané role a stavy, nikoli sdílený implementační kód.
5. Platform adapter nesmí zavádět závislost na tokenech druhé platformy.
