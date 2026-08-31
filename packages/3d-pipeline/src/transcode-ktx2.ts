/**
 * Basis Universal KTX2 Texture Transcoder Pipeline
 * Applies UASTC encoding to Normal/ORM maps and ETC1S to Color/Albedo maps.
 */

export interface TextureTranscodeTarget {
  slot: 'albedo' | 'normal' | 'metallicRoughness' | 'occlusion' | 'emissive';
  sourceFormat: 'png' | 'jpg';
  mode: 'ETC1S' | 'UASTC';
  targetResolution: [number, number];
}

export interface KTX2TranscodeResult {
  slot: string;
  mode: 'ETC1S' | 'UASTC';
  sourceSizeBytes: number;
  compressedSizeBytes: number;
  gpuVramBytes: number;
  reductionPercentage: string;
}

/**
 * Simulates texture transcoding metrics and computes accurate direct-to-VRAM sizes
 */
export function calculateKTX2Footprint(
  width: number,
  height: number,
  mode: 'ETC1S' | 'UASTC',
  slot: string
): KTX2TranscodeResult {
  const mipmapFactor = 4 / 3;
  const uncompressedBytes = width * height * 4 * mipmapFactor; // RGBA8888 + Mipmaps

  let compressedSizeBytes = 0;
  let gpuVramBytes = 0;

  if (mode === 'ETC1S') {
    // High transmission compression, transcodes to BC1/ETC1/ASTC in GPU
    compressedSizeBytes = Math.round(width * height * 0.18); // ~0.18 bytes/pixel over wire
    gpuVramBytes = Math.round(width * height * 0.5 * mipmapFactor); // 4 bpp (BC1/ETC1)
  } else {
    // UASTC: High fidelity for normals/roughness, transcodes to BC7/ASTC 4x4
    compressedSizeBytes = Math.round(width * height * 0.95); // ~0.95 bytes/pixel over wire
    gpuVramBytes = Math.round(width * height * 1.0 * mipmapFactor); // 8 bpp (BC7/ASTC 4x4)
  }

  const reduction = (((uncompressedBytes - gpuVramBytes) / uncompressedBytes) * 100).toFixed(1);

  return {
    slot,
    mode,
    sourceSizeBytes: Math.round(uncompressedBytes),
    compressedSizeBytes,
    gpuVramBytes,
    reductionPercentage: `${reduction}%`,
  };
}
