import { type RNG, pick } from "@/lib/rng";

export interface RotationShape {
  id: string;
  /** 100x100 viewBox 内の非対称ポリゴン（鏡像と回転が区別できる形）。 */
  points: string;
}

export const ROTATION_SHAPES: RotationShape[] = [
  { id: "F", points: "30,20 70,20 70,32 42,32 42,44 62,44 62,56 42,56 42,80 30,80" },
  { id: "L", points: "35,20 47,20 47,68 72,68 72,80 35,80" },
  { id: "P", points: "30,20 64,20 64,52 42,52 42,80 30,80" },
  { id: "S", points: "25,38 48,38 48,25 75,25 75,50 52,50 52,62 25,62" },
];

export const ROTATION_ANGLES = [0, 45, 90, 135, 180] as const;

export interface RotationItem {
  shapeId: string;
  points: string;
  angle: number;
  isMirror: boolean;
}

/** セッションで出題する問題数。 */
export const ROTATION_PLAN_LEN = 6;

export function genRotationItem(rng: RNG): RotationItem {
  const shape = pick(rng, ROTATION_SHAPES);
  const angle = pick(rng, ROTATION_ANGLES);
  const isMirror = rng() < 0.5;
  return { shapeId: shape.id, points: shape.points, angle, isMirror };
}
