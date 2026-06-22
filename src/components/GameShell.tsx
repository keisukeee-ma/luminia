"use client";

import { useState, type ReactNode } from "react";

interface Props {
  abilityLabel: string;
  stepLabel: string;
  stepIndex: number;
  total: number;
  onSaveExit: () => void;
  children: ReactNode;
}

/** 全ゲーム共通の外枠: ヘッダ・進捗ゲージ・終了確認。 */
export default function GameShell({
  abilityLabel,
  stepLabel,
  stepIndex,
  total,
  onSaveExit,
  children,
}: Props) {
  const [confirm, setConfirm] = useState(false);
  const pct = Math.min(100, (stepIndex / total) * 100);

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-border bg-paper">
        <div className="mx-auto max-w-3xl px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => setConfirm(true)}
            className="text-sm text-muted hover:text-ink"
          >
            ← ホーム
          </button>
          <div className="text-sm text-muted">
            <span className="text-ink font-body">{abilityLabel}</span>
            <span className="mx-1.5">·</span>
            {stepLabel}
          </div>
          <div className="text-sm text-muted tabular-nums">
            {stepIndex + 1} / {total}
          </div>
        </div>
        <div className="h-1.5 bg-border">
          <div
            className="h-full bg-brass transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col">{children}</div>

      {confirm && (
        <div className="fixed inset-0 z-30 bg-ink/40 flex items-center justify-center px-4">
          <div className="bg-paper border border-border rounded-lg max-w-sm w-full p-6">
            <p className="font-body text-ink">計測を中断しますか？</p>
            <p className="text-sm text-muted mt-2">
              ここまでの結果は保存されます。
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={onSaveExit}
                className="flex-1 bg-brass text-white rounded-md py-2 text-sm"
              >
                保存して終了
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 border border-border text-ink rounded-md py-2 text-sm"
              >
                続ける
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
