# Validation plan

The project is evaluated with reproducible technical checks; no user-study data are claimed.

1. **Alias integrity** — every alias resolves and no circular references exist.
2. **Shared-change propagation** — changing one shared primitive (for example `primitive.color.brand.500`) must affect both generated platform outputs where the corresponding semantic role is shared.
3. **Platform isolation** — changing a game-only token or game semantic override must not change the web output.
4. **Component-contract reuse** — shared components must be expressible from the same semantic contract while allowing different platform implementations.
5. **Reuse/override metrics** — count shared core tokens, platform-specific additions and shared-token overrides. These values describe the two model cases only; they are not claimed as universal industry ratios.
6. **Model-case validation** — apply the system to selected web and game screens and document where shared semantics are sufficient and where a platform extension is necessary.
