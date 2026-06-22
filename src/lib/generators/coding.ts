import { type RNG, pick, shuffle } from "@/lib/rng";

export const CODING_SYMBOLS = ["○", "△", "□", "◇", "▽", "☆", "＋", "∽", "≡"] as const;
export type CodingKey = Record<string, number>;

export const CODING_DURATION_MS = 30000;

/** 記号↔数字(1-9)の対応表。セッション毎にシャッフル（難易度は不変・練習効果を抑制）。 */
export function genCodingKey(rng: RNG): CodingKey {
  const syms = shuffle(rng, [...CODING_SYMBOLS]);
  const map: CodingKey = {};
  syms.forEach((s, i) => (map[s] = i + 1));
  return map;
}

/** 直前と重複しない記号を1つ返す。 */
export function nextSymbol(rng: RNG, prev: string | null): string {
  let s: string;
  do {
    s = pick(rng, CODING_SYMBOLS);
  } while (s === prev);
  return s;
}
