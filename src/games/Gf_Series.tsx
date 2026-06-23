"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import Feedback from "@/components/Feedback";
import { mulberry32 } from "@/lib/rng";
import { genSeries, SERIES_PLAN, type SeriesItem } from "@/lib/generators/series";
import type { Trial } from "@/types/scoring";

export default function Gf_Series({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [item, setItem] = useState<SeriesItem | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);

  const rngRef = useRef(mulberry32(seed));
  const trialsRef = useRef<Trial[]>([]);
  const shownAtRef = useRef(0);
  const doneRef = useRef(false);

  const loadItem = (i: number) => {
    setItem(genSeries(rngRef.current, SERIES_PLAN[i]));
    shownAtRef.current = performance.now();
  };

  const start = () => {
    setStarted(true);
    loadItem(0);
  };

  // キーボード入力（1〜4で選択肢を選ぶ）
  useEffect(() => {
    if (!started || !item) return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= item.options.length) choose(item.options[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, item, locked]);

  const choose = (opt: number) => {
    if (!item || locked || doneRef.current) return;
    const correct = opt === item.answer;
    trialsRef.current.push({
      task_id: "Gf_series",
      ability: "Gf",
      ordinal: idx,
      difficulty: item.difficulty,
      params: { rule: item.rule, sequence: item.sequence },
      response: opt,
      correct,
      rt_ms: Math.round(performance.now() - shownAtRef.current),
      input_method: "mouse",
    });
    setFeedback(correct);
    setLocked(true);
    window.setTimeout(() => {
      setFeedback(null);
      setLocked(false);
      const next = idx + 1;
      if (next >= SERIES_PLAN.length) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setIdx(next);
      loadItem(next);
    }, 550);
  };

  if (!started) {
    return (
      <ReadyScreen
        title="数列完成"
        description={
          <>
            数字の並びには規則があります。空欄（<span className="text-brass">?</span>）に入る数を、
            下の4つから選んでください。全6問です。
          </>
        }
        example={
          <p className="text-muted text-base">
            例: 2 4 6 8 ? → 10
            <br />
            （ボタン、またはキーボードの 1〜4 で選べます）
          </p>
        }
        onStart={start}
      />
    );
  }
  if (!item) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      <Feedback feedback={feedback} />
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
              <span className="absolute left-3 top-2 text-base text-muted font-body">
                {i + 1}
              </span>
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
