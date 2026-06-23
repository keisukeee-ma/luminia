"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import Feedback from "@/components/Feedback";
import { mulberry32 } from "@/lib/rng";
import {
  genDigitSeq,
  expected,
  arrEq,
  longestCorrectPrefix,
  SPAN_START,
  DIGIT_SHOW_MS,
  DIGIT_GAP_MS,
  MAX_STRIKES,
  type SpanMode,
} from "@/lib/generators/digitSpan";
import type { Trial } from "@/types/scoring";

type Phase = "ready" | "show" | "recall";

export default function Gsm_DigitSpan({
  mode,
  seed,
  onComplete,
}: {
  mode: SpanMode;
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const taskId = mode === "backward" ? "Gsm_digit_backward" : "Gsm_digit_forward";

  const [phase, setPhase] = useState<Phase>("ready");
  const [seq, setSeq] = useState<number[]>([]);
  const [showIdx, setShowIdx] = useState(-1);
  const [input, setInput] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<boolean | null>(null);

  const rngRef = useRef(mulberry32(seed));
  const trialsRef = useRef<Trial[]>([]);
  const ordinalRef = useRef(0);
  const spanRef = useRef(SPAN_START);
  const strikesRef = useRef(0);
  const doneRef = useRef(false);

  const start = () => {
    spanRef.current = SPAN_START;
    strikesRef.current = 0;
    ordinalRef.current = 0;
    trialsRef.current = [];
    doneRef.current = false;
    setSeq(genDigitSeq(rngRef.current, SPAN_START));
    setInput([]);
    setPhase("show");
  };

  // 提示シーケンス
  useEffect(() => {
    if (phase !== "show" || seq.length === 0) return;
    let i = 0;
    const timers: number[] = [];
    const step = () => {
      if (i >= seq.length) {
        setShowIdx(-1);
        timers.push(window.setTimeout(() => setPhase("recall"), 250));
        return;
      }
      setShowIdx(i);
      timers.push(
        window.setTimeout(() => {
          setShowIdx(-1);
          timers.push(
            window.setTimeout(() => {
              i++;
              step();
            }, DIGIT_GAP_MS),
          );
        }, DIGIT_SHOW_MS),
      );
    };
    step();
    return () => timers.forEach(clearTimeout);
  }, [phase, seq]);

  const submit = () => {
    if (phase !== "recall" || input.length === 0 || doneRef.current) return;
    const target = expected(seq, mode);
    const correct = arrEq(input, target);
    const partial = longestCorrectPrefix(input, target);
    trialsRef.current.push({
      task_id: taskId,
      ability: "Gsm",
      ordinal: ordinalRef.current++,
      difficulty: spanRef.current,
      response: [...input],
      correct,
      rt_ms: null,
      extra: { span: spanRef.current, partial, mode },
    });
    if (correct) {
      spanRef.current += 1;
      strikesRef.current = 0;
    } else {
      strikesRef.current += 1;
    }
    setFeedback(correct);
    setPhase("ready"); // 入力受付を止める一時状態
    window.setTimeout(() => {
      setFeedback(null);
      setInput([]);
      if (!correct && strikesRef.current >= MAX_STRIKES) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setSeq(genDigitSeq(rngRef.current, spanRef.current));
      setPhase("show");
    }, 600);
  };

  // キーボード入力（数字・Backspace・Enter）
  useEffect(() => {
    if (phase !== "recall") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        setInput((p) => [...p, Number(e.key)]);
      } else if (e.key === "Backspace") {
        setInput((p) => p.slice(0, -1));
      } else if (e.key === "Enter") {
        submit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // submit は input/seq に依存するため deps に含める
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, input, seq]);

  if (phase === "ready" && seq.length === 0) {
    return (
      <ReadyScreen
        title={mode === "backward" ? "逆唱" : "数唱"}
        description={
          mode === "backward" ? (
            <>表示される数字を覚えて、見た順番の<span className="text-ink font-body">逆</span>から入力してください。正解すると桁数が増えます。</>
          ) : (
            <>表示される数字を覚えて、見た<span className="text-ink font-body">順番のまま</span>入力してください。正解すると桁数が増えます。</>
          )
        }
        example={
          <p className="text-muted text-base">
            {mode === "backward" ? "例: 5 1 8 → 「8 1 5」と入力" : "例: 4 8 2 → 「4 8 2」と入力"}
            <br />
            （ボタン、またはキーボードの数字でも入力できます）
          </p>
        }
        onStart={start}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      <Feedback feedback={feedback} />

      {phase === "show" && (
        <div className="flex flex-col items-center">
          <p className="text-lg text-muted mb-6">覚えてください</p>
          <div className="font-data text-ink" style={{ fontSize: 96, lineHeight: 1, minHeight: 100 }}>
            {showIdx >= 0 ? seq[showIdx] : ""}
          </div>
        </div>
      )}

      {phase === "recall" && (
        <div className="flex flex-col items-center w-full max-w-xs">
          <p className="text-lg text-muted mb-4">
            {mode === "backward" ? "逆の順番で入力" : "順番に入力"}
          </p>
          <div className="h-10 mb-6 flex items-center gap-2 font-data text-2xl text-ink tabular-nums">
            {input.length ? input.join(" ") : <span className="text-muted text-base">…</span>}
          </div>
          <div className="grid grid-cols-3 gap-2 w-fit mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={d}
                onClick={() => setInput((p) => [...p, d])}
                className="w-16 h-16 rounded-lg border border-border bg-paper text-2xl font-data text-ink"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => setInput((p) => p.slice(0, -1))}
              className="w-16 h-16 rounded-lg border border-border bg-paper text-base text-muted"
            >
              ⌫
            </button>
            <button
              onClick={() => setInput((p) => [...p, 0])}
              className="w-16 h-16 rounded-lg border border-border bg-paper text-2xl font-data text-ink"
            >
              0
            </button>
            <button
              onClick={submit}
              className="w-16 h-16 rounded-lg bg-brass text-white text-base font-body"
            >
              決定
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
