---
name: statvault-wiki-build
description: >-
  Daily StatVault wiki build-up: research one Warhammer 40k topic, write
  lore-grounded unit/weapon/lore JSON, validate against Zod schemas, and open
  a PR. Use when building the StatVault dataslate corpus or running the daily
  wiki automation.
---

# StatVault Wiki Build-Up

Grow the StatVault Dual-Lens dataslate corpus in `data/`. Lore is authoritative; in-engine stats are Dual-Lens estimates until official Warcore extracts exist.

## When to use

- Daily scheduled wiki build-up automation
- Adding a new unit, weapon, or lore annotation to StatVault
- Expanding coverage for an empty faction or missing role

## Core rules

1. **Lore is authoritative.** Every `loreStats` and `loreDescriptor` field must cite a real source (Black Library, Codex, Imperial Armor, Uplifting Primer). Paraphrase only — no long novel excerpts.
2. **Do not invent Warcore numbers.** `engineStats` and `engineDamage` are Dual-Lens estimates derived from lore via compression ratios documented in `DOCS/DUAL_LENS_SPEC.md`. Label them as estimates in the PR body.
3. **One cluster per run:** exactly 1 unit + 1 primary weapon + 1 lore annotation.
4. **Never merge.** Open a PR to `main` and stop. Human review is the gate.
5. **Do not duplicate.** Check `data/COVERAGE.md` and existing slugs before writing.
6. **Do not fabricate citations.** If a page number or ISBN cannot be verified, open the PR anyway and flag it for human review.

## Workflow

### Step 1 — Inventory

Read:
- `data/COVERAGE.md` — backlog and priority queue
- `data/units/*.json` — existing unit slugs
- `data/weapons/*.json` — existing weapon slugs
- `data/lore/*.json` — existing lore annotations
- `public/models/*.glb` — available 3D assets to link

### Step 2 — Pick next topic

Priority order:
1. **Empty factions:** Necrons → Aeldari → Tyranids → T'au
2. **Missing roles:** vehicles, heavy_support, fast_attack, monstrous_creature
3. **Existing faction depth:** additional units for covered factions

Prefer topics that already have a matching `public/models/*.glb`. First recommended topic: **Necron Warrior** (`public/models/necron-warrior.glb`).

Skip any slug already listed in `data/COVERAGE.md` under "Existing entries".

### Step 3 — Research lore

Use web search and canonical references. Acceptable sources:
- Black Library novels and anthologies
- Games Workshop Codexes and Imperial Armor volumes
- The Imperial Infantryman's Uplifting Primer
- Official GW datasheets (for lore context, not TW stats)

Record for each stat:
- The value and unit
- Source title, author, publisher, year, chapter/page (when verifiable)
- A one-sentence paraphrase supporting the value

### Step 4 — Write JSON payloads

Schemas live in `packages/schemas/src/`. The live schemas are stricter than CONTRIBUTING snippets — always match the source files.

#### Unit (`data/units/<slug>.json`)

Required fields per `UnitProfileSchema`:
- `id`: new UUID v4
- `slug`: lowercase kebab-case, unique
- `name`, `faction`, `role`
- `engineStats`: Dual-Lens estimate (see below)
- `loreStats`: lore-grounded values + `citation` + `loreSummary`
- `asset3d`: use existing model path pattern; link to `public/models/` if available
- `upiScores`: compute both `inEngine` and `loreCanon` vectors
- `primaryWeaponSlug`: must match the weapon file slug you create
- `tacticalDescription`: brief RTS tactical note

Optional: `subFaction`, `secondaryWeaponSlug`, `artImagePath`

#### Weapon (`data/weapons/<slug>.json`)

Required fields per `WeaponProfileSchema`:
- `id`: new UUID v4
- `slug`, `name`, `type`, `faction`
- `engineDamage`: Dual-Lens estimate
- `loreDescriptor`: lore-grounded + `citation`

#### Lore annotation (`data/lore/<slug>-<category>.json`)

Required fields per `LoreAnnotationSchema`:
- `id`: new UUID v4
- `unitSlug`: matches the unit slug
- `category`: one of `velocity_discrepancy`, `armor_durability`, `transhuman_dread`, `weapon_potency`, `combat_longevity`, `warp_corruption`
- `citation`: `{ title, author, publisher, publicationYear, pageOrChapter, isbn? }`
- `excerpt`: 20–1500 char paraphrase
- `discrepancyFactor`: lore/engine ratio when applicable (e.g. speed compression ≈ 4.17)
- `submittedAt`: ISO 8601 datetime
- `submittedBy`: `"statvault-wiki-agent"`
- `approvedByModerator`: `false`

