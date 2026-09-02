import { z } from 'zod';

export const WeaponTypeEnum = z.enum([
  'ballistic_slug',
  'energy_plasma',
  'energy_las',
  'energy_melta',
  'energy_gauss',
  'energy_shuriken',
  'energy_pulse',
  'explosive_missile',
  'melee_power',
  'melee_chain',
  'melee_crude',
  'warp_daemon',
]);
export type WeaponType = z.infer<typeof WeaponTypeEnum>;

export const WeaponEngineDamageSchema = z.object({
  baseDamage: z.number().positive(),
  armorPenetration: z.number().min(0),
  attacksPerSecond: z.number().positive(),
  rangeMeters: z.number().min(0),
  accuracyPercent: z.number().min(0).max(100),
  projectileVelocityMps: z.number().min(0),
  burstCount: z.number().int().positive().default(1),
  reloadTimeSeconds: z.number().min(0).default(0),
});
export type WeaponEngineDamage = z.infer<typeof WeaponEngineDamageSchema>;

export const WeaponLoreDescriptorSchema = z.object({
  caliber: z.string(),
  propellant: z.string(),
  muzzleVelocityMps: z.number().positive(),
  effectiveRangeKm: z.number().positive(),
  kineticEnergyJoules: z.number().positive().optional(),
  thermalYieldKelvin: z.number().positive().optional(),
  loreEffectDescription: z.string(),
  citation: z.string(),
});
export type WeaponLoreDescriptor = z.infer<typeof WeaponLoreDescriptorSchema>;

export const WeaponProfileSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(2).max(100),
  type: WeaponTypeEnum,
  faction: z.string(),
  engineDamage: WeaponEngineDamageSchema,
  loreDescriptor: WeaponLoreDescriptorSchema,
  iconSlug: z.string().optional(),
  artImagePath: z.string().optional(),
});
export type WeaponProfile = z.infer<typeof WeaponProfileSchema>;
