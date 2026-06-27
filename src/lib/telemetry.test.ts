import { describe, it, expect } from "vitest";
import { deriveMetrics, type InputEvent } from "./telemetry";

describe("deriveMetrics", () => {
  it("やり直し数・初回入力・入力間隔を計算", () => {
    const events: InputEvent[] = [
      { t: 500, type: "key", value: 4 },
      { t: 800, type: "key", value: 8 },
      { t: 900, type: "backspace" },
      { t: 1100, type: "key", value: 2 },
      { t: 1300, type: "submit" },
    ];
    const m = deriveMetrics(events);
    expect(m.n_edits).toBe(1); // backspace 1回
    expect(m.time_to_first_ms).toBe(500);
    expect(m.inter_response_ms).toEqual([300, 300]); // 500→800→1100（submit/backspaceは入力に数えない）
  });

  it("入力なしなら time_to_first は null", () => {
    const m = deriveMetrics([{ t: 10, type: "submit" }]);
    expect(m.time_to_first_ms).toBeNull();
    expect(m.inter_response_ms).toEqual([]);
    expect(m.n_edits).toBe(0);
  });
});
