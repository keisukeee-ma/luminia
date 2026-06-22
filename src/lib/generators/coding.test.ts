import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/rng";
import { genCodingKey, nextSymbol, CODING_SYMBOLS } from "./coding";

describe("coding", () => {
  it("genCodingKey: 9記号が1-9へ全単射", () => {
    const rng = mulberry32(3);
    const key = genCodingKey(rng);
    expect(Object.keys(key).sort()).toEqual([...CODING_SYMBOLS].sort());
    expect(Object.values(key).sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("nextSymbol: 直前と重複しない", () => {
    const rng = mulberry32(9);
    let prev: string | null = null;
    for (let i = 0; i < 200; i++) {
      const s = nextSymbol(rng, prev);
      expect(s).not.toBe(prev);
      expect(CODING_SYMBOLS).toContain(s);
      prev = s;
    }
  });
});
