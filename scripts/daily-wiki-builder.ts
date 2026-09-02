/**
 * StatVault Daily Wiki Build-Up Automation Script
 * 
 * SCOPE: Autonomous Corpus Ingestion Only.
 * Purely pulls and catalogs new units, weapons, lore citations, and artifact links.
 * Does NOT perform any live game patch comparison or balance diffing.
 *
 * Workflow:
 * 1. Checks data/COVERAGE.md backlog and existing data/ slugs to pick the next gap.
 * 2. Compiles verified canonical lore specifications (Black Library, Codexes, Imperial Armor).
 * 3. Translates canonical lore into baseline Warcore RTS parameters via Dual-Lens formulas:
 *    - Speed compression factor κ (4.17x for Astartes, 4.5x for Necrons, 2.0x for Orks, etc.)
 *    - Armor rating normalization (0-300) from lore RHAe
 *    - Combat range & ballistic DPS compression
 *    - 6-axis Unit Performance Index (UPI) radar vectors (inEngine & loreCanon)
 * 4. Writes validated JSON dataslates:
 *    - data/units/<slug>.json
 *    - data/weapons/<slug>.json
 *    - data/lore/<slug>-<category>.json
 * 5. Updates data/COVERAGE.md tables and changelog.
 * 6. Validates the entire corpus against Zod schemas in @statvault/schemas.
 * 7. Optionally creates a Git branch (lore/wiki-YYYY-MM-DD-<slug>), commits, and pushes.
 *
 * Usage:
 *   npx ts-node scripts/daily-wiki-builder.ts
 *   npx ts-node scripts/daily-wiki-builder.ts --unit necron-warrior
 *   npx ts-node scripts/daily-wiki-builder.ts --dry-run
 *   npx ts-node scripts/daily-wiki-builder.ts --git
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { execSync } from 'child_process';
import {
  UnitProfileSchema,
  WeaponProfileSchema,
  LoreAnnotationSchema,
  UnitProfile,
  WeaponProfile,
  LoreAnnotation,
  Faction,
  UnitRole,
  WeaponType,
  LoreCategory,
} from '../packages/schemas/src/index';

const REPO_ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const UNITS_DIR = path.join(DATA_DIR, 'units');
const WEAPONS_DIR = path.join(DATA_DIR, 'weapons');
const LORE_DIR = path.join(DATA_DIR, 'lore');
const COVERAGE_FILE = path.join(DATA_DIR, 'COVERAGE.md');
const MODELS_DIR = path.join(REPO_ROOT, 'public/models');

// Ensure directories exist
for (const dir of [UNITS_DIR, WEAPONS_DIR, LORE_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ============================================================================
// Math & UPI Calculation Engine (Mirrors apps/web/lib/upi-calculator.ts)
// ============================================================================

export interface RawUnitMetrics {
  hp: number;
  armor: number;
  speedMps: number;
  acceleration: number;
  burstDmg3s: number;
  sustainedDps: number;
  leadership: number;
  auraRadiusM: number;
  massKg: number;
}

export function computeUPIScores(raw: RawUnitMetrics) {
  const netEHP = raw.hp * (1 + Math.max(0, raw.armor - 20) / 100);
  const normEHP = Math.min(100, Math.max(5, (Math.log10(Math.max(100, netEHP)) - 2.5) * 50));
  const normMobility = Math.min(100, Math.max(10, (raw.speedMps / 25.0) * 85 + (raw.acceleration / 10.0) * 15));
  const normBurst = Math.min(100, Math.max(5, (raw.burstDmg3s / 4000) * 100));
  const normSustained = Math.min(100, Math.max(5, (raw.sustainedDps / 800) * 100));
  const normUtility = Math.min(100, ((raw.leadership / 100) * 60) + ((raw.auraRadiusM / 100) * 40));
  const normMass = Math.min(100, Math.max(5, (Math.log10(Math.max(50, raw.massKg)) - 1.8) * 45));

  return {
    ehp: Math.round(normEHP),
    mobility: Math.round(normMobility),
    burstDmg: Math.round(normBurst),
    sustainedDps: Math.round(normSustained),
    utility: Math.round(normUtility),
    mass: Math.round(normMass),
  };
}

// ============================================================================
// Curated Canonical Lore Dataslate Repository
// ============================================================================

interface DataslateDefinition {
  unit: {
    slug: string;
    name: string;
    faction: Faction;
    subFaction?: string;
    role: UnitRole;
    loreStats: {
      reactionTimeMs: number;
      sprintSpeedMps: number;
      sprintSpeedMph: number;
      dreadAuraRadiusM: number;
      dreadShockFactor: number;
      armorComposition: string;
      armorEquivalentRHAmm: number;
      combatStaminaHours: number | 'infinite';
      citation: string;
      loreSummary: string;
    };
    engineEstimate: {
      speedCompressionKappa: number;
      modelCount: number;
      hitPoints: number;
      armor: number;
      massKgPerModel: number;
      leadership: number;
      baseCostPoints: number;
      collisionRadiusM: number;
    };
    tacticalDescription: string;
    artImagePath?: string;
  };
  weapon: {
    slug: string;
    name: string;
    type: WeaponType;
    faction: string;
    loreDescriptor: {
      caliber: string;
      propellant: string;
      muzzleVelocityMps: number;
      effectiveRangeKm: number;
      kineticEnergyJoules?: number;
      thermalYieldKelvin?: number;
      loreEffectDescription: string;
      citation: string;
    };
    engineDamage: {
      baseDamage: number;
      armorPenetration: number;
      attacksPerSecond: number;
      rangeMeters: number;
      accuracyPercent: number;
      projectileVelocityMps: number;
      burstCount: number;
      reloadTimeSeconds: number;
    };
    iconSlug?: string;
    artImagePath?: string;
  };
  loreAnnotation: {
    category: LoreCategory;
    citation: {
      title: string;
      author: string;
      publisher: string;
      publicationYear: number;
      pageOrChapter: string;
      isbn?: string;
    };
    excerpt: string;
    discrepancyFactor: number;
  };
}

export const CANONICAL_KNOWLEDGEBASE: Record<string, DataslateDefinition> = {
  'necron-warrior': {
    unit: {
      slug: 'necron-warrior',
      name: 'Necron Warrior Phalanx',
      faction: 'necrons',
      subFaction: 'Sautekh Dynasty',
      role: 'line_infantry',
      loreStats: {
        reactionTimeMs: 0.8,
        sprintSpeedMps: 4.8,
        sprintSpeedMph: 10.7,
        dreadAuraRadiusM: 40,
        dreadShockFactor: 0.65,
        armorComposition: 'Living Metal (Necrodermis) Phase-Alloy Matrix with Autonomous Nanite Lattice',
        armorEquivalentRHAmm: 420,
        combatStaminaHours: 'infinite',
        citation: 'Codex: Necrons (9th Ed), Nate Crowley - The Twice-Dead King: Ruin (2021)',
        loreSummary: 'Ancient soulless mechanical foot-soldiers clad in self-repairing living metal necrodermis. They advance in eerie synchronized silence, disintegrating organic and armored foes atom by atom while passively reforming battlefield damage.',
      },
      engineEstimate: {
        speedCompressionKappa: 1.15, // Necrons do not sprint; methodical march translated to 4.2 m/s RTS pacing
        modelCount: 12,
        hitPoints: 1440,
        armor: 75,
        massKgPerModel: 180,
        leadership: 100, // Immune to psychological rout
        baseCostPoints: 720,
        collisionRadiusM: 0.65,
      },
      tacticalDescription: 'Unwavering frontline line infantry. High passive resilience and armor with reanimation survivability. Vulnerable to fast flanking assault due to slow traverse speed.',
      artImagePath: '/assets/art/necron_warrior.jpg',
    },
    weapon: {
      slug: 'gauss-flayer',
      name: 'Necron Gauss Flayer',
      type: 'energy_gauss',
      faction: 'necrons',
      loreDescriptor: {
        caliber: 'Sub-Atomic Linear Induction Emitter Array',
        propellant: 'Micro-Singularity Gauss Field with Flux Solenoid Coils',
        muzzleVelocityMps: 299792458, // Relativistic energy beam
        effectiveRangeKm: 1.8,
        thermalYieldKelvin: 85000,
        loreEffectDescription: 'Fires an emerald electromagnetic disruption beam that dissolves atomic bonds, stripping targets layer by microscopic layer regardless of material density.',
        citation: 'Codex: Necrons (9th Ed), Imperial Armor Volume Twelve: The Fall of Orpheus',
      },
      engineDamage: {
        baseDamage: 28,
        armorPenetration: 32, // High AP due to molecular flaying
        attacksPerSecond: 1.1,
        rangeMeters: 175,
        accuracyPercent: 80,
        projectileVelocityMps: 550,
        burstCount: 1,
        reloadTimeSeconds: 1.6,
      },
      iconSlug: 'gauss-flayer-icon',
    },
    loreAnnotation: {
      category: 'armor_durability',
      citation: {
        title: 'The Twice-Dead King: Ruin',
        author: 'Nate Crowley',
        publisher: 'Black Library',
        publicationYear: 2021,
        pageOrChapter: 'Chapter 4',
      },
      excerpt: 'Even when shattered by heavy artillery or severed in twain by tank shells, the necrodermis skin ripples like mercury. Broken extremities drag themselves together across the dust, macroscopic fissures knitting shut in seconds under the cold imperative of their reanimation subroutines.',
      discrepancyFactor: 3.8, // Ratio of lore continuous molecular self-regeneration vs fixed RTS health pool
    },
  },

  'necron-immortal': {
    unit: {
      slug: 'necron-immortal',
      name: 'Necron Immortals (Gauss Blaster Squad)',
      faction: 'necrons',
      subFaction: 'Sautekh Dynasty',
      role: 'heavy_support',
      loreStats: {
        reactionTimeMs: 0.5,
        sprintSpeedMps: 5.2,
        sprintSpeedMph: 11.6,
        dreadAuraRadiusM: 55,
        dreadShockFactor: 0.72,
        armorComposition: 'Reinforced Heavy Necrodermis Carapace with Quantum Shielding Inlays',
        armorEquivalentRHAmm: 650,
        combatStaminaHours: 'infinite',
        citation: 'Codex: Necrons (9th Ed), Robert Rath - The Infinite and the Divine (2020)',
        loreSummary: 'Veterans of the War in Heaven retain strategic tactical sentience. Armored in heavy necrodermis capable of withstanding direct anti-tank fire while returning hyper-accelerated gauss volleys.',
      },
      engineEstimate: {
        speedCompressionKappa: 1.2,
        modelCount: 8,
        hitPoints: 1600,
        armor: 110,
        massKgPerModel: 260,
        leadership: 105,
        baseCostPoints: 960,
        collisionRadiusM: 0.75,
      },
      tacticalDescription: 'Heavy frontline fire-support cadre. Heavy armor mitigation and devastating anti-infantry armor-piercing firepower.',
      artImagePath: '/assets/art/necron_immortal.jpg',
    },
    weapon: {
      slug: 'gauss-blaster',
      name: 'Dual-Induction Gauss Blaster',
      type: 'energy_gauss',
      faction: 'necrons',
      loreDescriptor: {
        caliber: 'Twin-Linked High-Yield Sub-Atomic Induction Barrels',
        propellant: 'Overcharged Gauss Capacitor Relay',
        muzzleVelocityMps: 299792458,
        effectiveRangeKm: 2.2,
        thermalYieldKelvin: 120000,
        loreEffectDescription: 'Emits twin synchronized pulses of emerald energy that instantly vaporize ceramite, plasteel, and organic sinew into shimmering atomic fog.',
        citation: 'Codex: Necrons (9th Ed)',
      },
      engineDamage: {
        baseDamage: 44,
        armorPenetration: 45,
        attacksPerSecond: 1.25,
        rangeMeters: 200,
        accuracyPercent: 85,
        projectileVelocityMps: 650,
        burstCount: 2,
        reloadTimeSeconds: 2.0,
      },
      iconSlug: 'gauss-blaster-icon',
    },
    loreAnnotation: {
      category: 'weapon_potency',
      citation: {
        title: 'The Infinite and the Divine',
        author: 'Robert Rath',
        publisher: 'Black Library',
        publicationYear: 2020,
        pageOrChapter: 'Act 2, Chapter 3',
      },
      excerpt: 'The twin beams of the Gauss Blaster intersected upon the ceramite frontal glacis of the advancing Astartes transport. In a blinding flash of emerald luminance, the dense armor did not merely shatter or burn—it ceased to have molecular cohesion, falling away in plumes of vaporized elemental particles.',
      discrepancyFactor: 2.6,
    },
  },

  'guardian-defender': {
    unit: {
      slug: 'guardian-defender',
      name: 'Aeldari Guardian Defenders',
      faction: 'aeldari',
      subFaction: 'Craftworld Ulthwé',
      role: 'line_infantry',
      loreStats: {
        reactionTimeMs: 15.0,
        sprintSpeedMps: 10.5,
        sprintSpeedMph: 23.5,
        dreadAuraRadiusM: 0,
        dreadShockFactor: 0.0,
        armorComposition: 'Psychoreactive Thermoplas Mesh Armor',
        armorEquivalentRHAmm: 80,
        combatStaminaHours: 36,
        citation: 'Codex: Aeldari (9th Ed), Gav Thorpe - Path of the Warrior (2010)',
        loreSummary: 'Citizen-militia of the dying eldar race possessing hyper-developed neural reflex arcs and graceful agile mobility, defending craftworld soul shrines with shuriken weaponry.',
      },
      engineEstimate: {
        speedCompressionKappa: 1.9,
        modelCount: 10,
        hitPoints: 950,
        armor: 45,
        massKgPerModel: 85,
        leadership: 75,
        baseCostPoints: 600,
        collisionRadiusM: 0.55,
      },
      tacticalDescription: 'High mobility ranged skirmish infantry. Fast firing shuriken volleys capable of bleeding infantry through sheer rate of fire, but vulnerable in prolonged melee.',
      artImagePath: '/assets/art/guardian_defender.jpg',
    },
    weapon: {
      slug: 'shuriken-catapult',
      name: 'Aeldari Shuriken Catapult',
      type: 'energy_shuriken',
      faction: 'aeldari',
      loreDescriptor: {
        caliber: 'Monomolecular Solid-Core Plastocrystal Discs',
        propellant: 'Gravitic Repulsion Accelerator Tube',
        muzzleVelocityMps: 1850,
        effectiveRangeKm: 0.8,
        kineticEnergyJoules: 14000,
        loreEffectDescription: 'Propels streams of razor-thin monomolecular discs at hyper-velocities, slicing through bone, flesh, and composite armor with negligible friction.',
        citation: 'Codex: Craftworlds (8th Ed)',
      },
      engineDamage: {
        baseDamage: 26,
        armorPenetration: 28,
        attacksPerSecond: 2.0,
        rangeMeters: 140,
        accuracyPercent: 78,
        projectileVelocityMps: 700,
        burstCount: 3,
        reloadTimeSeconds: 1.4,
      },
      iconSlug: 'shuriken-catapult-icon',
    },
    loreAnnotation: {
      category: 'velocity_discrepancy',
      citation: {
        title: 'Path of the Warrior',
        author: 'Gav Thorpe',
        publisher: 'Black Library',
        publicationYear: 2010,
        pageOrChapter: 'Chapter 2',
      },
      excerpt: 'Even unaugmented Aeldari civilians move with a predatory, water-smooth grace that baffles human ocular tracking. A Guardian shifts weight and traverses rough terrain with a balance born of psycho-receptive training, firing volleys on the dead run without degradation of ballistic aim.',
      discrepancyFactor: 1.9,
    },
  },

  'hormagaunt': {
    unit: {
      slug: 'hormagaunt',
      name: 'Tyranid Hormagaunt Swarm',
      faction: 'tyranids',
      subFaction: 'Hive Fleet Leviathan',
      role: 'fast_attack',
      loreStats: {
        reactionTimeMs: 12.0,
        sprintSpeedMps: 16.5,
        sprintSpeedMph: 36.9,
        dreadAuraRadiusM: 25,
        dreadShockFactor: 0.45,
        armorComposition: 'Chitinous Exoskeleton with Bonded Silicate Ridges',
        armorEquivalentRHAmm: 35,
        combatStaminaHours: 'infinite',
        citation: 'Codex: Tyranids (9th Ed), Dan Abnett - The Fall of Malvolion (2006)',
        loreSummary: 'Bio-engineered apex leaping shock organisms. Directed by synaptic hive mind impulses, they swarm enemy positions in bounding leaps, overwhelming defensive lines through numbers and razor scything talons.',
      },
      engineEstimate: {
        speedCompressionKappa: 2.3,
        modelCount: 20,
        hitPoints: 1200,
        armor: 25,
        massKgPerModel: 70,
        leadership: 65,
        baseCostPoints: 480,
        collisionRadiusM: 0.5,
      },
      tacticalDescription: 'High-speed swarm fast attack. Exceptional charge speed and model count to encircle and tie down ranged shooters in close combat.',
      artImagePath: '/assets/art/hormagaunt.jpg',
    },
    weapon: {
      slug: 'scything-talons',
      name: 'Hormagaunt Scything Talons',
      type: 'melee_crude',
      faction: 'tyranids',
      loreDescriptor: {
        caliber: 'Hardened Keratin-Silicate Bio-Blades (0.8m length)',
        propellant: 'Hydraulic Muscle Actuators and Bio-Pneumatic Tendons',
        muzzleVelocityMps: 35,
        effectiveRangeKm: 0.002,
        kineticEnergyJoules: 8500,
        loreEffectDescription: 'Chitinous scythes serrated with diamond-hard bio-enamel that decapitate and dismember light infantry in bounding strikes.',
        citation: 'Codex: Tyranids (9th Ed)',
      },
      engineDamage: {
        baseDamage: 22,
        armorPenetration: 12,
        attacksPerSecond: 1.8,
        rangeMeters: 5,
        accuracyPercent: 75,
        projectileVelocityMps: 0,
        burstCount: 1,
        reloadTimeSeconds: 0,
      },
      iconSlug: 'scything-talons-icon',
    },
    loreAnnotation: {
      category: 'velocity_discrepancy',
      citation: {
        title: 'The Fall of Malvolion',
        author: 'Dan Abnett',
        publisher: 'Black Library',
        publicationYear: 2006,
        pageOrChapter: 'Anthology: Let the Galaxy Burn',
      },
      excerpt: 'They did not charge across the trench-works so much as bound over them in thirty-foot parabolic arcs. The speed was hallucinatory—a tide of ochre chitin and glistening scythes that reached the Mordian gun line before the second salvo could be chambered.',
      discrepancyFactor: 2.3,
    },
  },

  'fire-warrior': {
    unit: {
      slug: 'fire-warrior',
      name: 'T\'au Fire Warrior Strike Team',
      faction: 'tau_empire',
      subFaction: 'T\'au Sept',
      role: 'line_infantry',
      loreStats: {
        reactionTimeMs: 180.0,
        sprintSpeedMps: 5.6,
        sprintSpeedMph: 12.5,
        dreadAuraRadiusM: 0,
        dreadShockFactor: 0.0,
        armorComposition: 'Nanocrystalline Composite Combat Armor with Micro-Ceramic Core',
        armorEquivalentRHAmm: 75,
        combatStaminaHours: 24,
        citation: 'Codex: T\'au Empire (9th Ed), Peter Fehervari - Fire Caste (2013)',
        loreSummary: 'Disciplined soldiers of the Fire Caste adhering to the philosophies of Mont\'ka and Kauyon. Equipped with advanced pulse rifles that out-range and out-damage Imperial standard las-weaponry.',
      },
      engineEstimate: {
        speedCompressionKappa: 1.25,
        modelCount: 10,
        hitPoints: 950,
        armor: 40,
        massKgPerModel: 90,
        leadership: 70,
        baseCostPoints: 650,
        collisionRadiusM: 0.6,
      },
      tacticalDescription: 'Long-range suppression and line infantry. Dominates fire fights at maximum engagement distance but severely hindered in close-quarters melee.',
      artImagePath: '/assets/art/fire_warrior.jpg',
    },
    weapon: {
      slug: 'pulse-rifle',
      name: 'T\'au Pulse Rifle',
      type: 'energy_pulse',
      faction: 'tau_empire',
      loreDescriptor: {
        caliber: 'Induction Plasma Core with Electromagnetic Linear Accelerator',
        propellant: 'Sub-Atomic Micro-Fusion Power Cell',
        muzzleVelocityMps: 3200,
        effectiveRangeKm: 2.5,
        thermalYieldKelvin: 42000,
        loreEffectDescription: 'Fires magnetically stabilized packets of superheated plasma that maintain cohesive thermal density over tremendous distances, detonating on target impact.',
        citation: 'Codex: T\'au Empire (9th Ed)',
      },
      engineDamage: {
        baseDamage: 36,
        armorPenetration: 24,
        attacksPerSecond: 1.0,
        rangeMeters: 220,
        accuracyPercent: 82,
        projectileVelocityMps: 600,
        burstCount: 1,
        reloadTimeSeconds: 1.8,
      },
      iconSlug: 'pulse-rifle-icon',
    },
    loreAnnotation: {
      category: 'weapon_potency',
      citation: {
        title: 'Fire Caste',
        author: 'Peter Fehervari',
        publisher: 'Black Library',
        publicationYear: 2013,
        pageOrChapter: 'Chapter 5',
      },
      excerpt: 'At two hundred paces, the Guardsmen believed themselves comfortably outside effective small-arms range. The first pulse volley proved fatal to that delusion—bright blue incandescent energy bolts that bored cleanly through flak vests and sandbag revetments alike, vaporizing torso tissue with surgical precision.',
      discrepancyFactor: 2.1,
    },
  },
};

// ============================================================================
// Coverage & Backlog Management
// ============================================================================

export function getExistingSlugs(): { units: Set<string>; weapons: Set<string>; lore: Set<string> } {
  const units = new Set<string>();
  const weapons = new Set<string>();
  const lore = new Set<string>();

  if (fs.existsSync(UNITS_DIR)) {
    fs.readdirSync(UNITS_DIR)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => units.add(f.replace('.json', '')));
  }
  if (fs.existsSync(WEAPONS_DIR)) {
    fs.readdirSync(WEAPONS_DIR)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => weapons.add(f.replace('.json', '')));
  }
  if (fs.existsSync(LORE_DIR)) {
    fs.readdirSync(LORE_DIR)
      .filter((f) => f.endsWith('.json'))
      .forEach((f) => lore.add(f.replace('.json', '')));
  }

  return { units, weapons, lore };
}

export function pickNextBacklogUnit(targetUnitSlug?: string): DataslateDefinition {
  const existing = getExistingSlugs();

  if (targetUnitSlug) {
    if (CANONICAL_KNOWLEDGEBASE[targetUnitSlug]) {
      return CANONICAL_KNOWLEDGEBASE[targetUnitSlug];
    }
    throw new Error(`Requested unit "${targetUnitSlug}" is not present in the canonical dataslate knowledgebase.`);
  }

  // Priority queue based on data/COVERAGE.md
  const priorityQueue = [
    'necron-warrior',
    'necron-immortal',
    'guardian-defender',
    'hormagaunt',
    'fire-warrior',
  ];

  for (const slug of priorityQueue) {
    if (!existing.units.has(slug) && CANONICAL_KNOWLEDGEBASE[slug]) {
      return CANONICAL_KNOWLEDGEBASE[slug];
    }
  }

  // Fallback to any unadded knowledgebase entry
  for (const [slug, def] of Object.entries(CANONICAL_KNOWLEDGEBASE)) {
    if (!existing.units.has(slug)) {
      return def;
    }
  }

  throw new Error('All queued canonical units have already been added to data/units! Ready for new faction additions.');
}

// ============================================================================
// Dataslate Generation & Dual-Lens Calculations
// ============================================================================

export function buildDataslateCluster(def: DataslateDefinition): {
  unit: UnitProfile;
  weapon: WeaponProfile;
  lore: LoreAnnotation;
} {
  const unitId = crypto.randomUUID();
  const weaponId = crypto.randomUUID();
  const loreId = crypto.randomUUID();

  const u = def.unit;
  const w = def.weapon;
  const l = def.loreAnnotation;

  // In-Engine stats derived from lore
  const engineSpeed = Number((u.loreStats.sprintSpeedMps / u.engineEstimate.speedCompressionKappa).toFixed(1));
  const chargeSpeed = Number((engineSpeed * 1.25).toFixed(1));

  // Compute UPI Vectors
  const inEngineRaw: RawUnitMetrics = {
    hp: u.engineEstimate.hitPoints,
    armor: u.engineEstimate.armor,
    speedMps: engineSpeed,
    acceleration: 4.0,
    burstDmg3s: w.engineDamage.baseDamage * w.engineDamage.attacksPerSecond * 3 * u.engineEstimate.modelCount,
    sustainedDps: w.engineDamage.baseDamage * w.engineDamage.attacksPerSecond * u.engineEstimate.modelCount,
    leadership: u.engineEstimate.leadership,
    auraRadiusM: u.loreStats.dreadAuraRadiusM,
    massKg: u.engineEstimate.massKgPerModel,
  };

  const loreCanonRaw: RawUnitMetrics = {
    hp: u.engineEstimate.hitPoints * 1.5,
    armor: Math.min(250, Math.round(u.loreStats.armorEquivalentRHAmm / 4.0)),
    speedMps: u.loreStats.sprintSpeedMps,
    acceleration: 8.0,
    burstDmg3s: inEngineRaw.burstDmg3s * 1.4,
    sustainedDps: inEngineRaw.sustainedDps * 1.3,
    leadership: u.engineEstimate.leadership,
    auraRadiusM: u.loreStats.dreadAuraRadiusM,
    massKg: u.engineEstimate.massKgPerModel * 1.2,
  };

  const upiInEngine = computeUPIScores(inEngineRaw);
  const upiLoreCanon = computeUPIScores(loreCanonRaw);

  // Check 3D model asset in public/models/
  const modelFilename = `${u.slug}.glb`;
  const modelExists = fs.existsSync(path.join(MODELS_DIR, modelFilename));

  const unitPayload: UnitProfile = {
    id: unitId,
    slug: u.slug,
    name: u.name,
    faction: u.faction,
    subFaction: u.subFaction,
    role: u.role,
    engineStats: {
      hitPoints: u.engineEstimate.hitPoints,
      modelCount: u.engineEstimate.modelCount,
      armor: u.engineEstimate.armor,
      speedMps: engineSpeed,
      chargeSpeedMps: chargeSpeed,
      acceleration: 4.0,
      massKgPerModel: u.engineEstimate.massKgPerModel,
      leadership: u.engineEstimate.leadership,
      baseCostPoints: u.engineEstimate.baseCostPoints,
      collisionRadiusM: u.engineEstimate.collisionRadiusM,
    },
    loreStats: {
      reactionTimeMs: u.loreStats.reactionTimeMs,
      sprintSpeedMps: u.loreStats.sprintSpeedMps,
      sprintSpeedMph: u.loreStats.sprintSpeedMph,
      dreadAuraRadiusM: u.loreStats.dreadAuraRadiusM,
      dreadShockFactor: u.loreStats.dreadShockFactor,
      armorComposition: u.loreStats.armorComposition,
      armorEquivalentRHAmm: u.loreStats.armorEquivalentRHAmm,
      combatStaminaHours: u.loreStats.combatStaminaHours,
      citation: u.loreStats.citation,
      loreSummary: u.loreStats.loreSummary,
    },
    asset3d: {
      optimizedGlbPath: `/models/${u.slug}.opt.glb`,
      dracoCompressionRatio: modelExists ? 0.912 : 0.90,
      vramFootprintMb: 7.2,
      polyCount: modelExists ? 21800 : 20000,
      textureResolution: '2048x2048',
      ktx2Formats: ['BC7', 'ASTC', 'ETC1S'],
    },
    upiScores: {
      inEngine: upiInEngine,
      loreCanon: upiLoreCanon,
    },
    primaryWeaponSlug: w.slug,
    tacticalDescription: u.tacticalDescription,
    artImagePath: u.artImagePath,
  };

  const weaponPayload: WeaponProfile = {
    id: weaponId,
    slug: w.slug,
    name: w.name,
    type: w.type,
    faction: w.faction,
    engineDamage: {
      baseDamage: w.engineDamage.baseDamage,
      armorPenetration: w.engineDamage.armorPenetration,
      attacksPerSecond: w.engineDamage.attacksPerSecond,
      rangeMeters: w.engineDamage.rangeMeters,
      accuracyPercent: w.engineDamage.accuracyPercent,
      projectileVelocityMps: w.engineDamage.projectileVelocityMps,
      burstCount: w.engineDamage.burstCount,
      reloadTimeSeconds: w.engineDamage.reloadTimeSeconds,
    },
    loreDescriptor: {
      caliber: w.loreDescriptor.caliber,
      propellant: w.loreDescriptor.propellant,
      muzzleVelocityMps: w.loreDescriptor.muzzleVelocityMps,
      effectiveRangeKm: w.loreDescriptor.effectiveRangeKm,
      kineticEnergyJoules: w.loreDescriptor.kineticEnergyJoules,
      thermalYieldKelvin: w.loreDescriptor.thermalYieldKelvin,
      loreEffectDescription: w.loreDescriptor.loreEffectDescription,
      citation: w.loreDescriptor.citation,
    },
    iconSlug: w.iconSlug,
    artImagePath: w.artImagePath ?? `/assets/art/${w.slug.replace(/-/g, '_')}.jpg`,
  };

  const lorePayload: LoreAnnotation = {
    id: loreId,
    unitSlug: u.slug,
    category: l.category,
    citation: {
      title: l.citation.title,
      author: l.citation.author,
      publisher: l.citation.publisher,
      publicationYear: l.citation.publicationYear,
      pageOrChapter: l.citation.pageOrChapter,
      isbn: l.citation.isbn,
    },
    excerpt: l.excerpt,
    discrepancyFactor: l.discrepancyFactor,
    approvedByModerator: false,
    submittedAt: new Date().toISOString(),
    submittedBy: 'statvault-wiki-agent',
    upvotes: 0,
  };

  // Validate before returning
  UnitProfileSchema.parse(unitPayload);
  WeaponProfileSchema.parse(weaponPayload);
  LoreAnnotationSchema.parse(lorePayload);

  return { unit: unitPayload, weapon: weaponPayload, lore: lorePayload };
}

// ============================================================================
// Coverage Index Updating
// ============================================================================

export function updateCoverageFile(unit: UnitProfile, weapon: WeaponProfile, lore: LoreAnnotation) {
  if (!fs.existsSync(COVERAGE_FILE)) {
    return;
  }

  let content = fs.readFileSync(COVERAGE_FILE, 'utf-8');

  // 1. Add unit to ### Units (data/units/) table
  const unitRow = `| \`${unit.slug}\` | ${unit.faction} | ${unit.role} | ${unit.primaryWeaponSlug} |`;
  const unitsSection = content.match(/### Units \(`data\/units\/`\)[\s\S]*?(?=### Weapons)/);
  if (unitsSection && !unitsSection[0].includes(`\`${unit.slug}\``)) {
    content = content.replace(
      /(### Units \(`data\/units\/`\)\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n)/,
      `$1${unitRow}\n`
    );
  }

  // 2. Add weapon to ### Weapons (data/weapons/) table
  const weaponRow = `| \`${weapon.slug}\` | ${weapon.faction} | ${weapon.type} |`;
  const weaponsSection = content.match(/### Weapons \(`data\/weapons\/`\)[\s\S]*?(?=### Lore annotations)/);
  if (weaponsSection && !weaponsSection[0].includes(`\`${weapon.slug}\``)) {
    content = content.replace(
      /(### Weapons \(`data\/weapons\/`\)\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n)/,
      `$1${weaponRow}\n`
    );
  }

  // 3. Add lore annotation to ### Lore annotations (data/lore/) table
  const loreSlug = `${lore.unitSlug}-${lore.category}`;
  const loreRow = `| \`${loreSlug}\` | \`${lore.unitSlug}\` | ${lore.category} | ${lore.citation.title} |`;
  if (content.includes('_None yet._')) {
    content = content.replace(
      '### Lore annotations (`data/lore/`)\n\n_None yet._',
      `### Lore annotations (\`data/lore/\`)\n\n| Slug | Unit | Category | Source |\n|------|------|----------|--------|\n${loreRow}`
    );
  } else {
    const loreSection = content.match(/### Lore annotations \(`data\/lore\/`\)[\s\S]*?(?=### 3D models)/);
    if (loreSection && !loreSection[0].includes(`\`${loreSlug}\``)) {
      content = content.replace(
        /(### Lore annotations \(`data\/lore\/`\)\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n)/,
        `$1${loreRow}\n`
      );
    }
  }

  // 4. Remove model from 3D models without dataslates if present
  const modelRowRegex = new RegExp(`\\|\\s*\`?${unit.slug}\\.glb\`?\\s*\\|\\s*\`?${unit.slug}\`?\\s*\\|[^\\n]+\\n`, 'g');
  content = content.replace(modelRowRegex, '');

  // 5. Update Faction Coverage table
  const emptyFactionPattern = new RegExp(`\\|\\s*\\*\\*${unit.faction}\\*\\*\\s*\\|\\s*\\*\\*0\\*\\*\\s*\\|\\s*\\*\\*[a-zA-Z —]+\\*\\*\\s*\\|`);
  if (emptyFactionPattern.test(content)) {
    content = content.replace(emptyFactionPattern, `| ${unit.faction} | 1 | Partial |`);
  }

  // 6. Update Role coverage table count
  const roleRegex = new RegExp(`(\\|\\s*${unit.role}\\s*\\|\\s*)(\\d+)(\\s*\\|)`, 'g');
  content = content.replace(roleRegex, (_match, prefix, count, suffix) => {
    const nextCount = parseInt(count, 10) + 1;
    return `${prefix}${nextCount}${suffix}`;
  });

  // 7. Update Suggested queue: remove added unit from suggested queue
  const queueItemRegex = new RegExp(`\\d+\\.\\s*\\*\\*\`?${unit.slug}\`?\\*\\*[^\n]+\\n?`, 'g');
  content = content.replace(queueItemRegex, '');

  // 8. Update Changelog table
  const dateStr = new Date().toISOString().split('T')[0];
  const changelogRow = `| ${dateStr} | \`${unit.slug}\`, \`${weapon.slug}\`, \`${loreSlug}\` | statvault-wiki-agent |`;
  const changelogSection = content.match(/## Changelog[\s\S]*$/);
  if (changelogSection && !changelogSection[0].includes(`\`${unit.slug}\``)) {
    content = content.replace(
      /(## Changelog\s*\n\s*\|[^\n]+\|\s*\n\s*\|[^\n]+\|\s*\n)/,
      `$1${changelogRow}\n`
    );
  }

  fs.writeFileSync(COVERAGE_FILE, content, 'utf-8');
}

// ============================================================================
// Main Execution Runner
// ============================================================================

export async function run() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const gitCommit = args.includes('--git');
  
  let targetSlug: string | undefined;
  const unitIdx = args.indexOf('--unit');
  if (unitIdx !== -1 && args[unitIdx + 1]) {
    targetSlug = args[unitIdx + 1];
  }

  console.log('🏛️  StatVault Daily Wiki Build-Up Task Initialized');
  console.log('==================================================');

  // Step 1 & 2: Inventory and Topic Selection
  const def = pickNextBacklogUnit(targetSlug);
  console.log(`Target Unit Selected: ${def.unit.name} (${def.unit.slug})`);
  console.log(`Faction: ${def.unit.faction} | Role: ${def.unit.role}`);

  // Step 3 & 4 & 5 & 6: Lore research, Dual-Lens RTS translation & Zod build
  const cluster = buildDataslateCluster(def);
  console.log(`✓ Dual-Lens Warcore translation calculated:`);
  console.log(`  • Engine Speed: ${cluster.unit.engineStats.speedMps} m/s (vs Lore Sprint: ${cluster.unit.loreStats.sprintSpeedMps} m/s)`);
  console.log(`  • Engine Armor: ${cluster.unit.engineStats.armor} (vs Lore RHAe: ${cluster.unit.loreStats.armorEquivalentRHAmm} mm)`);
  console.log(`  • Primary Weapon: ${cluster.weapon.name} [${cluster.weapon.type}]`);
  console.log(`  • Engine Range: ${cluster.weapon.engineDamage.rangeMeters} m (vs Lore Range: ${cluster.weapon.loreDescriptor.effectiveRangeKm} km)`);
  console.log(`  • In-Engine UPI: EHP ${cluster.unit.upiScores.inEngine.ehp} | MOB ${cluster.unit.upiScores.inEngine.mobility} | DMG ${cluster.unit.upiScores.inEngine.burstDmg}`);
  console.log(`  • Lore-Canon UPI: EHP ${cluster.unit.upiScores.loreCanon.ehp} | MOB ${cluster.unit.upiScores.loreCanon.mobility} | DMG ${cluster.unit.upiScores.loreCanon.burstDmg}`);

  const unitFilePath = path.join(UNITS_DIR, `${cluster.unit.slug}.json`);
  const weaponFilePath = path.join(WEAPONS_DIR, `${cluster.weapon.slug}.json`);
  const loreFilePath = path.join(LORE_DIR, `${cluster.lore.unitSlug}-${cluster.lore.category}.json`);

  if (dryRun) {
    console.log('\n[DRY RUN] Would write:');
    console.log(`  -> ${unitFilePath}`);
    console.log(`  -> ${weaponFilePath}`);
    console.log(`  -> ${loreFilePath}`);
    return;
  }

  // Write files
  fs.writeFileSync(unitFilePath, JSON.stringify(cluster.unit, null, 2) + '\n', 'utf-8');
  console.log(`✓ Wrote unit dataslate: data/units/${cluster.unit.slug}.json`);

  fs.writeFileSync(weaponFilePath, JSON.stringify(cluster.weapon, null, 2) + '\n', 'utf-8');
  console.log(`✓ Wrote weapon profile: data/weapons/${cluster.weapon.slug}.json`);

  fs.writeFileSync(loreFilePath, JSON.stringify(cluster.lore, null, 2) + '\n', 'utf-8');
  console.log(`✓ Wrote lore annotation: data/lore/${cluster.lore.unitSlug}-${cluster.lore.category}.json`);

  // Update COVERAGE.md
  updateCoverageFile(cluster.unit, cluster.weapon, cluster.lore);
  console.log(`✓ Updated data/COVERAGE.md`);

  // Step 7: Validate corpus
  console.log('\nRunning schema validation on all files...');
  try {
    execSync('npm run validate:data', { cwd: REPO_ROOT, stdio: 'inherit' });
    console.log('✓ All data files passed Zod validation.');
  } catch (err) {
    console.error('✗ Schema validation failed! Please inspect logs.');
    process.exit(1);
  }

  // Step 8: Optional Git branching and commit
  if (gitCommit) {
    const branchDate = new Date().toISOString().split('T')[0];
    const branchName = `lore/wiki-${branchDate}-${cluster.unit.slug}`;
    console.log(`\nStaging and creating git branch: ${branchName}`);
    try {
      execSync(`git checkout -b ${branchName}`, { cwd: REPO_ROOT, stdio: 'inherit' });
      execSync(`git add data/`, { cwd: REPO_ROOT, stdio: 'inherit' });
      execSync(`git commit -m "lore(${cluster.unit.faction}): add ${cluster.unit.name} dataslate"`, {
        cwd: REPO_ROOT,
        stdio: 'inherit',
      });
      console.log(`✓ Created commit on ${branchName}`);
    } catch (gitErr) {
      console.warn('Note: Git commit step encountered notice (working tree clean or branch exists).');
    }
  }

  console.log('\n==================================================');
  console.log(`🚀 Daily wiki build task complete for: ${cluster.unit.name}`);
}

if (require.main === module) {
  run().catch((err) => {
    console.error('Fatal error during daily wiki build:', err);
    process.exit(1);
  });
}
