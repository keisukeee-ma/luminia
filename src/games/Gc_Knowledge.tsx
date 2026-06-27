"use client";

import { useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import Feedback from "@/components/Feedback";
import { Bridge } from "@/games/Gf_Series";
import { mulberry32, shuffle, type RNG } from "@/lib/rng";
import { createEventLog, deriveMetrics } from "@/lib/telemetry";
import { KNOWLEDGE_BANK, type KnowledgeItem } from "@/data/knowledgeBank";
import type { Trial } from "@/types/scoring";

const QUESTION_COUNT = 8;
type Phase = "ready" | "practice" | "bridge" | "real";

interface PreparedItem extends KnowledgeItem {
  shuffledOptions: string[];
}

function prepare(rng: RNG, count: number): PreparedItem[] {
  const picked = shuffle(rng, [...KNOWLEDGE_BANK]).slice(0, count);
  return picked.map((it) => ({ ...it, shuffledOptions: shuffle(rng, [...it.options]) }));
}

export default function Gc_Knowledge({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [idx, setIdx] = useState(0);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);

  const itemsRef = useRef<PreparedItem[]>([]);
  const practiceRef = useRef<PreparedItem | null>(null);
  const trialsRef = useRef<Trial[]>([]);
  const logRef = useRef(createEventLog());
  const doneRef = useRef(false);

  const startPractice = () => {
    practiceRef.current = prepare(mulberry32((seed ^ 0x7373) >>> 0), 1)[0];
    setPhase("practice");
  };
  const startReal = () => {
    itemsRef.current = prepare(mulberry32(seed), QUESTION_COUNT);
    setIdx(0);
    logRef.current.reset();
    setPhase("real");
  };

  const item = phase === "practice" ? practiceRef.current : itemsRef.current[idx];

  const choose = (opt: string) => {
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
      task_id: "Gc_knowledge",
      ability: "Gc",
      ordinal: idx,
      difficulty: item.difficulty,
      item_id: item.id,
      params: { kind: item.kind },
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
      if (next >= itemsRef.current.length) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setIdx(next);
      logRef.current.reset();
    }, 300);
  };

  if (phase === "ready") {
    return (
      <ReadyScreen
        title="知識"
        description={<>言葉の意味・一般知識・ことわざの問題です。最も正しいものを選んでください。全8問です。</>}
        example={<p className="text-muted text-base">例: 「脆弱」に最も意味が近いのは？ → もろくて弱い</p>}
        onStart={startReal}
        onPractice={startPractice}
      />
    );
  }
  if (phase === "bridge") return <Bridge onStart={startReal} />;
  if (!item) return null;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      {phase === "practice" && <Feedback feedback={feedback} />}
      {phase === "practice" && <p className="text-base text-muted mb-4">れんしゅう</p>}
      <div className="w-full max-w-md">
        <p className="font-body text-lg text-ink text-center leading-relaxed">{item.prompt}</p>
        <div className="mt-8 grid gap-3">
          {item.shuffledOptions.map((o) => (
            <button
              key={o}
              onClick={() => choose(o)}
              disabled={locked}
              className="py-3.5 px-4 rounded-lg border border-border bg-paper text-base text-ink text-left disabled:opacity-60"
            >
              {o}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
