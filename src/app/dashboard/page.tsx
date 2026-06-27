"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory } from "@/lib/history";
import { ABILITY_LABEL } from "@/types/domain";
import DistributionMeter from "@/components/DistributionMeter";
import type { ComputedScores } from "@/types/scoring";

export default function DashboardPage() {
  const [scores, setScores] = useState<ComputedScores | null | undefined>(undefined);

  useEffect(() => {
    const h = loadHistory();
    setScores(h[0]?.scores ?? null);
  }, []);

  if (scores === undefined) return null;

  if (!scores) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-data text-2xl text-ink">みんなとの比較</h1>
        <p className="mt-4 text-base text-muted">
          比較するには、まず計測してください。
        </p>
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

  return (
    <div className="mx-auto max-w-xl w-full px-4 py-10">
      <h1 className="font-data text-2xl text-ink">みんなとの比較</h1>
      <p className="mt-2 text-base text-muted leading-relaxed">
        あなたの最新の結果を、標準的な分布（平均50・偏差値）の中で見た位置です。
        山の真ん中が平均、ゴールドの線があなたです。
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
        {scores.abilities.map((a) => (
          <DistributionMeter key={a.ability} label={ABILITY_LABEL[a.ability]} t={a.t_age} />
        ))}
      </div>

      <p className="mt-6 text-base leading-relaxed text-muted">
        ※ 現在は文献ベースの暫定規準（v0）との比較です。実際のユーザー同士の比較は、
        データが集まり次第（サーバー連携で）対応します。
      </p>
    </div>
  );
}
