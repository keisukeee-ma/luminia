import { type RNG, randInt, pick, shuffle } from "@/lib/rng";

export type SeriesRule =
  | "arith"
  | "geom"
  | "quad"
  | "square"
  | "fib"
  | "interleave";

export const SERIES_FAMILY: Record<number, SeriesRule[]> = {
  1: ["arith"],
  2: ["geom"],
  3: ["quad", "square"],
  4: ["fib", "interleave"],
};

export interface SeriesItem {
  rule: SeriesRule;
  params: Record<string, number>;
  sequence: number[]; // 提示する5項
  answer: number; // 6項目
  options: number[]; // 4択（answer を含む）
  difficulty: number;
}

type P = Record<string, number>;

function computeTerms(rule: SeriesRule, p: P, n = 6): number[] {
  switch (rule) {
    case "arith":
      return Array.from({ length: n }, (_, i) => p.a0 + i * p.step);
    case "geom":
      return Array.from({ length: n }, (_, i) => p.a0 * Math.pow(p.r, i));
    case "square":
      return Array.from({ length: n }, (_, i) => Math.pow(i + p.k, 2) + p.c);
    case "quad": {
      const t = [p.a0];
      let d = p.d0;
      for (let i = 1; i < n; i++) {
        t.push(t[i - 1] + d);
        d += p.dd;
      }
      return t;
    }
    case "fib": {
      const t = [p.s0, p.s1];
      for (let i = 2; i < n; i++) t.push(t[i - 1] + t[i - 2]);
      return t;
    }
    case "interleave": {
      const out: number[] = [];
      for (let i = 0; i < n; i++) {
        const k = Math.floor(i / 2);
        out.push(i % 2 === 0 ? p.a0 + k * p.as : p.b0 + k * p.bs);
      }
      return out;
    }
  }
}

function sampleParams(rng: RNG, rule: SeriesRule): P {
  switch (rule) {
    case "arith":
      return { a0: randInt(rng, 1, 9), step: randInt(rng, 2, 9) };
    case "geom":
      return { a0: randInt(rng, 1, 3), r: pick(rng, [2, 3]) };
    case "square":
      return { k: randInt(rng, 1, 3), c: pick(rng, [0, 1, 2, 3]) };
    case "quad":
      return { a0: randInt(rng, 1, 5), d0: randInt(rng, 1, 4), dd: randInt(rng, 1, 3) };
    case "fib":
      return { s0: randInt(rng, 1, 4), s1: randInt(rng, 2, 6) };
    case "interleave":
      return {
        a0: randInt(rng, 1, 6),
        as: randInt(rng, 1, 4),
        b0: randInt(rng, 5, 15),
        bs: randInt(rng, 5, 12),
      };
  }
}

function genDistractors(terms: number[], answer: number, rng: RNG): number[] {
  const lastDiff = terms[4] - terms[3];
  const cand = [
    terms[4] + lastDiff, // 直前差分を等差として継続
    answer + lastDiff,
    answer - 1,
    answer + 1,
    answer + 2,
    terms[4] * 2, // 別opの誤適用
  ];
  const out: number[] = [];
  for (const c of cand) {
    if (
      Number.isInteger(c) &&
      c > 0 &&
      c <= 999 &&
      c !== answer &&
      !out.includes(c)
    ) {
      out.push(c);
    }
  }
  return shuffle(rng, out);
}

const valid = (terms: number[]) =>
  terms.every((t) => Number.isInteger(t) && t > 0 && t <= 999) &&
  new Set(terms).size >= 5;

/** 指定難易度の数列項目を生成。制約（正整数・answer≤999・自明解なし）を満たすまで再抽選。 */
export function genSeries(rng: RNG, difficulty: number): SeriesItem {
  const family = SERIES_FAMILY[difficulty] ?? SERIES_FAMILY[1];
  for (let attempt = 0; attempt < 300; attempt++) {
    const rule = pick(rng, family);
    const params = sampleParams(rng, rule);
    const terms = computeTerms(rule, params, 6);
    if (!valid(terms)) continue;
    const answer = terms[5];
    const distractors = genDistractors(terms, answer, rng);
    if (distractors.length < 3) continue;
    const options = shuffle(rng, [answer, ...distractors.slice(0, 3)]);
    return { rule, params, sequence: terms.slice(0, 5), answer, options, difficulty };
  }
  // フォールバック: 単純な等差
  const a0 = randInt(rng, 1, 9);
  const step = randInt(rng, 2, 9);
  const terms = computeTerms("arith", { a0, step }, 6);
  const answer = terms[5];
  const options = shuffle(rng, [answer, answer + step, answer - step, answer + 1]);
  return { rule: "arith", params: { a0, step }, sequence: terms.slice(0, 5), answer, options, difficulty };
}

/** セッションで出題する難易度の並び（6問）。 */
export const SERIES_PLAN = [1, 2, 2, 3, 3, 4];
