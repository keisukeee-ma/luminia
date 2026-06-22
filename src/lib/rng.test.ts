import { describe, it, expect } from "vitest";
import { mulberry32, randInt, pick, shuffle } from "./rng";

describe("rng", () => {
  it("同じ seed は同じ系列を返す（決定論）", () => {
    const a = mulberry32(12345);
    const b = mulberry32(12345);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("異なる seed は異なる系列を返す", () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(a()).not.toEqual(b());
  });

  it("randInt は両端を含む範囲に収まる", () => {
    const r = mulberry32(7);
    for (let i = 0; i < 1000; i++) {
      const v = randInt(r, 3, 9);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(9);
    }
  });

  it("pick は配列の要素を返す", () => {
    const r = mulberry32(7);
    const arr = ["a", "b", "c"];
    for (let i = 0; i < 50; i++) expect(arr).toContain(pick(r, arr));
  });

  it("shuffle は要素を保持する", () => {
    const r = mulberry32(7);
    const out = shuffle(r, [1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
