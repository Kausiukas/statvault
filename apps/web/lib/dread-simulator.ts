/**
 * Transhuman Dread & Tactical Velocity Simulator
 * Models closing time differentials and psychological suppression decay.
 */

export interface SpeedSimInput {
  distanceMeters: number;
  terrainObstacleFactor: number; // 1.0 (open) to 2.5 (dense ruins)
  unitLoreVelocityMps: number;   // e.g. 24.5 m/s for Astartes
  unitEngineVelocityMps: number; // e.g. 5.8 m/s in-engine
  unitMassKg?: number;           // e.g. 450 kg
  baseDreadFactor?: number;      // e.g. 0.85
}

export interface SpeedSimOutput {
  loreClosingTimeSeconds: number;
  engineClosingTimeSeconds: number;
  compressionRatio: number;
  psychologicalDreadIntensity: number; // 0.0 to 1.0
  aimDisruptionPercent: number;        // e.g. 45%
  moraleDecayPerSecond: number;        // e.g. 3.5 morale/sec
  timeToMoraleFailureSeconds: number;  // Time until unaugmented troops rout
}

/**
 * Calculates closing time:
 * t = distance / (velocity * (1 / terrainFactor))
 */
export function computeClosingTimes(input: SpeedSimInput): SpeedSimOutput {
  const terrainMod = Math.max(1.0, input.terrainObstacleFactor);
  const effectiveLoreSpeed = input.unitLoreVelocityMps / terrainMod;
  const effectiveEngineSpeed = input.unitEngineVelocityMps / terrainMod;

  const loreClosingTime = Number((input.distanceMeters / effectiveLoreSpeed).toFixed(2));
  const engineClosingTime = Number((input.distanceMeters / effectiveEngineSpeed).toFixed(2));
  const compressionRatio = Number((engineClosingTime / loreClosingTime).toFixed(2));

  // Transhuman Dread Calculation
  const baseDread = input.baseDreadFactor ?? 0.85;
  const massRatio = Math.cbrt((input.unitMassKg ?? 450) / 80.0);
  const speedRatio = input.unitLoreVelocityMps / 4.5;
  const auraRadius = 75.0; // meters

  // Distance attenuation
  const distRatio = Math.min(2.0, input.distanceMeters / auraRadius);
  const distanceAttenuation = Math.exp(-1.65 * distRatio);

  const dreadScaling = 1.0 + 0.25 * speedRatio * massRatio;
  const dreadIntensity = Math.min(1.0, Number((baseDread * distanceAttenuation * dreadScaling * 0.4).toFixed(3)));

  const aimDisruption = Math.min(85, Math.round(dreadIntensity * 60));
  const moraleDecay = Number((dreadIntensity * 4.2).toFixed(2));
  const timeToFailure = moraleDecay > 0 ? Number((50.0 / moraleDecay).toFixed(1)) : Infinity;

  return {
    loreClosingTimeSeconds: loreClosingTime,
    engineClosingTimeSeconds: engineClosingTime,
    compressionRatio,
    psychologicalDreadIntensity: dreadIntensity,
    aimDisruptionPercent: aimDisruption,
    moraleDecayPerSecond: moraleDecay,
    timeToMoraleFailureSeconds: timeToFailure,
  };
}
