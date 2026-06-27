import { describe, it, expect } from "vitest";
import { normalCdf, tToPercentile, tToTopPercent } from "./stats";

describe("stats", () => {
  it("normalCdf: 既知値に近い", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 3);
    expect(normalCdf(1)).toBeCloseTo(0.8413, 2);
    expect(normalCdf(-1)).toBeCloseTo(0.1587, 2);
    expect(normalCdf(1.96)).toBeCloseTo(0.975, 2);
  });

  it("tToPercentile / tToTopPercent", () => {
    expect(tToPercentile(50)).toBeCloseTo(50, 1);
    expect(tToTopPercent(50)).toBeCloseTo(50, 1);
    expect(tToTopPercent(60)).toBeLessThan(20); // 偏差値60は上位16%程度
  });
});
