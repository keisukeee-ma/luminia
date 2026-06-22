import type { AbilityScore, SessionResult } from "@/types/scoring";
import { FLUID_ABILITIES } from "@/types/domain";
import { POP_REF_AGE } from "@/lib/norms/provisional";

export const MODEL_VERSION = "brain_age_v0";

/** 1 SD の流動系差をおよそ何年に対応させるか（暫定）。 */
const YEARS_PER_SD = 12;

/**
 * 流動系コンポジット（全体比 z の平均）から暫定脳年齢を推定する。
 * 全体比 z が高い（母集団平均より良い）ほど若い脳年齢になる。
 */
export function computeBrainAge(abilities: AbilityScore[], ageMid: number): SessionResult {
  const fluid = abilities.filter((a) => FLUID_ABILITIES.includes(a.ability));
  const gc = abilities.find((a) => a.ability === "Gc");

  if (fluid.length === 0) {
    return {
      brain_age: null,
      brain_age_delta: null,
      fluid_composite_z: null,
      gc_z: gc?.z_overall ?? null,
      model_version: MODEL_VERSION,
    };
  }

  const z = fluid.reduce((s, a) => s + a.z_overall, 0) / fluid.length;
  const raw = POP_REF_AGE - YEARS_PER_SD * z;
  const brainAge = Math.round(Math.max(15, Math.min(85, raw)));

  return {
    brain_age: brainAge,
    brain_age_delta: brainAge - ageMid,
    fluid_composite_z: z,
    gc_z: gc?.z_overall ?? null,
    model_version: MODEL_VERSION,
  };
}
