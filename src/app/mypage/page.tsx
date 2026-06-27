"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory, type HistoryEntry } from "@/lib/history";
import ResultsView from "@/components/ResultsView";

export default function MyPage() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    // 旧形式・壊れたエントリを除外して安全に表示する
    setHistory(loadHistory().filter((h) => h && h.scores && Array.isArray(h.scores.abilities)));
  }, []);

  if (history === null) return null;

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-data text-2xl text-ink">マイページ</h1>
        <p className="mt-4 text-base text-muted">まだ計測結果がありません。</p>
        <Link
          href="/setup"
          className="inline-block mt-6 bg-brass text-white rounded-md px-8 py-3 font-body"
        >
          計測をはじめる
        </Link>
      </div>
    );
  }

  const entry = history[Math.min(sel, history.length - 1)];

  return (
    <div className="mx-auto max-w-xl w-full px-4 py-10">
      <h1 className="font-data text-2xl text-ink">マイページ</h1>
      <p className="mt-1 text-base text-muted">これまでの計測：{history.length}件</p>

      <div className="mt-4 flex flex-col gap-2">
        {history.map((h, i) => (
          <button
            key={h.id}
            onClick={() => setSel(i)}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
            style={
              i === sel
                ? { borderColor: "var(--brass)", background: "var(--paper)" }
                : { borderColor: "var(--border)" }
            }
          >
            <span className="text-base text-ink">
              {new Date(h.at).toLocaleString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <span className="font-data text-ink">
              脳年齢 {h.scores.result.brain_age ?? "—"} 歳
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-border">
        <ResultsView key={entry.id} scores={entry.scores} />
      </div>
    </div>
  );
}
