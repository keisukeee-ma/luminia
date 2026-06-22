import type { TaskScore, AbilityScore } from "@/types/scoring";
import type { Ability } from "@/types/domain";
import { getNorm, NORM_VERSION, POP_REF_AGE } from "@/lib/norms/provisional";

/** task 生スコアを規準点で z 化（higherIsBetter=false なら符号反転）。 */
function zForTask(task: TaskScore, ageMid: number): number | null {
  const n = getNorm(task.task_id, ageMid);
  if (!n) return null;
  let z = (task.raw_score - n.mean) / n.sd;
  if (!n.higherIsBetter) z = -z;
  return z;
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/** task スコア群を能力ごとの偏差値に変換する。 */
export function standardize(tasks: TaskScore[], ageMid: number): AbilityScore[] {
  const byAbility = new Map<Ability, { age: number[]; overall: number[] }>();

  for (const t of tasks) {
    const zAge = zForTask(t, ageMid);
    const zOverall = zForTask(t, POP_REF_AGE);
    if (zAge === null || zOverall === null) continue;
    const e = byAbility.get(t.ability) ?? { age: [], overall: [] };
    e.age.push(zAge);
    e.overall.push(zOverall);
    byAbility.set(t.ability, e);
  }

  const out: AbilityScore[] = [];
  for (const [ability, e] of byAbility) {
    if (e.age.length === 0) continue;
    const zAge = mean(e.age);
    const zOverall = mean(e.overall);
    out.push({
      ability,
      raw_composite: zAge,
      z_age: zAge,
      t_age: 50 + 10 * zAge,
      z_overall: zOverall,
      t_overall: 50 + 10 * zOverall,
      norm_version: NORM_VERSION,
    });
  }
  return out;
}
