import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/rng";
import { genSeries } from "./series";

describe("genSeries", () => {
  it("全難易度・多シードで制約を満たす", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const rng = mulberry32(seed);
      for (const diff of [1, 2, 3, 4]) {
        const it = genSeries(rng, diff);
        // 5項提示
        expect(it.sequence).toHaveLength(5);
        // 4択・answer を含む・全て相異
        expect(it.options).toHaveLength(4);
        expect(it.options).toContain(it.answer);
        expect(new Set(it.options).size).toBe(4);
        // 全項が正整数 ≤ 999
        for (const v of [...it.sequence, it.answer]) {
          expect(Number.isInteger(v)).toBe(true);
          expect(v).toBeGreaterThan(0);
          expect(v).toBeLessThanOrEqual(999);
        }
      }
    }
  });
});
