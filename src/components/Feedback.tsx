"use client";

/** 全ゲーム共通の ○/× オーバーレイ。feedback が null のときは非表示。 */
export default function Feedback({ feedback }: { feedback: boolean | null }) {
  if (feedback === null) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
      <span
        className="font-data leading-none"
        style={{ fontSize: 120, color: feedback ? "var(--green)" : "var(--red)" }}
      >
        {feedback ? "○" : "×"}
      </span>
    </div>
  );
}
