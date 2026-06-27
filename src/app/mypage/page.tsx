"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadHistory, type HistoryEntry } from "@/lib/history";
import { STEPS } from "@/lib/session";
import ResultsView from "@/components/ResultsView";
import TrendChart from "@/components/TrendChart";
import type { Trial } from "@/types/scoring";

const TASK_LABEL: Record<string, string> = Object.fromEntries(
  STEPS.map((s) => [s.task_id, s.label])
);

/** 反応時間バーチャート（タスクごとの試行 RT を可視化）。 */
function RtChart({ trials }: { trials: Trial[] }) {
  const timed = trials.filter((t) => t.rt_ms !== null && t.rt_ms > 0);
  if (timed.length === 0) return null;

  const rts = timed.map((t) => t.rt_ms as number);
  const maxRt = Math.max(...rts);
  const avgRt = Math.round(rts.reduce((s, v) => s + v, 0) / rts.length);

  const W = 300;
  const H = 40;
  const barW = Math.min(20, (W - 4) / timed.length - 2);
  const gap = (W - 4 - timed.length * barW) / Math.max(1, timed.length - 1);
  const avgX = (avgRt / maxRt) * H; // used for dashed line

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted">反応時間</span>
        <span className="text-xs text-muted tabular-nums">平均 {avgRt} ms</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="反応時間">
        {/* 平均 dashed 横線 */}
        <line
          x1="0"
          y1={H - avgX}
          x2={W}
          y2={H - avgX}
          stroke="var(--muted)"
          strokeWidth="1"
          strokeDasharray="3 3"
          opacity="0.6"
        />
        {timed.map((t, i) => {
          const x = 2 + i * (barW + gap);
          const barH = ((t.rt_ms as number) / maxRt) * (H - 2);
          const fill = t.correct === false
            ? "var(--red)"
            : t.correct === true
            ? "var(--blue)"
            : "var(--muted)";
          return (
            <rect
              key={i}
              x={x}
              y={H - barH}
              width={barW}
              height={barH}
              rx="2"
              fill={fill}
              opacity="0.6"
              aria-label={`${t.rt_ms}ms`}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted mt-0.5 tabular-nums">
        <span>速い</span>
        <span>遅い ▶ {Math.round(maxRt)}ms</span>
      </div>
    </div>
  );
}

function TrialReview({ trials }: { trials: Trial[] }) {
  const byTask = new Map<string, Trial[]>();
  for (const t of trials) {
    if (t.correct === null) continue;
    const arr = byTask.get(t.task_id) ?? [];
    arr.push(t);
    byTask.set(t.task_id, arr);
  }
  const taskOrder = STEPS.map((s) => s.task_id).filter((id) => byTask.has(id));

  if (taskOrder.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-body text-ink text-lg mb-4">回答の振り返り</h2>
      <div className="flex flex-col gap-4">
        {taskOrder.map((taskId) => {
          const ts = byTask.get(taskId)!;
          const nCorrect = ts.filter((t) => t.correct).length;
          return (
            <div key={taskId} className="bg-paper border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-ink text-base">
                  {TASK_LABEL[taskId] ?? taskId}
                </span>
                <span className="text-base text-muted tabular-nums">
                  {nCorrect} / {ts.length} 正解
                </span>
              </div>
              {/* ○/× グリッド */}
              <div className="flex flex-wrap gap-1.5">
                {ts.map((t, i) => (
                  <div
                    key={i}
                    title={t.rt_ms != null ? `${t.rt_ms}ms` : undefined}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-data"
                    style={{
                      background: t.correct ? "var(--green)" : "var(--red)",
                      color: "#fff",
                    }}
                  >
                    {t.correct ? "○" : "×"}
                  </div>
                ))}
              </div>
              {/* 反応時間バー */}
              <RtChart trials={ts} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function MyPage() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [sel, setSel] = useState(0);

  useEffect(() => {
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

      {/* 経時変化グラフ（2件以上のとき） */}
      <TrendChart history={history} />

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
        {entry.trials && entry.trials.length > 0 && (
          <TrialReview trials={entry.trials} />
        )}
      </div>
    </div>
  );
}
