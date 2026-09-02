# Godot adapter

`DesignTokens.gd` is the small platform-boundary adapter used by the runnable project in `godot-demo/`.

It loads the generated resolved token tree and converts two representations that are relevant for the demo:

- token color objects containing `hex` -> Godot `Color`;
- DTCG dimension/duration objects containing `value` + `unit` -> numeric engine values (milliseconds are converted to seconds).

The runnable integration is intentionally kept outside this folder in `godot-demo/` so it can be imported directly in Godot Project Manager.
