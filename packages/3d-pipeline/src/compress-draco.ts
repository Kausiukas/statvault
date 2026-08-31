/**
 * Google Draco Geometry Compression Pipeline
 * Applies 14-bit positional quantization and Edgebreaker topology compression.
 */

import { NodeIO } from '@gltf-transform/core';
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions';
import { draco, dedup, prune, reorder } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';

export interface DracoCompressionOptions {
  quantizePosition?: number; // default 14 bits
  quantizeNormal?: number;   // default 10 bits
  quantizeTexcoord?: number; // default 12 bits
  quantizeColor?: number;    // default 8 bits
  compressionLevel?: number; // 0-10, default 7
}

export async function compressGeometry(
  inputGlbPath: string,
  outputGlbPath: string,
  options: DracoCompressionOptions = {}
): Promise<{ inputPath: string; outputPath: string; success: boolean }> {
  console.log(`[3D-Pipeline] Ingesting master asset: ${inputGlbPath}`);

  const io = new NodeIO()
    .registerExtensions(KHRONOS_EXTENSIONS)
    .registerDependencies({
      'draco3d.encoder': await draco3d.createEncoderModule(),
    });

  const document = await io.read(inputGlbPath);

  // Apply optimizations
  await document.transform(
    prune(),
    dedup(),
    reorder({ encoder: await draco3d.createEncoderModule() }),
    draco({
      compressionLevel: options.compressionLevel ?? 7,
      quantizePosition: options.quantizePosition ?? 14,
      quantizeNormal: options.quantizeNormal ?? 10,
      quantizeTexcoord: options.quantizeTexcoord ?? 12,
      quantizeColor: options.quantizeColor ?? 8,
      quantizeGeneric: 12,
    })
  );

  await io.write(outputGlbPath, document);
  console.log(`[3D-Pipeline] Successfully wrote Draco-compressed asset to: ${outputGlbPath}`);

  return {
    inputPath: inputGlbPath,
    outputPath: outputGlbPath,
    success: true,
  };
}
