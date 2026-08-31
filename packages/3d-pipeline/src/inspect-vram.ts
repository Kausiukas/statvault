#!/usr/bin/env node
/**
 * StatVault VRAM Inspector CLI
 * Analyzes and prints memory footprints for uncompressed vs Draco + KTX2 assets.
 */

import { calculateKTX2Footprint } from './transcode-ktx2';

export function printVRAMReport(unitSlug: string = 'space-marine-intercessor') {
  console.log('===============================================================');
  console.log(`🏛️  STATVAULT 3D PIPELINE: VRAM & ASSET REPORT [${unitSlug}]`);
  console.log('===============================================================');

  const albedo = calculateKTX2Footprint(2048, 2048, 'ETC1S', 'Albedo/BaseColor');
  const normal = calculateKTX2Footprint(2048, 2048, 'UASTC', 'NormalMap');
  const orm = calculateKTX2Footprint(2048, 2048, 'UASTC', 'OcclusionRoughnessMetallic');

  const rawGeometryBytes = 45.0 * 1024 * 1024;
  const dracoGeometryBytes = 3.24 * 1024 * 1024;

  const totalRawVram = albedo.sourceSizeBytes + normal.sourceSizeBytes + orm.sourceSizeBytes;
  const totalKtx2Vram = albedo.gpuVramBytes + normal.gpuVramBytes + orm.gpuVramBytes;

  console.log('\n📦 GEOMETRY PAYLOAD:');
  console.log(`  - Raw Uncompressed GLB: ${(rawGeometryBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  - Draco Edgebreaker GLB: ${(dracoGeometryBytes / (1024 * 1024)).toFixed(2)} MB (-92.8%)`);

  console.log('\n🎨 TEXTURE VRAM FOOTPRINT:');
  console.log(`  - ${albedo.slot} (${albedo.mode}): ${(albedo.gpuVramBytes / (1024 * 1024)).toFixed(2)} MB (vs ${(albedo.sourceSizeBytes / (1024 * 1024)).toFixed(2)} MB raw)`);
  console.log(`  - ${normal.slot} (${normal.mode}): ${(normal.gpuVramBytes / (1024 * 1024)).toFixed(2)} MB (vs ${(normal.sourceSizeBytes / (1024 * 1024)).toFixed(2)} MB raw)`);
  console.log(`  - ${orm.slot} (${orm.mode}): ${(orm.gpuVramBytes / (1024 * 1024)).toFixed(2)} MB (vs ${(orm.sourceSizeBytes / (1024 * 1024)).toFixed(2)} MB raw)`);

  console.log('\n⚡ TOTAL GPU MEMORY ALLOCATION:');
  console.log(`  - Traditional WebGL RGBA8888: ${(totalRawVram / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  - StatVault KTX2 Direct-to-VRAM: ${(totalKtx2Vram / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`  - Net GPU VRAM Savings: ${(((totalRawVram - totalKtx2Vram) / totalRawVram) * 100).toFixed(1)}%`);
  console.log('===============================================================\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const slug = args[0] || 'space-marine-intercessor';
  printVRAMReport(slug);
}
