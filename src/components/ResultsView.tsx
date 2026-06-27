"use client";

import { useEffect, useRef, useState } from "react";
import type { ComputedScores } from "@/types/scoring";
import AbilityMeter from "./AbilityMeter";

function deltaLabel(delta: number | null): { text: string; color: string } {
  if (delta === null) return { text: "—", color: "var(--muted)" };
  if (delta <= -5) return { text: "実年齢より若い脳", color: "var(--green)" };
  if (delta >= 5) return { text: "実年齢より高め", color: "var(--red)" };
  return { text: "実年齢相応", color: "var(--blue)" };
}

/** 値へ向かってカウントアップする。startDelay 後に開始。 */
function useCountUp(target: number | null, durationMs: number, startDelay = 0) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(0);
  useEffect(() => {
    if (target === null) return;
    let start = 0;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else setVal(target);
    };
    const to = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);
    // rAF が止まる環境（非表示タブ・reduced motion 等）でも最終値を保証
    const safety = setTimeout(() => setVal(target), startDelay + durationMs + 150);
    return () => {
      clearTimeout(to);
      clearTimeout(safety);
      cancelAnimationFrame(rafRef.current);
    };
  }, [target, durationMs, startDelay]);
  return val;
}

export default function ResultsView({ scores }: { scores: ComputedScores }) {
  const result = scores?.result ?? {
    brain_age: null,
    brain_age_delta: null,
    fluid_composite_z: null,
    gc_z: null,
    model_version: "",
  };
  const abilities = scores?.abilities ?? [];
  const d = deltaLabel(result.brain_age_delta);

  const animAge = useCountUp(result.brain_age, 1500, 250);
  const [revealDelta, setRevealDelta] = useState(false);

  useEffect(() => {
    const to = setTimeout(() => setRevealDelta(true), 1650);
    return () => clearTimeout(to);
  }, []);

  return (
    <div className="mx-auto max-w-xl w-full px-4 py-10">
      <p className="text-base text-muted text-center">あなたの脳年齢（暫定）</p>
      <div className="mt-2 text-center">
        <span
          className="font-data text-ink tabular-nums"
          style={{ fontSize: 88, lineHeight: 1 }}
        >
          {result.brain_age === null ? "—" : Math.round(animAge)}
        </span>
        <span className="text-2xl text-muted ml-1">歳</span>
      </div>

      <p
        className="mt-4 text-center font-body text-lg"
        style={{
          color: d.color,
          opacity: revealDelta ? 1 : 0,
          transform: revealDelta ? "translateY(0)" : "translateY(6px)",
          transition: "opacity 500ms ease, transform 500ms ease",
        }}
      >
        {d.text}
        {result.brain_age_delta !== null && (
          <span className="text-muted text-base ml-2 tabular-nums">
            （実年齢帯 {result.brain_age_delta > 0 ? "+" : ""}
            {result.brain_age_delta} 歳）
          </span>
        )}
      </p>

      <div className="mt-10">
        <h2 className="font-body text-ink text-lg mb-2">能力ごとの偏差値</h2>
        <div className="bg-paper border border-border rounded-lg px-5 py-2">
          {abilities.map((a, i) => (
            <AbilityMeter key={a.ability} score={a} delay={900 + i * 220} />
          ))}
        </div>
      </div>

      <p className="mt-6 text-base leading-relaxed text-muted">
        ※ 脳年齢は加齢で変化しやすい流動系5能力（処理速度・作業記憶・流動性推論・視覚処理・記憶）から算出します。
        結晶性知能は加齢で下がりにくいため、比較の基準（対照）として表示しています。
        規準値は文献ベースの暫定値（v0）で、今後データが蓄積されるほど精度が上がります。
      </p>
    </div>
  );
}
