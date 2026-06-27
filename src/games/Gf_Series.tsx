"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import Feedback from "@/components/Feedback";
import { mulberry32 } from "@/lib/rng";
import { createEventLog, deriveMetrics } from "@/lib/telemetry";
import { genSeries, SERIES_PLAN, type SeriesItem } from "@/lib/generators/series";
import type { Trial } from "@/types/scoring";

type Phase = "ready" | "practice" | "bridge" | "real";

export default function Gf_Series({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [idx, setIdx] = useState(0);
  const [item, setItem] = useState<SeriesItem | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);

  const rngRef = useRef(mulberry32(seed));
  const trialsRef = useRef<Trial[]>([]);
  const logRef = useRef(createEventLog());
  const doneRef = useRef(false);

  const startPractice = () => {
    setItem(genSeries(mulberry32((seed ^ 0x5151) >>> 0), 1));
    setPhase("practice");
  };
  const startReal = () => {
    setIdx(0);
    setItem(genSeries(rngRef.current, SERIES_PLAN[0]));
    logRef.current.reset();
    setPhase("real");
  };

  const choose = (opt: number) => {
    if (!item || locked || doneRef.current) return;
    const correct = opt === item.answer;

    if (phase === "practice") {
      setFeedback(correct);
      setLocked(true);
      window.setTimeout(() => {
        setFeedback(null);
        setLocked(false);
        setPhase("bridge");
      }, 800);
      return;
    }

    logRef.current.push("choice", opt);
    const m = deriveMetrics(logRef.current.events);
    trialsRef.current.push({
      task_id: "Gf_series",
      ability: "Gf",
      ordinal: idx,
      difficulty: item.difficulty,
      params: { rule: item.rule, sequence: item.sequence },
      response: opt,
      correct,
      rt_ms: m.time_to_first_ms,
      input_method: "mouse",
      extra: { events: [...logRef.current.events], ...m },
    });
    setLocked(true);
    window.setTimeout(() => {
      setLocked(false);
      const next = idx + 1;
      if (next >= SERIES_PLAN.length) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setIdx(next);
      setItem(genSeries(rngRef.current, SERIES_PLAN[next]));
      logRef.current.reset();
    }, 300);
  };

  // キーボード入力（1〜4で選択肢を選ぶ）
  useEffect(() => {
    if ((phase !== "practice" && phase !== "real") || !item) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= item.options.length) choose(item.options[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, item, locked]);

  if (phase === "ready") {
    return (
      <ReadyScreen
        title="数列完成"
        description={
          <>
            数字の並びには規則があります。空欄（<span className="text-brass">?</span>）に入る数を、
            下の4つから選んでください。全6問です。
          </>
        }
        example={<p className="text-muted text-base">例: 2 4 6 8 ? → 10</p>}
        onStart={startReal}
        onPractice={startPractice}
      />
    );
  }
  if (phase === "bridge") {
    return <Bridge onStart={startReal} />;
  }
  if (!item) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      {phase === "practice" && <Feedback feedback={feedback} />}
      {phase === "practice" && <p className="text-base text-muted mb-4">れんしゅう</p>}
      <div className="w-full max-w-md">
        <div className="flex flex-wrap items-center justify-center gap-3 font-data text-3xl text-ink tabular-nums">
          {item.sequence.map((n, i) => (
            <span key={i}>{n}</span>
          ))}
          <span className="text-brass">?</span>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3">
          {item.options.map((o, i) => (
            <button
              key={o}
              onClick={() => choose(o)}
              disabled={locked}
              className="relative py-5 rounded-lg border border-border bg-paper font-data text-3xl text-ink tabular-nums disabled:opacity-60"
            >
              <span className="absolute left-3 top-2 text-base text-muted font-body">{i + 1}</span>
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Bridge({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-data text-2xl text-ink">準備OK！</p>
        <p className="mt-3 text-base text-muted">ここからが本番です。結果は記録されます。</p>
        <button
          onClick={onStart}
          className="mt-8 bg-brass text-white rounded-md px-10 py-3.5 text-lg font-body"
        >
          本番をはじめる
        </button>
      </div>
    </div>
  );
}
