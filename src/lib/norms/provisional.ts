/**
 * 暫定規準 v0（文献ベースの近似）。
 * 各課題について 若年成人(refAge)の平均・SD と 年間変化量(slopePerYear) を定義し、
 * 任意の代表年齢の平均を線形補間する。実データ蓄積後に Supabase の norms へ置き換える。
 */
export const NORM_VERSION = "v0";

/** 全体（年齢非依存）比較の基準とする母集団代表年齢。 */
export const POP_REF_AGE = 45;

interface NormSpec {
  refAge: number;
  mean: number; // refAge での平均
  sd: number;
  slopePerYear: number; // 加齢1年あたりの平均変化（流動系は負）
  higherIsBetter: boolean;
}

const NORMS: Record<string, NormSpec> = {
  // 記号変換: 30秒あたりの正答数
  Gs_coding: { refAge: 22, mean: 55, sd: 12, slopePerYear: -0.35, higherIsBetter: true },
  // 数唱（順唱）: 固定6試行の正答数（0〜6・同時提示）
  Gsm_digit_forward: { refAge: 22, mean: 5.5, sd: 0.8, slopePerYear: -0.02, higherIsBetter: true },
  // 逆唱: 固定6試行の正答数（0〜6・同時提示）
  Gsm_digit_backward: { refAge: 22, mean: 4.5, sd: 1.0, slopePerYear: -0.025, higherIsBetter: true },
  // 数列完成: 難易度重み付き正答率（0..1）
  Gf_series: { refAge: 22, mean: 0.7, sd: 0.18, slopePerYear: -0.005, higherIsBetter: true },
  // 心的回転: 正答率（0..1）
  Gv_rotation: { refAge: 22, mean: 0.85, sd: 0.12, slopePerYear: -0.004, higherIsBetter: true },
  // 知識（語彙・一般知識・ことわざ）: 難易度重み付き正答率（0..1・加齢で安定〜微増）
  Gc_knowledge: { refAge: 22, mean: 0.7, sd: 0.15, slopePerYear: 0.002, higherIsBetter: true },
  // 単語再認: 正答数（0〜12）
  Glr_recognition: { refAge: 22, mean: 10.5, sd: 1.5, slopePerYear: -0.04, higherIsBetter: true },
};

export interface NormPoint {
  mean: number;
  sd: number;
  higherIsBetter: boolean;
}

/** task と代表年齢から規準点を返す。未定義 task は null。 */
export function getNorm(taskId: string, ageMid: number): NormPoint | null {
  const s = NORMS[taskId];
  if (!s) return null;
  const mean = s.mean + s.slopePerYear * (ageMid - s.refAge);
  return { mean, sd: s.sd, higherIsBetter: s.higherIsBetter };
}

export function hasNorm(taskId: string): boolean {
  return taskId in NORMS;
}
