# Godot runtime source

The native Godot demo is organized into ordered source fragments grouped by responsibility. `scripts/assemble-godot-main.mjs` concatenates these fragments into `godot-demo/main.gd` before validation or local runtime use.

This keeps the large reference UI script navigable while preserving a single Godot scene script at runtime. Run `npm run godot:prepare` before importing the demo into Godot.
