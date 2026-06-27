"use client";

import { useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import { mulberry32, shuffle } from "@/lib/rng";
import { createEventLog, deriveMetrics } from "@/lib/telemetry";
import { selectGlrWords } from "@/data/wordBank";
import type { Trial } from "@/types/scoring";

interface TestWord {
  word: string;
  isOld: boolean;
}

export default function Glr_WordRecall({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);

  const listRef = useRef<TestWord[]>([]);
  const trialsRef = useRef<Trial[]>([]);
  const logRef = useRef(createEventLog());
  const doneRef = useRef(false);

  const start = () => {
    const { learned, distractors } = selectGlrWords(seed);
    const list: TestWord[] = [
      ...learned.map((word) => ({ word, isOld: true })),
      ...distractors.map((word) => ({ word, isOld: false })),
    ];
    listRef.current = shuffle(mulberry32(seed ^ 0x9e3779b9), list);
    setStarted(true);
    setIdx(0);
    logRef.current.reset();
  };

  const item = listRef.current[idx];

  const choose = (saysOld: boolean) => {
    if (!item || locked || doneRef.current) return;
    logRef.current.push("choice", saysOld ? "old" : "new");
    const correct = saysOld === item.isOld;
    const m = deriveMetrics(logRef.current.events);
    trialsRef.current.push({
      task_id: "Glr_recognition",
      ability: "Glr",
      ordinal: idx,
      item_id: item.word,
      params: { isOld: item.isOld },
      response: saysOld ? "old" : "new",
      correct,
      rt_ms: m.time_to_first_ms,
      input_method: "mouse",
      extra: { events: [...logRef.current.events], ...m },
    });
    setLocked(true);
    window.setTimeout(() => {
      setLocked(false);
      const next = idx + 1;
      if (next >= listRef.current.length) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setIdx(next);
      logRef.current.reset();
    }, 250);
  };

  if (!started) {
    return (
      <ReadyScreen
        title="単語を思い出す"
        description={
          <>
            単語が1つずつ出ます。さきほど
            <span className="text-ink font-body">覚えた単語</span>
            なら「見た」、そうでなければ「見ていない」を選んでください。
          </>
        }
        example={<p className="text-muted text-base">覚えた6語と、新しい単語が混ざって出ます。</p>}
        onStart={start}
      />
    );
  }
  if (!item) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      <p className="text-lg text-muted mb-6">この単語は覚えた中にありましたか？</p>
      <div className="font-data text-ink mb-10" style={{ fontSize: 56, lineHeight: 1 }}>
        {item.word}
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        <button
          onClick={() => choose(true)}
          disabled={locked}
          className="py-4 rounded-lg border border-border bg-paper text-lg font-body text-ink disabled:opacity-60"
        >
          見た
        </button>
        <button
          onClick={() => choose(false)}
          disabled={locked}
          className="py-4 rounded-lg border border-border bg-paper text-lg font-body text-ink disabled:opacity-60"
        >
          見ていない
        </button>
      </div>
    </div>
  );
}
