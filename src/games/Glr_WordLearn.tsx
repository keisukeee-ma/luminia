"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import { selectGlrWords } from "@/data/wordBank";
import type { Trial } from "@/types/scoring";

const LEARN_MS = 8000;

export default function Glr_WordLearn({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [remaining, setRemaining] = useState(LEARN_MS);
  const endAtRef = useRef(0);
  const doneRef = useRef(false);

  const words = selectGlrWords(seed).learned;

  const start = () => {
    endAtRef.current = performance.now() + LEARN_MS;
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, endAtRef.current - performance.now()));
    }, 100);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    if (started && remaining <= 0 && !doneRef.current) {
      doneRef.current = true;
      onComplete([]); // 非採点ステップ
    }
  }, [started, remaining, onComplete]);

  if (!started) {
    return (
      <ReadyScreen
        title="単語をおぼえる"
        description={
          <>
            これから<span className="text-ink font-body">6つの単語</span>が表示されます。
            あとで「見た単語かどうか」を答えてもらうので、数秒で覚えてください。
          </>
        }
        example={<p className="text-muted text-base">※ このあと別の問題をはさんでから出題します。</p>}
        onStart={start}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      <p className="text-lg text-muted mb-8">覚えてください</p>
      <div className="grid grid-cols-2 gap-x-10 gap-y-5">
        {words.map((w) => (
          <span key={w} className="font-data text-3xl text-ink text-center">
            {w}
          </span>
        ))}
      </div>
      <div className="w-full max-w-xs h-1.5 bg-border rounded-full mt-12 overflow-hidden">
        <div
          className="h-full bg-brass"
          style={{ width: `${(remaining / LEARN_MS) * 100}%`, transition: "width 100ms linear" }}
        />
      </div>
    </div>
  );
}
