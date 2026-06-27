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
