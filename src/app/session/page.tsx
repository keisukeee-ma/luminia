"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadSession,
  completeTask,
  clearSession,
  isFinished,
  STEPS,
  GLR_SEED_OFFSET,
  type SessionState,
} from "@/lib/session";
import { stepSeed } from "@/lib/rng";
import { computeScores } from "@/lib/scoring";
import { addHistoryEntry } from "@/lib/history";
import { ABILITY_LABEL } from "@/types/domain";
import type { Trial } from "@/types/scoring";
import GameShell from "@/components/GameShell";
import Gs_Coding from "@/games/Gs_Coding";
import Gsm_DigitSpan from "@/games/Gsm_DigitSpan";
import Gf_Series from "@/games/Gf_Series";
import Gv_Rotation from "@/games/Gv_Rotation";
import Gc_Knowledge from "@/games/Gc_Knowledge";
import Glr_WordLearn from "@/games/Glr_WordLearn";
import Glr_WordRecall from "@/games/Glr_WordRecall";

export default function SessionPage() {
  const router = useRouter();
  const [session, setSession] = useState<SessionState | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace("/setup");
      return;
    }
    if (isFinished(s)) {
      router.replace("/results");
      return;
    }
    setSession(s);
    setReady(true);
  }, [router]);

  // 完了検知（updater 内で遷移しない）
  useEffect(() => {
    if (session && isFinished(session)) router.replace("/results");
  }, [session, router]);

  const handleComplete = useCallback((trials: Trial[]) => {
    setSession((prev) =>
      prev ? completeTask(prev, STEPS[prev.stepIndex].task_id, trials) : prev,
    );
  }, []);

  const handleSaveExit = useCallback(() => {
    const s = loadSession();
    if (s) {
      const scores = computeScores(s);
      if (scores.tasks.length > 0) addHistoryEntry({ profile: s.profile, scores });
    }
    clearSession();
    router.push("/");
  }, [router]);

  if (!ready || !session || isFinished(session)) return null;

  const step = STEPS[session.stepIndex];
  const seed = stepSeed(session.seed, session.stepIndex);
  // Glr 学習・再生は同じ学習語を共有するため固定オフセットの seed を使う
  const glrSeed = stepSeed(session.seed, GLR_SEED_OFFSET);

  let game = null;
  switch (step.game) {
    case "coding":
      game = <Gs_Coding key={step.task_id} seed={seed} onComplete={handleComplete} />;
      break;
    case "digitForward":
      game = <Gsm_DigitSpan key={step.task_id} mode="forward" seed={seed} onComplete={handleComplete} />;
      break;
    case "digitBackward":
      game = <Gsm_DigitSpan key={step.task_id} mode="backward" seed={seed} onComplete={handleComplete} />;
      break;
    case "series":
      game = <Gf_Series key={step.task_id} seed={seed} onComplete={handleComplete} />;
      break;
    case "rotation":
      game = <Gv_Rotation key={step.task_id} seed={seed} onComplete={handleComplete} />;
      break;
    case "knowledge":
      game = <Gc_Knowledge key={step.task_id} seed={seed} onComplete={handleComplete} />;
      break;
    case "wordLearn":
      game = <Glr_WordLearn key={step.task_id} seed={glrSeed} onComplete={handleComplete} />;
      break;
    case "wordRecall":
      game = <Glr_WordRecall key={step.task_id} seed={glrSeed} onComplete={handleComplete} />;
      break;
  }

  return (
    <GameShell
      abilityLabel={ABILITY_LABEL[step.ability]}
      stepLabel={step.label}
      stepIndex={session.stepIndex}
      total={STEPS.length}
      onSaveExit={handleSaveExit}
    >
      {game}
    </GameShell>
  );
}
