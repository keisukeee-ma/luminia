export type RNG = () => number;

/** mulberry32: シード付き決定論的乱数（生成型課題の再現に使う）。 */
export function mulberry32(seed: number): RNG {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 両端を含む整数。 */
export const randInt = (rng: RNG, lo: number, hi: number): number =>
  lo + Math.floor(rng() * (hi - lo + 1));

export const pick = <T>(rng: RNG, arr: readonly T[]): T =>
  arr[Math.floor(rng() * arr.length)];

/** Fisher–Yates（配列を破壊的にシャッフルして返す）。 */
export function shuffle<T>(rng: RNG, a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** セッション seed とステップ index から課題ごとの seed を導出する。 */
export const stepSeed = (seed: number, stepIndex: number): number =>
  (seed ^ Math.imul(stepIndex + 1, 2654435761)) >>> 0;