### Step 5 — Dual-Lens engine estimate derivation

When official Warcore data is unavailable, derive `engineStats` from `loreStats`:

**Speed compression** (transhuman units):
```
engineSpeedMps ≈ loreSprintSpeedMps / κ
κ ≈ 4.17 for Adeptus Astartes (see DUAL_LENS_SPEC.md)
κ ≈ 1.2–1.5 for baseline humans
κ ≈ 2.0 for Orks
κ ≈ 4.5 for Necrons (living metal, no dread aura)
```

**Reaction time:** engine uses standard RTS tick; do not put lore ms values in `engineStats`.

**Armor:** scale lore RHAe down to 0–300 engine armor rating using peer benchmarks:
- Cadian flak: 30 (35mm RHAe)
- Kasrkin carapace: 60 (90mm RHAe)
- Intercessor power armor: 90 (450mm RHAe)
- Chaos Chosen: 95

**HP / model count:** estimate from faction role and peer units. Document assumptions in PR.

**Weapon engineDamage:** compress lore range (km) to engine range (m) using ~10× compression. Derive DPS from lore kinetic/thermal yield scaled to peer weapons.

### Step 6 — Compute UPI scores

Use formulas from `apps/web/lib/upi-calculator.ts`:

For **inEngine** vector, feed engine stats:
- `hp` = hitPoints, `armor`, `speedMps`, `acceleration`, `massKg` = massKgPerModel
- `burstDmg3s` = primary weapon baseDamage × attacksPerSecond × 3 × modelCount
- `sustainedDps` = baseDamage × attacksPerSecond × modelCount
- `leadership`, `auraRadiusM` = dreadAuraRadiusM (0 for mortals)

For **loreCanon** vector, feed lore stats:
- Use lore sprint speed, lore armor equivalent as armor proxy, lore reaction time does not map directly — use peer-normalized values
- Scale burst/sustained from lore weapon descriptor vs engine weapon

Call `computeUPIScores()` logic or replicate the formulas manually. Round to integers 0–100.

### Step 7 — Validate

```bash
npm run validate:data
```

Fix all schema errors before proceeding. Do not open a PR with failing validation unless the failure is a pre-existing issue (note it explicitly).

### Step 8 — Update coverage

Add the new slugs to `data/COVERAGE.md` under "Existing entries" and remove from "Suggested queue" if applicable.

### Step 9 — Branch, commit, PR

```bash
git checkout -b lore/wiki-YYYY-MM-DD-<unit-slug>
git add data/
git commit -m "lore(<faction>): add <unit-name> dataslate"
git push -u origin HEAD
```

Open PR targeting `main`. **Never merge.**

#### PR body template

```markdown
## Summary
- Added unit: `<slug>`
- Added weapon: `<weapon-slug>`
- Added lore annotation: `<lore-file>`

## Lore citations
- [List each source with author, title, year, chapter/page]

## Dual-Lens estimates
All `engineStats` and `engineDamage` values are **estimates** derived from lore via Dual-Lens compression. Official Warcore extracts are not yet available.

## Schema validation
- [ ] `npm run validate:data` passed

## Open questions / needs human review
- [List anything unverified or conflicting]
```

## Asset linking

If `public/models/<name>.glb` exists, set:
```json
"asset3d": {
  "optimizedGlbPath": "/models/<name>.opt.glb",
  "dracoCompressionRatio": 0.90,
  "vramFootprintMb": 7.0,
  "polyCount": 18000,
  "textureResolution": "2048x2048",
  "ktx2Formats": ["BC7", "ASTC", "ETC1S"]
}
```

Do not generate or commit 3D assets in this workflow.

## Faction reference

| Faction enum | Example units |
|---|---|
| `adeptus_astartes` | Intercessor |
| `astra_militarum` | Cadian, Kasrkin |
| `chaos_space_marines` | Chaos Chosen |
| `orks` | Ork Boyz |
| `necrons` | Necron Warrior (queued) |
| `aeldari` | — |
| `tyranids` | — |
| `tau_empire` | — |

## Do not

- Merge your own PR
- Claim engine stats are official Warcore data
- Copy long passages from copyrighted sources
- Add more than one unit cluster per daily run
- Skip schema validation
- Duplicate an existing slug
