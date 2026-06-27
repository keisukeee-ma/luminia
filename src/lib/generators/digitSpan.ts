import { type RNG, randInt } from "@/lib/rng";

export const DIGIT_SHOW_MS = 800;
export const DIGIT_GAP_MS = 200;

/** 固定長プラン: スパン3〜5を各2試行＝全員6試行（早期終了しない）。 */
export const DIGIT_SPAN_PLAN = [3, 3, 4, 4, 5, 5];

/** 同時提示の表示時間（ms）。系列が長いほど長く表示する。 */
export const spanDisplayMs = (span: number): number => 1000 + 500 * span;

export type SpanMode = "forward" | "backward";

/** 1234 / 9876 のような連続昇降（3つ以上）を含むか。 */
export function isTrivialRun(s: number[]): boolean {
  let inc = 1;
  let dec = 1;
  for (let i = 1; i < s.length; i++) {
    inc = s[i] === s[i - 1] + 1 ? inc + 1 : 1;
    dec = s[i] === s[i - 1] - 1 ? dec + 1 : 1;
    if (inc >= 3 || dec >= 3) return true;
  }
  return false;
}

/** 直前と同一桁を避け、自明な連続列を除外した数列。 */
export function genDigitSeq(rng: RNG, span: number): number[] {
  for (let attempt = 0; attempt < 100; attempt++) {
    const seq: number[] = [];
    while (seq.length < span) {
      const d = randInt(rng, 0, 9);
      if (seq.length && d === seq[seq.length - 1]) continue;
      seq.push(d);
    }
    if (!isTrivialRun(seq)) return seq;
  }
  // 念のためのフォールバック（span が小さいときはほぼ到達しない）
  return Array.from({ length: span }, (_, i) => (i * 3 + 1) % 10);
}

/** mode に応じた正答系列。 */
export function expected(seq: number[], mode: SpanMode): number[] {
  return mode === "backward" ? [...seq].reverse() : seq;
}

export function arrEq(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

/** 固定プランに沿って全試行分の系列を生成する（各要素が1試行）。 */
export function buildSpanTrials(rng: RNG): number[][] {
  return DIGIT_SPAN_PLAN.map((span) => genDigitSeq(rng, span));
}

/** 系列内の先頭から連続して正答した数（部分点）。 */
export function longestCorrectPrefix(ans: number[], target: number[]): number {
  let n = 0;
  for (let i = 0; i < Math.min(ans.length, target.length); i++) {
    if (ans[i] === target[i]) n++;
    else break;
  }
  return n;
}
