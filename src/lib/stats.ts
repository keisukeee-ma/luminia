/** 標準正規分布の累積分布関数 P(Z ≤ z)（Abramowitz & Stegun 近似）。 */
export function normalCdf(z: number): number {
  if (z < 0) return 1 - normalCdf(-z);
  const b1 = 0.319381530;
  const b2 = -0.356563782;
  const b3 = 1.781477937;
  const b4 = -1.821255978;
  const b5 = 1.330274429;
  const p = 0.2316419;
  const c = 0.39894228;
  const t = 1 / (1 + p * z);
  return 1 - c * Math.exp((-z * z) / 2) * t * (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1);
}

/** 偏差値 T(平均50・SD10) を百分位（0〜100）に変換。 */
export function tToPercentile(t: number): number {
  return normalCdf((t - 50) / 10) * 100;
}

/** 偏差値 T の「上位◯%」。 */
export function tToTopPercent(t: number): number {
  return 100 - tToPercentile(t);
}

/**
 * 実ヒストグラム（buckets[1..12], 各 [20+5(i-1), 20+5i) の人数）から、
 * userT 以上の割合（＝上位◯%）を返す。ユーザーが属するバケット内は線形補間。
 */
export function topPercentFromHistogram(
  buckets: number[],
  total: number,
  userT: number
): number {
  if (total <= 0) return tToTopPercent(userT);
  const tClamped = Math.max(20, Math.min(80, userT));
  const pos = (tClamped - 20) / 5; // 0..12（バケット境界基準）
  const userBucket = Math.max(1, Math.min(12, Math.ceil(pos) || 1));
  const frac = pos - (userBucket - 1); // バケット内の位置 0..1

  let atOrAbove = 0;
  for (let i = userBucket + 1; i <= 12; i++) atOrAbove += buckets[i] ?? 0;
  // ユーザーのバケットは上側 (1-frac) ぶんを「自分以上」と数える
  atOrAbove += (buckets[userBucket] ?? 0) * (1 - frac);

  return Math.max(0, Math.min(100, (atOrAbove / total) * 100));
}
