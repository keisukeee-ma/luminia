"use client";

import { useState } from "react";
import type { ComputedScores } from "@/types/scoring";
import { ABILITY_LABEL } from "@/types/domain";

function buildShareText(scores: ComputedScores): string {
  const age = scores.result.brain_age;
  const delta = scores.result.brain_age_delta;
  const deltaStr =
    delta !== null ? `（実年齢より${delta > 0 ? "+" : ""}${delta}歳）` : "";

  const lines = [`脳年齢：${age !== null ? age + "歳" : "測定不能"}${deltaStr}`, ""];

  for (const a of scores.abilities) {
    if (a.notMeasured) {
      lines.push(`${ABILITY_LABEL[a.ability]}：測定不能`);
    } else {
      lines.push(`${ABILITY_LABEL[a.ability]}：偏差値 ${a.t_age.toFixed(1)}`);
    }
  }

  return lines.join("\n");
}

export default function ShareButton({ scores }: { scores: ComputedScores }) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    const text = buildShareText(scores);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "脳年齢測定結果", text });
        return;
      } catch {
        // キャンセルまたは失敗 → クリップボードにフォールバック
      }
    }
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      // clipboard blocked — do nothing
    }
  };

  return (
    <button
      onClick={handleShare}
      className="mt-4 w-full rounded-md border font-body text-base py-3 transition-colors"
      style={
        state === "copied"
          ? { borderColor: "var(--green)", color: "var(--green)" }
          : { borderColor: "var(--brass)", color: "var(--brass)" }
      }
    >
      {state === "copied" ? "コピーしました" : "結果をシェアする"}
    </button>
  );
}
