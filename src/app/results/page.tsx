"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession, clearSession } from "@/lib/session";
import { computeScores } from "@/lib/scoring";
import { addHistoryEntry } from "@/lib/history";
import { syncSession } from "@/lib/sync";
import ResultsView from "@/components/ResultsView";
import type { ComputedScores } from "@/types/scoring";

export default function ResultsPage() {
  const router = useRouter();
  const [scores, setScores] = useState<ComputedScores | null>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const s = loadSession();
    if (!s) {
      router.replace("/");
      return;
    }
    const computed = computeScores(s);
    if (computed.tasks.length > 0) {
      addHistoryEntry({ profile: s.profile, scores: computed, trials: s.trials });
      syncSession(s, computed).catch((e) => console.error("[sync]", e));
    }
    clearSession();
    setScores(computed);
  }, [router]);

  if (!scores) return null;

  return (
    <div className="flex-1">
      <ResultsView scores={scores} />
      <div className="text-center pb-12">
        <Link href="/" className="text-base text-brass underline">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
