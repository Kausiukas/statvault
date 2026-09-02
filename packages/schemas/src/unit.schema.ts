import { z } from 'zod';

export const FactionEnum = z.enum([
  'adeptus_astartes',
  'astra_militarum',
  'chaos_space_marines',
  'orks',
  'aeldari',
  'necrons',
  'tyranids',
  'tau_empire',
  'adepta_sororitas',
  'adeptus_custodes',
  'leagues_of_votann',
  'drukhari',
]);
export type Faction = z.infer<typeof FactionEnum>;

export const UnitRoleEnum = z.enum([
  'shock_infantry',
  'line_infantry',
  'heavy_support',
  'fast_attack',
  'monstrous_creature',
  'vehicle',
  'lord_of_war',
]);
export type UnitRole = z.infer<typeof UnitRoleEnum>;

export const EngineStatsSchema = z.object({
  hitPoints: z.number().int().positive(),
  modelCount: z.number().int().positive(),
  armor: z.number().min(0).max(300),
  speedMps: z.number().positive(),
  chargeSpeedMps: z.number().positive(),
  acceleration: z.number().positive(),
  massKgPerModel: z.number().positive(),
  leadership: z.number().min(0).max(120),
  baseCostPoints: z.number().int().positive(),
  collisionRadiusM: z.number().positive(),
});
export type EngineStats = z.infer<typeof EngineStatsSchema>;

export const LoreStatsSchema = z.object({
  reactionTimeMs: z.number().positive(),
  sprintSpeedMps: z.number().positive(),
  sprintSpeedMph: z.number().positive(),
  dreadAuraRadiusM: z.number().min(0),
  dreadShockFactor: z.number().min(0).max(1.0),
  armorComposition: z.string(),
  armorEquivalentRHAmm: z.number().positive(),
  combatStaminaHours: z.union([z.number().positive(), z.literal('infinite')]),
  citation: z.string(),
  loreSummary: z.string(),
});
export type LoreStats = z.infer<typeof LoreStatsSchema>;

export const Asset3DSchema = z.object({
  optimizedGlbPath: z.string().startsWith('/models/'),
  dracoCompressionRatio: z.number().min(0).max(1.0),
  vramFootprintMb: z.number().positive(),
  polyCount: z.number().int().positive(),
  textureResolution: z.string().default('2048x2048'),
  ktx2Formats: z.array(z.string()).default(['BC7', 'ASTC', 'ETC1S']),
});
export type Asset3D = z.infer<typeof Asset3DSchema>;

export const UPIScoresSchema = z.object({
  ehp: z.number().min(0).max(100),
  mobility: z.number().min(0).max(100),
  burstDmg: z.number().min(0).max(100),
  sustainedDps: z.number().min(0).max(100),
  utility: z.number().min(0).max(100),
  mass: z.number().min(0).max(100),
});
export type UPIScores = z.infer<typeof UPIScoresSchema>;

export const UnitProfileSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  faction: FactionEnum,
  subFaction: z.string().optional(),
  role: UnitRoleEnum,
  engineStats: EngineStatsSchema,
  loreStats: LoreStatsSchema,
  asset3d: Asset3DSchema,
  upiScores: z.object({
    inEngine: UPIScoresSchema,
    loreCanon: UPIScoresSchema,
  }),
  primaryWeaponSlug: z.string(),
  secondaryWeaponSlug: z.string().optional(),
  tacticalDescription: z.string(),
  artImagePath: z.string().optional(),
});
export type UnitProfile = z.infer<typeof UnitProfileSchema>;
