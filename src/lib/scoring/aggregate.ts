import type { Trial, TaskScore } from "@/types/scoring";
import type { Ability } from "@/types/domain";

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function spanScore(trials: Trial[]): { maxSpan: number; partial: number } {
  let maxSpan = 0;
  let partial = 0;
  for (const t of trials) {
    const span = t.difficulty ?? 0;
    if (t.correct && span > maxSpan) maxSpan = span;
    const p = (t.extra?.partial as number) ?? 0;
    if (p > partial) partial = p;
  }
  return { maxSpan, partial };
}

/** 1課題分の trials を TaskScore に集計する。 */
export function aggregateTask(taskId: string, trials: Trial[]): TaskScore {
  const ability = (trials[0]?.ability ?? "Gs") as Ability;
  const completed = trials.length > 0;

  switch (taskId) {
    case "Gs_coding": {
      const nCorrect = trials.filter((t) => t.correct).length;
      const rts = trials
        .filter((t) => t.correct && typeof t.rt_ms === "number")
        .map((t) => t.rt_ms as number);
      return {
        task_id: taskId,
        ability,
        raw_score: nCorrect,
        metrics: {
          n_attempted: trials.length,
          accuracy: trials.length ? nCorrect / trials.length : 0,
          rt_median: median(rts),
        },
        completed,
      };
    }
    case "Gsm_digit_forward":
    case "Gsm_digit_backward": {
      const { maxSpan, partial } = spanScore(trials);
      return {
        task_id: taskId,
        ability,
        raw_score: maxSpan,
        metrics: { max_span: maxSpan, partial },
        completed,
      };
    }
    case "Gf_series": {
      let num = 0;
      let den = 0;
      for (const t of trials) {
        const w = t.difficulty ?? 1;
        den += w;
        if (t.correct) num += w;
      }
      const weighted = den ? num / den : 0;
      return {
        task_id: taskId,
        ability,
        raw_score: weighted,
        metrics: {
          weighted_accuracy: weighted,
          accuracy: trials.length
            ? trials.filter((t) => t.correct).length / trials.length
            : 0,
        },
        completed,
      };
    }
    default: {
      const nCorrect = trials.filter((t) => t.correct).length;
      return { task_id: taskId, ability, raw_score: nCorrect, completed };
    }
  }
}

/** 全 trials を task_id ごとに集計する。 */
export function aggregateAll(trials: Trial[]): TaskScore[] {
  const byTask = new Map<string, Trial[]>();
  for (const t of trials) {
    const arr = byTask.get(t.task_id) ?? [];
    arr.push(t);
    byTask.set(t.task_id, arr);
  }
  return [...byTask.entries()].map(([taskId, ts]) => aggregateTask(taskId, ts));
}
