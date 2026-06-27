"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory } from "@/lib/history";
import { ABILITY_LABEL } from "@/types/domain";
import { fetchAgeBandDistribution, type AgeBandDist } from "@/lib/compare";
import DistributionMeter from "@/components/DistributionMeter";
import PopulationHistogram from "@/components/PopulationHistogram";
import type { ComputedScores } from "@/types/scoring";

const MIN_N = 20; // 実データ比較に必要な最低人数（下回れば理論カーブにフォールバック）

export default function DashboardPage() {
  const [scores, setScores] = useState<ComputedScores | null | undefined>(undefined);
  const [ageBand, setAgeBand] = useState<string | null>(null);
  const [dist, setDist] = useState<AgeBandDist | null>(null);
  const [loadingDist, setLoadingDist] = useState(false);

  useEffect(() => {
    const h = loadHistory();
    setScores(h[0]?.scores ?? null);
    setAgeBand(h[0]?.profile?.age_band ?? null);
  }, []);

  useEffect(() => {
    if (!ageBand) return;
    setLoadingDist(true);
    fetchAgeBandDistribution(ageBand)
      .then(setDist)
      .finally(() => setLoadingDist(false));
  }, [ageBand]);

  if (scores === undefined) return null;

  if (!scores) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-data text-2xl text-ink">全国比較</h1>
        <p className="mt-4 text-base text-muted">比較するには、まず計測してください。</p>
        <Link
          href="/setup"
          className="inline-block mt-6 bg-brass text-white rounded-md px-8 py-3 font-body"
        >
          計測をはじめる
        </Link>
      </div>
    );
  }

  const brainAge = scores.result.brain_age;
  // 母集団人数（能力ごとに total は揃うので最大値を代表値に）
  const popN = dist ? Math.max(0, ...Object.values(dist).map((d) => d?.total ?? 0)) : 0;
  const hasReal = popN >= MIN_N;

  return (
    <div className="mx-auto max-w-xl w-full px-4 py-10">
      <h1 className="font-data text-2xl text-ink">全国比較</h1>
      <p className="mt-2 text-base text-muted leading-relaxed">
        {hasReal
          ? `同年代（${ageBand}）${popN}人の中での、あなたの位置です。山が高いところに人が多く、ゴールドの線があなたです。`
          : "あなたの結果を、標準的な分布（平均50・偏差値）の中で見た位置です。山の真ん中が平均、ゴールドの線があなたです。"}
      </p>

      {brainAge !== null && (
        <div className="mt-6 bg-paper border border-border rounded-lg px-5 py-4 text-center">
          <span className="text-base text-muted">あなたの脳年齢（暫定）</span>
          <div className="font-data text-ink mt-1" style={{ fontSize: 40, lineHeight: 1 }}>
            {brainAge} <span className="text-xl text-muted">歳</span>
          </div>
        </div>
      )}

      <div className="mt-6 bg-paper border border-border rounded-lg px-5 py-3">
        {loadingDist && (
          <p className="py-4 text-base text-muted text-center">分布を読み込み中…</p>
        )}
        {!loadingDist &&
          scores.abilities.map((a) => {
            if (a.notMeasured) {
              return (
                <div key={a.ability} className="py-3 flex items-baseline justify-between">
                  <span className="font-body text-base text-ink">
                    {ABILITY_LABEL[a.ability]}
                  </span>
                  <span className="text-base text-muted">測定不能</span>
                </div>
              );
            }
            const d = dist?.[a.ability];
            if (hasReal && d && d.total >= MIN_N) {
              return (
                <PopulationHistogram
                  key={a.ability}
                  label={ABILITY_LABEL[a.ability]}
                  userT={a.t_age}
                  buckets={d.buckets}
                  total={d.total}
                />
              );
            }
            return (
              <DistributionMeter
                key={a.ability}
                label={ABILITY_LABEL[a.ability]}
                t={a.t_age}
              />
            );
          })}
      </div>

      <p className="mt-6 text-base leading-relaxed text-muted">
        {hasReal
          ? "※ 棒グラフは同年代の実際の参加者の分布です。参加者が増えるほど、より実態に近い比較になります。"
          : "※ まだ同年代のデータが少ないため、文献ベースの暫定規準（v0）との比較を表示しています。"}
      </p>
    </div>
  );
}
