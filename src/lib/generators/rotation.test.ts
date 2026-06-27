import { describe, it, expect } from "vitest";
import { mulberry32 } from "@/lib/rng";
import { genRotationItem, ROTATION_ANGLES, ROTATION_SHAPES } from "./rotation";

describe("genRotationItem", () => {
  it("角度は許容値・shape は既知・points を持つ", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const it = genRotationItem(mulberry32(seed));
      expect(ROTATION_ANGLES).toContain(it.angle as (typeof ROTATION_ANGLES)[number]);
      expect(typeof it.isMirror).toBe("boolean");
      expect(ROTATION_SHAPES.some((s) => s.id === it.shapeId)).toBe(true);
      expect(it.points.length).toBeGreaterThan(0);
    }
  });
});
