import type { Ability } from "./domain";

/** 項目レベルの生ログ（最重要）。生成型は params に生成パラメータを保存する。 */
export interface Trial {
  task_id: string;
  ability: Ability;
  ordinal: number;
  difficulty?: number;
  item_id?: string;
  params?: unknown;
  response: unknown;
  correct: boolean | null; // 非採点（学習等）は null
  rt_ms: number | null;
  input_method?: "touch" | "mouse" | "key";
  extra?: Record<string, unknown>;
}

/** 課題ごとの集計スコア。 */
export interface TaskScore {
  task_id: string;
  ability: Ability;
  raw_score: number;
  metrics?: Record<string, number>;
  completed: boolean;
}

/** 能力ごとの偏差値。 */
export interface AbilityScore {
  ability: Ability;
  raw_composite: number;
  z_age: number;
  t_age: number;
  z_overall: number;
  t_overall: number;
  norm_version: string;
}

/** セッション結果（脳年齢）。 */
export interface SessionResult {
  brain_age: number | null;
  brain_age_delta: number | null;
  fluid_composite_z: number | null;
  gc_z: number | null;
  model_version: string;
}

/** computeScores の出力。 */
export interface ComputedScores {
  tasks: TaskScore[];
  abilities: AbilityScore[];
  result: SessionResult;
}
