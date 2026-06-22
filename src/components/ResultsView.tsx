import type { ComputedScores } from "@/types/scoring";
import AbilityMeter from "./AbilityMeter";

function deltaLabel(delta: number | null): { text: string; color: string } {
  if (delta === null) return { text: "—", color: "var(--muted)" };
  if (delta <= -5) return { text: "実年齢より若い脳", color: "var(--green)" };
  if (delta >= 5) return { text: "実年齢より高め", color: "var(--red)" };
  return { text: "実年齢相応", color: "var(--blue)" };
}

export default function ResultsView({ scores }: { scores: ComputedScores }) {
  const { result, abilities } = scores;
  const d = deltaLabel(result.brain_age_delta);

  return (
    <div className="mx-auto max-w-xl w-full px-4 py-10">
      <p className="text-sm text-muted text-center">あなたの脳年齢（暫定）</p>
      <div className="mt-2 text-center">
        <span className="font-data text-ink" style={{ fontSize: 72, lineHeight: 1 }}>
          {result.brain_age ?? "—"}
        </span>
        <span className="text-xl text-muted ml-1">歳</span>
      </div>
      <p className="mt-3 text-center font-body" style={{ color: d.color }}>
        {d.text}
        {result.brain_age_delta !== null && (
          <span className="text-muted text-sm ml-2 tabular-nums">
            （実年齢帯 {result.brain_age_delta > 0 ? "+" : ""}
            {result.brain_age_delta} 歳）
          </span>
        )}
      </p>

      <div className="mt-10">
        <h2 className="font-body text-ink text-sm mb-1">能力ごとの偏差値</h2>
        <div className="bg-paper border border-border rounded-lg px-5 py-2">
          {abilities.map((a) => (
            <AbilityMeter key={a.ability} score={a} />
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        ※ これは縦切り版の暫定推定です。脳年齢は流動系能力（処理速度・作業記憶・流動性推論）から算出しており、
        規準値は文献ベースの暫定値（v0）です。今後データが蓄積されるほど精度が上がります。
      </p>
    </div>
  );
}
