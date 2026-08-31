/**
 * Unit Performance Index (UPI) Vector Normalization
 * Projects multi-dimensional tactical metrics onto a 6-axis 0-100 radar coordinate space.
 */

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

export interface UPIRadarVector {
  ehp: number;
  mobility: number;
  burstDmg: number;
  sustainedDps: number;
  utility: number;
  mass: number;
}

export function computeUPIScores(raw: RawUnitMetrics): UPIRadarVector {
  // 1. Effective Health Points (EHP) logarithmic normalization
  const netEHP = raw.hp * (1 + Math.max(0, raw.armor - 20) / 100);
  const normEHP = Math.min(100, Math.max(5, (Math.log10(Math.max(100, netEHP)) - 2.5) * 50));

  // 2. Mobility normalization (3.5 m/s to 25.0 m/s)
  const normMobility = Math.min(100, Math.max(10, (raw.speedMps / 25.0) * 85 + (raw.acceleration / 10.0) * 15));

  // 3. Burst Damage (0 - 4,000 damage window)
  const normBurst = Math.min(100, Math.max(5, (raw.burstDmg3s / 4000) * 100));

  // 4. Sustained DPS (0 - 800 DPS)
  const normSustained = Math.min(100, Math.max(5, (raw.sustainedDps / 800) * 100));

  // 5. Utility (Leadership + Aura radius)
  const normUtility = Math.min(100, ((raw.leadership / 100) * 60) + ((raw.auraRadiusM / 100) * 40));

  // 6. Mass & Knockback resistance (80kg human to 15,000kg engine)
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
