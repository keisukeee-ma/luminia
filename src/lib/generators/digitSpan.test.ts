import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/rng";
import {
  genDigitSeq,
  isTrivialRun,
  longestCorrectPrefix,
  expected,
  buildSpanTrials,
  DIGIT_SPAN_PLAN,
} from "./digitSpan";

describe("digitSpan", () => {
  it("genDigitSeq: 長さ正確・直前重複なし・自明列でない", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const rng = mulberry32(seed);
      for (const span of [3, 4, 5, 6, 7]) {
        const s = genDigitSeq(rng, span);
        expect(s).toHaveLength(span);
        for (let i = 1; i < s.length; i++) expect(s[i]).not.toBe(s[i - 1]);
        expect(isTrivialRun(s)).toBe(false);
      }
    }
  });

  it("isTrivialRun: 連続昇降を検出", () => {
    expect(isTrivialRun([1, 2, 3])).toBe(true);
    expect(isTrivialRun([9, 8, 7])).toBe(true);
    expect(isTrivialRun([4, 8, 2])).toBe(false);
  });

  it("expected: backward は逆順", () => {
    expect(expected([5, 1, 8], "backward")).toEqual([8, 1, 5]);
    expect(expected([5, 1, 8], "forward")).toEqual([5, 1, 8]);
  });

  it("longestCorrectPrefix: 先頭一致数", () => {
    expect(longestCorrectPrefix([4, 8, 1], [4, 8, 2])).toBe(2);
    expect(longestCorrectPrefix([1, 2], [3, 4])).toBe(0);
  });

  it("buildSpanTrials: 固定長6試行・各スパン2回・系列長一致", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const trials = buildSpanTrials(mulberry32(seed));
      expect(trials).toHaveLength(DIGIT_SPAN_PLAN.length);
      expect(trials).toHaveLength(6);
      trials.forEach((seq, i) => {
        expect(seq).toHaveLength(DIGIT_SPAN_PLAN[i]);
      });
      // スパン3〜5が各2回
      const counts: Record<number, number> = {};
      DIGIT_SPAN_PLAN.forEach((s) => (counts[s] = (counts[s] ?? 0) + 1));
      expect(counts).toEqual({ 3: 2, 4: 2, 5: 2 });
    }
  });
});
