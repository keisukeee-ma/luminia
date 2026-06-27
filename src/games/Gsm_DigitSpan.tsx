"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import Feedback from "@/components/Feedback";
import { Bridge } from "@/games/Gf_Series";
import { mulberry32 } from "@/lib/rng";
import { createEventLog, deriveMetrics } from "@/lib/telemetry";
import {
  buildSpanTrials,
  genDigitSeq,
  expected,
  arrEq,
  longestCorrectPrefix,
  spanDisplayMs,
  type SpanMode,
} from "@/lib/generators/digitSpan";
import type { Trial } from "@/types/scoring";

type Phase = "ready" | "show" | "recall" | "between" | "bridge";

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
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [trialIdx, setTrialIdx] = useState(0);
  const [practicing, setPracticing] = useState(false);

  const planRef = useRef<number[][]>([]);
  const practiceSeqRef = useRef<number[]>([]);
  const trialsRef = useRef<Trial[]>([]);
  const ordinalRef = useRef(0);
  const logRef = useRef(createEventLog());
  const doneRef = useRef(false);

  const seq = practicing ? practiceSeqRef.current : planRef.current[trialIdx] ?? [];

  const startPractice = () => {
    practiceSeqRef.current = genDigitSeq(mulberry32((seed ^ 0x3131) >>> 0), 3);
    setPracticing(true);
    setInput([]);
    setPhase("show");
  };

  const startReal = () => {
    planRef.current = buildSpanTrials(mulberry32(seed));
    trialsRef.current = [];
    ordinalRef.current = 0;
    doneRef.current = false;
    setPracticing(false);
    setTrialIdx(0);
    setInput([]);
    setPhase("show");
  };

  // 提示（系列全体を数秒まとめて表示 → 非表示 → 再生）
  useEffect(() => {
    if (phase !== "show" || seq.length === 0) return;
    setVisible(true);
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setVisible(false);
        timers.push(
          window.setTimeout(() => {
            logRef.current.reset();
            setPhase("recall");
          }, 350),
        );
      }, spanDisplayMs(seq.length)),
    );
    return () => timers.forEach(clearTimeout);
  }, [phase, seq]);

  const submit = () => {
    if (phase !== "recall" || input.length === 0 || doneRef.current) return;
    logRef.current.push("submit");
    const span = seq.length;
    const target = expected(seq, mode);
    const correct = arrEq(input, target);
    const partial = longestCorrectPrefix(input, target);
    const m = deriveMetrics(logRef.current.events);

    if (practicing) {
      setFeedback(correct);
      setPhase("between");
      window.setTimeout(() => {
        setFeedback(null);
        setInput([]);
        setPhase("bridge");
      }, 800);
      return;
    }

    trialsRef.current.push({
      task_id: taskId,
      ability: "Gsm",
      ordinal: ordinalRef.current++,
      difficulty: span,
      response: [...input],
      correct,
      rt_ms: m.time_to_first_ms,
      extra: { span, partial, mode, events: [...logRef.current.events], ...m },
    });
    setPhase("between");
    window.setTimeout(() => {
      setInput([]);
      const next = trialIdx + 1;
      if (next >= planRef.current.length) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setTrialIdx(next);
      setPhase("show");
    }, 300);
  };

  const pushDigit = (d: number) => {
    logRef.current.push("key", d);
    setInput((p) => [...p, d]);
  };
  const backspace = () => {
    logRef.current.push("backspace");
    setInput((p) => p.slice(0, -1));
  };

  // キーボード入力
  useEffect(() => {
    if (phase !== "recall") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") pushDigit(Number(e.key));
      else if (e.key === "Backspace") backspace();
      else if (e.key === "Enter") submit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, input, seq]);

  if (phase === "ready") {
    return (
      <ReadyScreen
        title={mode === "backward" ? "逆唱" : "数唱"}
        description={
          mode === "backward" ? (
            <>数字が数秒表示されます。覚えて、見た順番の<span className="text-ink font-body">逆</span>から入力してください。短いものから長いものまで全6問です。</>
          ) : (
            <>数字が数秒表示されます。覚えて、見た<span className="text-ink font-body">順番のまま</span>入力してください。短いものから長いものまで全6問です。</>
          )
        }
        example={
          <p className="text-muted text-base">
            {mode === "backward" ? "例: 5 1 8 → 「8 1 5」と入力" : "例: 4 8 2 → 「4 8 2」と入力"}
            <br />
            （ボタン、またはキーボードの数字でも入力できます）
          </p>
        }
        onStart={startReal}
        onPractice={startPractice}
      />
    );
  }
  if (phase === "bridge") return <Bridge onStart={startReal} />;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      {practicing && <Feedback feedback={feedback} />}
      {practicing && phase !== "between" && (
        <p className="text-base text-muted mb-3">れんしゅう</p>
      )}

      {phase === "show" && (
        <div className="flex flex-col items-center">
          <p className="text-lg text-muted mb-6">覚えてください</p>
          <div
            className="font-data text-ink tabular-nums flex items-center gap-3"
            style={{ fontSize: 72, lineHeight: 1, minHeight: 100 }}
          >
            {visible ? seq.map((d, i) => <span key={i}>{d}</span>) : ""}
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
                onClick={() => pushDigit(d)}
                className="w-16 h-16 rounded-lg border border-border bg-paper text-2xl font-data text-ink"
              >
                {d}
              </button>
            ))}
            <button
              onClick={backspace}
              className="w-16 h-16 rounded-lg border border-border bg-paper text-base text-muted"
            >
              ⌫
            </button>
            <button
              onClick={() => pushDigit(0)}
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
