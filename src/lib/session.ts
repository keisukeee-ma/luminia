import type { Ability, Profile } from "@/types/domain";
import type { Trial } from "@/types/scoring";

export interface StepDef {
  task_id: string;
  ability: Ability;
  game: "coding" | "digitForward" | "digitBackward" | "series";
  label: string;
}

/** 縦切り版セッション（測定4ステップ）。 */
export const STEPS: StepDef[] = [
  { task_id: "Gs_coding", ability: "Gs", game: "coding", label: "記号変換" },
  { task_id: "Gsm_digit_forward", ability: "Gsm", game: "digitForward", label: "数唱" },
  { task_id: "Gsm_digit_backward", ability: "Gsm", game: "digitBackward", label: "逆唱" },
  { task_id: "Gf_series", ability: "Gf", game: "series", label: "数列完成" },
];

export interface SessionState {
  seed: number;
  profile: Profile;
  stepIndex: number;
  trials: Trial[];
  completed: string[];
  startedAt: number;
}

const KEY = "brain_session";

export function createSession(profile: Profile): SessionState {
  return {
    seed: (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1,
    profile,
    stepIndex: 0,
    trials: [],
    completed: [],
    startedAt: Date.now(),
  };
}

export function loadSession(): SessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionState) : null;
  } catch {
    return null;
  }
}

export function saveSession(s: SessionState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

/** 採点課題の完了: trials を追記し completed に登録、次ステップへ。 */
export function completeTask(s: SessionState, taskId: string, trials: Trial[]): SessionState {
  const next: SessionState = {
    ...s,
    trials: [...s.trials, ...trials],
    completed: s.completed.includes(taskId) ? s.completed : [...s.completed, taskId],
    stepIndex: s.stepIndex + 1,
  };
  saveSession(next);
  return next;
}

/** 非採点ステップ（学習・干渉）の通過。 */
export function advanceStep(s: SessionState): SessionState {
  const next = { ...s, stepIndex: s.stepIndex + 1 };
  saveSession(next);
  return next;
}

export const isFinished = (s: SessionState): boolean => s.stepIndex >= STEPS.length;
