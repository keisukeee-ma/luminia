import type { AbilityScore } from "@/types/scoring";
import { ABILITY_LABEL } from "@/types/domain";

/** 偏差値バー。T=20〜80 を 0〜100% にマップし、50 に基準線を引く。 */
export default function AbilityMeter({ score }: { score: AbilityScore }) {
  const t = score.t_age;
  const pct = Math.max(0, Math.min(100, ((t - 20) / 60) * 100));

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-body text-ink text-sm">
          {ABILITY_LABEL[score.ability]}
        </span>
        <span className="font-data text-ink tabular-nums">
          {t.toFixed(1)}
          <span className="text-xs text-muted ml-1">偏差値</span>
        </span>
      </div>
      <div className="relative h-2.5 bg-border rounded-full">
        {/* 50 基準線 */}
        <div
          className="absolute top-[-3px] bottom-[-3px] w-px bg-muted/50"
          style={{ left: "50%" }}
        />
        <div
          className="h-full bg-brass rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
