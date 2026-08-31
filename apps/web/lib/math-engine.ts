/**
 * StatVault Tactical Math Engine (Warcore RTS & Lore Canon)
 * Implements continuous damage mitigation, Effective Health Points (EHP),
 * Time-to-Kill (TTK), and volley threshold dynamics.
 */

export interface DefenderParams {
  hp: number;
  armor: number;
  modelCount?: number;
}

export interface AttackerParams {
  baseDamage: number;
  armorPenetration: number;
  attacksPerSecond: number;
  accuracyPercent?: number;
  modelCount?: number;
}

export interface CombatSimulationResult {
  effectiveArmor: number;
  mitigationRatio: number;
  mitigationPercentFormatted: string;
  ehp: number;
  ehpPerModel: number;
  nominalDps: number;
  effectiveDps: number;
  timeToKillSeconds: number;
  volleysToKill: number;
  decayTimeline: Array<{ timeSeconds: number; remainingHp: number; remainingPercent: number }>;
}

/**
 * Calculates Effective Armor mitigation ratio:
 * Mitigation = max(0, A - AP) / (100 + max(0, A - AP))
 */
export function calculateArmorMitigation(armor: number, armorPenetration: number): number {
  const netArmor = Math.max(0, armor - armorPenetration);
  return netArmor / (100 + netArmor);
}

/**
 * Calculates Effective Health Points (EHP):
 * EHP = HP / (1 - Mitigation) = HP * (1 + max(0, A - AP) / 100)
 */
export function calculateEHP(hp: number, armor: number, armorPenetration: number): number {
  const netArmor = Math.max(0, armor - armorPenetration);
  return hp * (1 + netArmor / 100);
}

/**
 * Calculates continuous Time-to-Kill (TTK) and generates dynamic health decay curve
 */
export function simulateCombatEngagement(
  defender: DefenderParams,
  attacker: AttackerParams,
  maxSimDurationSeconds: number = 30
): CombatSimulationResult {
  const accuracy = (attacker.accuracyPercent ?? 100) / 100;
  const attModels = attacker.modelCount ?? 1;
  const defModels = defender.modelCount ?? 1;

  const netArmor = Math.max(0, defender.armor - attacker.armorPenetration);
  const mitigationRatio = netArmor / (100 + netArmor);
  const ehp = defender.hp * (1 + netArmor / 100);
  const ehpPerModel = ehp / defModels;

  const nominalDps = attacker.baseDamage * attacker.attacksPerSecond * accuracy * attModels;
  const effectiveDps = nominalDps * (1 - mitigationRatio);

  const timeToKillSeconds = effectiveDps > 0 ? Number((defender.hp / effectiveDps).toFixed(2)) : Infinity;
  const damagePerVolley = attacker.baseDamage * (1 - mitigationRatio) * accuracy * attModels;
  const volleysToKill = damagePerVolley > 0 ? Math.ceil(defender.hp / damagePerVolley) : Infinity;

  // Generate decay timeline (0.5s intervals)
  const decayTimeline: Array<{ timeSeconds: number; remainingHp: number; remainingPercent: number }> = [];
  const step = 0.5;
  const stepsCount = Math.min(maxSimDurationSeconds / step, Math.ceil((timeToKillSeconds + 1) / step));

  for (let i = 0; i <= stepsCount; i++) {
    const t = Number((i * step).toFixed(1));
    const currentHp = Math.max(0, defender.hp - effectiveDps * t);
    const percent = Number(((currentHp / defender.hp) * 100).toFixed(1));

    decayTimeline.push({
      timeSeconds: t,
      remainingHp: Math.round(currentHp),
      remainingPercent: percent,
    });

    if (currentHp <= 0) break;
  }

  return {
    effectiveArmor: netArmor,
    mitigationRatio,
    mitigationPercentFormatted: `${(mitigationRatio * 100).toFixed(1)}%`,
    ehp: Math.round(ehp),
    ehpPerModel: Math.round(ehpPerModel),
    nominalDps: Number(nominalDps.toFixed(1)),
    effectiveDps: Number(effectiveDps.toFixed(1)),
    timeToKillSeconds,
    volleysToKill,
    decayTimeline,
  };
}
