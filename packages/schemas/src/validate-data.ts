/**
 * StatVault data corpus validator.
 * Parses every JSON file in data/units, data/weapons, and data/lore
 * against the Zod schemas in @statvault/schemas.
 *
 * Usage: npm run validate:data
 */
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import {
  UnitProfileSchema,
  WeaponProfileSchema,
  LoreAnnotationSchema,
} from './index';

const REPO_ROOT = path.resolve(__dirname, '../../..');

interface ValidationTarget {
  dir: string;
  schema: z.ZodType;
  label: string;
}

const TARGETS: ValidationTarget[] = [
  {
    dir: path.join(REPO_ROOT, 'data/units'),
    schema: UnitProfileSchema,
    label: 'unit',
  },
  {
    dir: path.join(REPO_ROOT, 'data/weapons'),
    schema: WeaponProfileSchema,
    label: 'weapon',
  },
  {
    dir: path.join(REPO_ROOT, 'data/lore'),
    schema: LoreAnnotationSchema,
    label: 'lore annotation',
  },
];

function collectJsonFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(dir, f));
}

function validateFile(
  filePath: string,
  schema: z.ZodType,
  label: string
): { ok: true } | { ok: false; errors: string[] } {
  const relative = path.relative(REPO_ROOT, filePath);
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return {
      ok: false,
      errors: [`${relative}: invalid JSON — ${(err as Error).message}`],
    };
  }

  const result = schema.safeParse(raw);
  if (result.success) {
    return { ok: true };
  }

  const errors = result.error.issues.map(
    (issue) => `${relative}: ${issue.path.join('.') || '(root)'} — ${issue.message}`
  );
  return { ok: false, errors };
}

function main(): void {
  let totalFiles = 0;
  let passed = 0;
  const allErrors: string[] = [];

  console.log('StatVault data corpus validation\n');

  for (const target of TARGETS) {
    const files = collectJsonFiles(target.dir);
    console.log(`  ${target.label}: ${files.length} file(s) in ${path.relative(REPO_ROOT, target.dir)}/`);

    for (const file of files) {
      totalFiles++;
      const result = validateFile(file, target.schema, target.label);
      if (result.ok) {
        passed++;
        console.log(`    ✓ ${path.basename(file)}`);
      } else {
        for (const err of result.errors) {
          console.log(`    ✗ ${err}`);
          allErrors.push(err);
        }
      }
    }
  }

  console.log(`\nResult: ${passed}/${totalFiles} files passed`);

  if (allErrors.length > 0) {
    console.error(`\n${allErrors.length} validation error(s):`);
    allErrors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  if (totalFiles === 0) {
    console.warn('\nWarning: no JSON files found to validate.');
  }

  console.log('\nAll data files valid.');
}

main();
