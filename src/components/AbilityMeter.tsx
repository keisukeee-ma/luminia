"use client";

import { useEffect, useRef, useState } from "react";
import type { AbilityScore } from "@/types/scoring";
import { ABILITY_LABEL } from "@/types/domain";

/** 偏差値バー。マウント後に 0→目標 へアニメーション（バー幅＋数値カウントアップ）。 */
export default function AbilityMeter({
  score,
  delay = 0,
}: {
  score: AbilityScore;
  delay?: number;
}) {
  const t = score.t_age;
  // 偏差値そのもの（0〜100, 平均50が中央）を目盛りにして、その値の位置まで色を伸ばす
  const targetPct = Math.max(0, Math.min(100, t));
  const [pct, setPct] = useState(0);
  const [shownT, setShownT] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const to = setTimeout(() => {
      setPct(targetPct);
      let start = 0;
      const dur = 900;
      const tick = (ts: number) => {
        if (!start) start = ts;
        const p = Math.min(1, (ts - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        setShownT(t * eased);
        if (p < 1) rafRef.current = requestAnimationFrame(tick);
        else setShownT(t);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);
    // rAF が止まる環境でも最終値を保証
    const safety = setTimeout(() => setShownT(t), delay + 1100);
    return () => {
      clearTimeout(to);
      clearTimeout(safety);
      cancelAnimationFrame(rafRef.current);
    };
  }, [targetPct, t, delay]);

  if (score.notMeasured) {
    return (
      <div className="py-3.5">
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-body text-ink text-base">{ABILITY_LABEL[score.ability]}</span>
          <span className="text-base text-muted">測定不能</span>
        </div>
        <div className="relative h-3 bg-border rounded-full opacity-30" />
      </div>
    );
  }

  return (
    <div className="py-3.5">
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-body text-ink text-base">
          {ABILITY_LABEL[score.ability]}
        </span>
        <span className="font-data text-ink text-xl tabular-nums">
          {shownT.toFixed(1)}
          <span className="text-base text-muted ml-1">偏差値</span>
        </span>
      </div>
      <div className="relative h-3 bg-border rounded-full">
        <div
          className="absolute top-[-3px] bottom-[-3px] w-px bg-muted/50"
          style={{ left: "50%" }}
        />
        <div
          className="h-full bg-brass rounded-full"
          style={{ width: `${pct}%`, transition: "width 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </div>
    </div>
  );
}
