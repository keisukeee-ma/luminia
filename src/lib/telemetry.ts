export interface InputEvent {
  t: number; // 課題/設問の開始からの相対ミリ秒
  type: string; // "key" | "backspace" | "submit" | "choice" | "tap" 等
  value?: string | number;
}

export interface EventLog {
  push: (type: string, value?: string | number) => void;
  events: InputEvent[];
  reset: () => void;
}

/** performance.now() 基準で操作イベントを相対時刻付きで記録する。 */
export function createEventLog(): EventLog {
  let t0 = performance.now();
  const events: InputEvent[] = [];
  return {
    push(type, value) {
      events.push({ t: Math.round(performance.now() - t0), type, value });
    },
    events,
    reset() {
      events.length = 0;
      t0 = performance.now();
    },
  };
}

export interface DerivedMetrics {
  n_edits: number;
  time_to_first_ms: number | null;
  inter_response_ms: number[];
}

/** イベント列から派生指標（やり直し数・初回入力時刻・入力間隔）を計算する。 */
export function deriveMetrics(events: InputEvent[]): DerivedMetrics {
  const inputs = events.filter(
    (e) => e.type === "key" || e.type === "tap" || e.type === "choice",
  );
  const n_edits = events.filter(
    (e) => e.type === "backspace" || e.type === "edit",
  ).length;
  const time_to_first_ms = inputs.length ? inputs[0].t : null;
  const inter_response_ms: number[] = [];
  for (let i = 1; i < inputs.length; i++) {
    inter_response_ms.push(inputs[i].t - inputs[i - 1].t);
  }
  return { n_edits, time_to_first_ms, inter_response_ms };
}
