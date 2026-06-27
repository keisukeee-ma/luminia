import type { SessionState } from "@/lib/session";
import type { AbilityScore, ComputedScores } from "@/types/scoring";
import type { Ability } from "@/types/domain";
import { AGE_BAND_MID } from "@/types/domain";
import { aggregateAll } from "./aggregate";
import { standardize } from "./standardize";
import { computeBrainAge } from "./brainAge";

const ALL_ABILITIES: Ability[] = ["Gs", "Gsm", "Gf", "Gv", "Glr", "Gc"];

/** trials → task → ability → 脳年齢 のパイプライン。途中終了でも算出可能。 */
export function computeScores(session: SessionState): ComputedScores {
  const ageMid = AGE_BAND_MID[session.profile.age_band];
  const tasks = aggregateAll(session.trials);
  const measured = standardize(tasks, ageMid);

  // 未計測の能力を「測定不能」プレースホルダーで補完し、表示順を固定
  const measuredMap = new Map(measured.map((a) => [a.ability, a]));
  const abilities: AbilityScore[] = ALL_ABILITIES.map(
    (ab) =>
      measuredMap.get(ab) ?? {
        ability: ab,
        raw_composite: 0,
        z_age: 0,
        t_age: 0,
        z_overall: 0,
        t_overall: 0,
        norm_version: "v0",
        notMeasured: true,
      }
  );

  const result = computeBrainAge(measured, ageMid); // 測定済み分のみで脳年齢計算
  return { tasks, abilities, result };
}

export { MODEL_VERSION } from "./brainAge";
