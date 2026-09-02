# Lore Annotations

Canonical lore citations and Dual-Lens discrepancy notes linked to unit slugs.

Each file is a JSON payload validated against `LoreAnnotationSchema` in `packages/schemas/src/lore-annotation.schema.ts`.

## Naming convention

```
<unit-slug>-<category>.json
```

Example: `necron-warrior-armor-durability.json`

## Categories

- `velocity_discrepancy` — lore vs engine speed compression
- `armor_durability` — protection profile differences
- `transhuman_dread` — psychological terror radius
- `weapon_potency` — lethality and range compression
- `combat_longevity` — stamina and endurance
- `warp_corruption` — Chaos/warp-infused traits

## Validation

```bash
npm run validate:data
```
