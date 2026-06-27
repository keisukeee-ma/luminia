import type { HistoryEntry } from "@/lib/history";

/** 複数回計測した脳年齢の折れ線グラフ。history は newest-first で渡す。 */
export default function TrendChart({ history }: { history: HistoryEntry[] }) {
  // 古い順に並べ、brain_age が null のエントリは除外
  const sorted = [...history]
    .reverse()
    .filter((h) => h.scores.result.brain_age !== null);

  if (sorted.length < 2) return null;

  const ages = sorted.map((h) => h.scores.result.brain_age as number);

  const W = 320;
  const H = 96;
  const padX = 10;
  const padY = 18;

  const minAge = Math.min(...ages) - 4;
  const maxAge = Math.max(...ages) + 4;
  const range = maxAge - minAge || 1;

  const xOf = (i: number) =>
    padX + (i / (sorted.length - 1)) * (W - 2 * padX);
  const yOf = (age: number) =>
    padY + (1 - (age - minAge) / range) * (H - 2 * padY);

  const pts = sorted
    .map((h, i) => `${xOf(i)},${yOf(h.scores.result.brain_age as number)}`)
    .join(" ");

  const fmt = (ts: number) =>
    new Date(ts).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="mt-6 bg-paper border border-border rounded-lg px-5 py-4">
      <h2 className="font-body text-ink text-base mb-3">脳年齢の推移</h2>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="脳年齢の推移"
      >
        {/* 縦ガイド線 */}
        {sorted.map((h, i) => (
          <line
            key={h.id}
            x1={xOf(i)}
            y1={padY}
            x2={xOf(i)}
            y2={H - padY}
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
        ))}
        {/* 折れ線 */}
        <polyline
          points={pts}
          fill="none"
          stroke="var(--brass)"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* 点 + 数値ラベル */}
        {sorted.map((h, i) => {
          const age = h.scores.result.brain_age as number;
          const x = xOf(i);
          const y = yOf(age);
          return (
            <g key={h.id}>
              <circle cx={x} cy={y} r="4.5" fill="var(--brass)" />
              <text
                x={x}
                y={y - 9}
                textAnchor="middle"
                fontSize="11"
                fill="var(--ink)"
                fontFamily="var(--font-data, monospace)"
              >
                {age}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted mt-1">
        <span>{fmt(sorted[0].at)}</span>
        <span>{fmt(sorted[sorted.length - 1].at)}</span>
      </div>
    </div>
  );
}
