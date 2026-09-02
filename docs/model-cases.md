# Model cases

## Product family

Both demonstrations belong to the fictional **Asteria** ecosystem. The name has no architectural meaning; it is only a neutral fictional product family used to create a realistic cross-platform scenario. A web companion portal and an in-game interface can therefore share product identity and semantic design decisions while operating in clearly different interaction contexts.

## Web model case

Screens:
- Home / world status
- Compendium / catalog
- Character detail
- Registration

The web case exercises shared Action, Panel, Navigation, Status Badge and Progress contracts, plus web-only Input/Link/focus-visible/hover behavior. Navigation follows page/view semantics suitable for a companion portal.

## Game model case

Interactive states:
- full-screen Main Menu
- Gameplay state with contextual HUD
- Load Profile / New Expedition
- Inventory overlay
- Quest Log overlay
- Dialog state
- Pause / Settings overlay

The game case no longer uses a permanent dashboard-like side navigation. The gameplay state is the center of the interaction model and Inventory, Quest Log, Dialog and Settings are opened contextually. Inventory items can be selected and equipped; quests can be selected and tracked into the HUD; dialog choices change the conversation state; settings expose game-specific interaction/presentation behavior. Keyboard shortcuts (`I`, `Q`, `Esc`) complement pointer interaction and controller-style focus remains a game-adapter state.

## Why the two cases are intentionally different

The web case emphasizes information pages, form controls, pointer/keyboard focus and responsive presentation. The game case emphasizes full-screen states, overlays, HUD, selection, gamepad-style focus, contextual information and critical feedback. The visual and interaction difference is deliberate evidence for the thesis premise: **shared semantic meaning does not require identical platform implementation**.

## Validation intent

The pair is not intended to prove that every web/game project can reuse the same percentage of tokens. It is a controlled reference case for determining which semantic roles can be shared in this concrete architecture and where platform adapters are necessary.

## Localization layer

Both model cases include an EN/CZ language switch. The localized strings are shared as content resources, not encoded as design tokens. This distinction is deliberate: localization changes interface content, whereas the token architecture controls visual and component design decisions. The Godot integration receives synchronized copies of the same locale dictionaries.
