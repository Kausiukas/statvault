# StatVault Dataslate Coverage Index

Tracks which units, weapons, and lore annotations exist in the corpus. The daily wiki build-up agent reads this file to pick the next topic and avoid duplicates.

**Rule:** Do not create a JSON file whose slug already appears below.

---

## Existing entries

### Units (`data/units/`)

| Slug | Faction | Role | Primary weapon |
|------|---------|------|----------------|
| `hormagaunt` | tyranids | shock_infantry | scything-talons |
| `guardian-defender` | aeldari | line_infantry | shuriken-catapult |
| `necron-immortal` | necrons | heavy_support | gauss-blaster |
| `necron-warrior` | necrons | line_infantry | gauss-flayer |
| `space-marine-intercessor` | adeptus_astartes | shock_infantry | godwyn-bolt-rifle |
| `cadian-shock-trooper` | astra_militarum | line_infantry | kantrael-lasgun |
| `kasrkin-grenadier` | astra_militarum | shock_infantry | hotshot-lasgun |
| `ork-boyz` | orks | shock_infantry | ork-choppa-slugga |
| `chaos-chosen` | chaos_space_marines | shock_infantry | warp-daemon-blade |

### Weapons (`data/weapons/`)

| Slug | Faction | Type |
|------|---------|------|
| `scything-talons` | tyranids | bio_weapon |
| `shuriken-catapult` | aeldari | energy_shuriken |
| `gauss-blaster` | necrons | energy_gauss |
| `gauss-flayer` | necrons | energy_gauss |
| `godwyn-bolt-rifle` | adeptus_astartes | ballistic_slug |
| `kantrael-lasgun` | astra_militarum | energy_las |
| `hotshot-lasgun` | astra_militarum | energy_las |
| `ork-choppa-slugga` | orks | melee_crude |
| `warp-daemon-blade` | chaos_space_marines | warp_daemon |

### Lore annotations (`data/lore/`)

| Slug | Unit | Category | Source |
|------|------|----------|--------|
| `hormagaunt-velocity_discrepancy` | `hormagaunt` | velocity_discrepancy | The Devastation of Baal |
| `guardian-defender-velocity_discrepancy` | `guardian-defender` | velocity_discrepancy | Path of the Warrior |
| `necron-immortal-weapon_potency` | `necron-immortal` | weapon_potency | The Infinite and the Divine |
| `necron-warrior-armor_durability` | `necron-warrior` | armor_durability | The Twice-Dead King: Ruin |

### 3D models without dataslates (`public/models/`)

| Model file | Suggested unit slug | Faction |
|------------|---------------------|---------|
| `space-marine-assault-dual-pbr.glb` | `space-marine-assault` | adeptus_astartes |
| `space-marine-running.glb` | _(animation ref)_ | adeptus_astartes |
| `space-marine-walking.glb` | _(animation ref)_ | adeptus_astartes |

---

## Faction coverage

| Faction | Units | Status |
|---------|-------|--------|
| adeptus_astartes | 1 | Partial |
| astra_militarum | 2 | Partial |
| chaos_space_marines | 1 | Partial |
| orks | 1 | Partial |
| necrons | 1 | Partial |
| aeldari | 1 | Partial |
| tyranids | 1 | Partial |
| **tau_empire** | **0** | **Empty** |

---

## Suggested queue (priority order)

5. **`fire-warrior`** — T'au Fire Warrior + Pulse Rifle. First T'au entry.
6. **`space-marine-assault`** — Assault Intercessor + Chainsword/Bolt Pistol. Model exists.
7. **`leman-russ-battle-tank`** — First vehicle entry (astra_militarum).
8. **`dreadnought-redemptor`** — First monstrous_creature entry (adeptus_astartes).

---

## Role coverage

| Role | Count | Example |
|------|-------|---------|
| shock_infantry | 5 | intercessor, kasrkin, ork-boyz, chaos-chosen |
| line_infantry | 3 | cadian-shock-trooper |
| heavy_support | 1 | — |
| fast_attack | 0 | — |
| monstrous_creature | 0 | — |
| vehicle | 0 | — |
| lord_of_war | 0 | — |

---

## Changelog

| Date | Slug | Added by |
|------|------|----------|
| 2026-09-02 | `hormagaunt`, `scything-talons`, `hormagaunt-velocity_discrepancy` | statvault-wiki-agent |
| 2026-09-02 | `guardian-defender`, `shuriken-catapult`, `guardian-defender-velocity_discrepancy` | statvault-wiki-agent |
| 2026-09-02 | `necron-immortal`, `gauss-blaster`, `necron-immortal-weapon_potency` | statvault-wiki-agent |
| 2026-09-02 | `necron-warrior`, `gauss-flayer`, `necron-warrior-armor_durability` | statvault-wiki-agent |
| _(initial seed)_ | 5 units, 5 weapons | manual |

_Update this table when the wiki agent adds entries._
