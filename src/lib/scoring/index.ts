import type { SessionState } from "@/lib/session";
import type { ComputedScores } from "@/types/scoring";
import { AGE_BAND_MID } from "@/types/domain";
import { aggregateAll } from "./aggregate";
import { standardize } from "./standardize";
import { computeBrainAge } from "./brainAge";

/** trials → task → ability → 脳年齢 のパイプライン。途中終了でも算出可能。 */
export function computeScores(session: SessionState): ComputedScores {
  const ageMid = AGE_BAND_MID[session.profile.age_band];
  const tasks = aggregateAll(session.trials);
  const abilities = standardize(tasks, ageMid);
  const result = computeBrainAge(abilities, ageMid);
  return { tasks, abilities, result };
}

export { MODEL_VERSION } from "./brainAge";
