import { z } from 'zod';

export const LoreCategoryEnum = z.enum([
  'velocity_discrepancy',
  'armor_durability',
  'transhuman_dread',
  'weapon_potency',
  'combat_longevity',
  'warp_corruption',
]);
export type LoreCategory = z.infer<typeof LoreCategoryEnum>;

export const CitationSchema = z.object({
  title: z.string(),
  author: z.string(),
  publisher: z.string().default('Black Library'),
  publicationYear: z.number().int(),
  pageOrChapter: z.string(),
  isbn: z.string().optional(),
});
export type Citation = z.infer<typeof CitationSchema>;

export const LoreAnnotationSchema = z.object({
  id: z.string().uuid(),
  unitSlug: z.string(),
  category: LoreCategoryEnum,
  citation: CitationSchema,
  excerpt: z.string().min(20).max(1500),
  discrepancyFactor: z.number().positive(),
  approvedByModerator: z.boolean().default(false),
  submittedAt: z.string().datetime(),
  submittedBy: z.string(),
  upvotes: z.number().int().default(0),
});
export type LoreAnnotation = z.infer<typeof LoreAnnotationSchema>;
