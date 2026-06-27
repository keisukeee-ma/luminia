import { tToTopPercent } from "@/lib/stats";

/** 正規分布（平均50・SD10）のベルカーブ上に、自分の偏差値の位置を示す。 */
export default function DistributionMeter({ label, t }: { label: string; t: number }) {
  const W = 300;
  const H = 80;
  const pad = 6;
  const base = H - 8;
  const z = (t - 50) / 10;
  const zc = Math.max(-3.2, Math.min(3.2, z));

  const xOf = (zz: number) => pad + ((zz + 3.2) / 6.4) * (W - 2 * pad);
  const pdf = (zz: number) => Math.exp((-zz * zz) / 2);
  const yOf = (zz: number) => 8 + (1 - pdf(zz)) * (base - 8);

  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const zz = -3.2 + (6.4 * i) / 60;
    pts.push(`${i ? "L" : "M"}${xOf(zz).toFixed(1)},${yOf(zz).toFixed(1)}`);
  }
  const line = pts.join(" ");
  const area = `${line} L${xOf(3.2).toFixed(1)},${base} L${xOf(-3.2).toFixed(1)},${base} Z`;
  const mx = xOf(zc);
  const top = tToTopPercent(t);

  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between mb-1">
        <span className="font-body text-base text-ink">{label}</span>
        <span className="text-base text-muted">
          偏差値 <span className="font-data text-ink">{t.toFixed(1)}</span>
          <span className="mx-1">·</span>上位{" "}
          <span className="font-data text-ink">{top.toFixed(0)}%</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${label} 偏差値 ${t.toFixed(1)}`}>
        <path d={area} fill="var(--border)" opacity="0.55" />
        <path d={line} fill="none" stroke="var(--muted)" strokeWidth="1.5" />
        <line x1={xOf(0)} y1="8" x2={xOf(0)} y2={base} stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" />
        <line x1={mx} y1="2" x2={mx} y2={base} stroke="var(--brass)" strokeWidth="2.5" />
        <circle cx={mx} cy={yOf(zc)} r="4" fill="var(--brass)" />
      </svg>
    </div>
  );
}
