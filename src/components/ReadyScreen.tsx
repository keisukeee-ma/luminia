"use client";

import type { ReactNode } from "react";

interface Props {
  title: string;
  description: ReactNode;
  example?: ReactNode;
  onStart: () => void;
}

/** ゲーム開始前の準備画面（タイトル・説明・例示・始める）。 */
export default function ReadyScreen({ title, description, example, onStart }: Props) {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-data text-3xl text-ink">{title}</h1>
        <div className="mt-4 text-base leading-relaxed text-muted">{description}</div>
        {example && (
          <div className="mt-6 bg-paper border border-border rounded-lg p-5">
            {example}
          </div>
        )}
        <button
          onClick={onStart}
          className="mt-8 bg-brass text-white rounded-md px-10 py-3.5 text-lg font-body"
        >
          始める
        </button>
      </div>
    </div>
  );
}
