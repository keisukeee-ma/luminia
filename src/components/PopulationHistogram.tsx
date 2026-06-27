import { topPercentFromHistogram } from "@/lib/stats";

/**
 * 同年代の実参加者の偏差値ヒストグラム（buckets[1..12]）に、自分の位置を重ねて表示する。
 */
export default function PopulationHistogram({
  label,
  userT,
  buckets,
  total,
}: {
  label: string;
  userT: number;
  buckets: number[];
  total: number;
}) {
  const W = 300;
  const H = 80;
  const pad = 6;
  const base = H - 8;
  const innerW = W - 2 * pad;
  const barW = innerW / 12;
  const maxCnt = Math.max(1, ...buckets.slice(1, 13));

  // 偏差値 t（20..80）→ x 座標
  const xOfT = (t: number) => pad + ((Math.max(20, Math.min(80, t)) - 20) / 60) * innerW;
  const mx = xOfT(userT);
  const top = topPercentFromHistogram(buckets, total, userT);

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-body text-base text-ink">{label}</span>
        <span className="text-base text-muted">
          偏差値 <span className="font-data text-ink">{userT.toFixed(1)}</span>
          <span className="mx-1">·</span>上位{" "}
          <span className="font-data text-ink">{top.toFixed(0)}%</span>
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`${label} 偏差値 ${userT.toFixed(1)} 上位 ${top.toFixed(0)}%`}
      >
        {/* 実データの棒 */}
        {buckets.slice(1, 13).map((cnt, i) => {
          const h = (cnt / maxCnt) * (base - 10);
          const x = pad + i * barW;
          return (
            <rect
              key={i}
              x={x + 0.5}
              y={base - h}
              width={barW - 1}
              height={h}
              rx="1"
              fill="var(--border)"
              opacity="0.7"
            />
          );
        })}
        {/* 平均（偏差値50）の点線 */}
        <line
          x1={xOfT(50)}
          y1="8"
          x2={xOfT(50)}
          y2={base}
          stroke="var(--muted)"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* ユーザー位置 */}
        <line x1={mx} y1="2" x2={mx} y2={base} stroke="var(--brass)" strokeWidth="2.5" />
        <circle cx={mx} cy="6" r="4" fill="var(--brass)" />
      </svg>
    </div>
  );
}
