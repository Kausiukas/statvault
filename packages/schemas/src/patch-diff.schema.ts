import { z } from 'zod';

export const PatchChangeTypeEnum = z.enum(['buff', 'nerf', 'rework', 'fix', 'lore_sync']);
export type PatchChangeType = z.infer<typeof PatchChangeTypeEnum>;

export const UnitDeltaSchema = z.object({
  unitSlug: z.string(),
  unitName: z.string(),
  attribute: z.string(),
  previousValue: z.union([z.number(), z.string()]),
  newValue: z.union([z.number(), z.string()]),
  deltaFormatted: z.string(),
  changeType: PatchChangeTypeEnum,
  tacticalRationale: z.string(),
});
export type UnitDelta = z.infer<typeof UnitDeltaSchema>;

export const PatchDiffSchema = z.object({
  buildVersion: z.string().regex(/^v\d+\.\d+\.\d+$/),
  releaseDate: z.string().datetime(),
  title: z.string(),
  gameEngine: z.string().default('Warcore RTS'),
  summary: z.string(),
  unitDeltas: z.array(UnitDeltaSchema),
  approvedByLeadArchitect: z.boolean().default(true),
});
export type PatchDiff = z.infer<typeof PatchDiffSchema>;
