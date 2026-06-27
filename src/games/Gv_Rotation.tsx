"use client";

import { useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import Feedback from "@/components/Feedback";
import { Bridge } from "@/games/Gf_Series";
import { mulberry32 } from "@/lib/rng";
import { createEventLog, deriveMetrics } from "@/lib/telemetry";
import { genRotationItem, ROTATION_PLAN_LEN, type RotationItem } from "@/lib/generators/rotation";
import type { Trial } from "@/types/scoring";

type Phase = "ready" | "practice" | "bridge" | "real";

function Shape({ points, transform }: { points: string; transform?: string }) {
  return (
    <svg viewBox="0 0 100 100" width="120" height="120" aria-hidden="true">
      <g transform={transform}>
        <polygon points={points} fill="var(--brass)" />
      </g>
    </svg>
  );
}

export default function Gv_Rotation({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [idx, setIdx] = useState(0);
  const [item, setItem] = useState<RotationItem | null>(null);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);

  const rngRef = useRef(mulberry32(seed));
  const trialsRef = useRef<Trial[]>([]);
  const logRef = useRef(createEventLog());
  const doneRef = useRef(false);

  const startPractice = () => {
    setItem(genRotationItem(mulberry32((seed ^ 0x6262) >>> 0)));
    setPhase("practice");
  };
  const startReal = () => {
    setIdx(0);
    setItem(genRotationItem(rngRef.current));
    logRef.current.reset();
    setPhase("real");
  };

  const choose = (asMirror: boolean) => {
    if (!item || locked || doneRef.current) return;
    const correct = asMirror === item.isMirror;

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

    logRef.current.push("choice", asMirror ? "mirror" : "same");
    const m = deriveMetrics(logRef.current.events);
    trialsRef.current.push({
      task_id: "Gv_rotation",
      ability: "Gv",
      ordinal: idx,
      params: { shapeId: item.shapeId, angle: item.angle, isMirror: item.isMirror },
      response: asMirror ? "mirror" : "same",
      correct,
      rt_ms: m.time_to_first_ms,
      input_method: "mouse",
      extra: { events: [...logRef.current.events], ...m },
    });
    setLocked(true);
    window.setTimeout(() => {
      setLocked(false);
      const next = idx + 1;
      if (next >= ROTATION_PLAN_LEN) {
        doneRef.current = true;
        onComplete(trialsRef.current);
        return;
      }
      setIdx(next);
      setItem(genRotationItem(rngRef.current));
      logRef.current.reset();
    }, 300);
  };

  if (phase === "ready") {
    return (
      <ReadyScreen
        title="心的回転"
        description={
          <>
            左の図形を回したものが右の図形です。右が左と
            <span className="text-ink font-body">同じ形</span>か、
            <span className="text-ink font-body">裏返し（鏡像）</span>かを選んでください。全6問です。
          </>
        }
        example={<p className="text-muted text-base">回しただけなら「同じ」、ひっくり返っていたら「鏡像」。</p>}
        onStart={startReal}
        onPractice={startPractice}
      />
    );
  }
  if (phase === "bridge") return <Bridge onStart={startReal} />;
  if (!item) return null;

  const candidateTransform =
    `rotate(${item.angle} 50 50)` + (item.isMirror ? " translate(100 0) scale(-1 1)" : "");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-6">
      {phase === "practice" && <Feedback feedback={feedback} />}
      {phase === "practice" && <p className="text-base text-muted mb-4">れんしゅう</p>}
      <div className="flex items-center justify-center gap-8">
        <div className="flex flex-col items-center">
          <Shape points={item.points} />
          <span className="text-base text-muted mt-1">もとの形</span>
        </div>
        <span className="text-2xl text-muted">→</span>
        <div className="flex flex-col items-center">
          <Shape points={item.points} transform={candidateTransform} />
          <span className="text-base text-muted mt-1">この形は？</span>
        </div>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 w-full max-w-sm">
        <button
          onClick={() => choose(false)}
          disabled={locked}
          className="py-4 rounded-lg border border-border bg-paper text-lg font-body text-ink disabled:opacity-60"
        >
          同じ
        </button>
        <button
          onClick={() => choose(true)}
          disabled={locked}
          className="py-4 rounded-lg border border-border bg-paper text-lg font-body text-ink disabled:opacity-60"
        >
          鏡像
        </button>
      </div>
    </div>
  );
}
