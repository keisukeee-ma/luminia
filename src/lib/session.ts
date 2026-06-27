import type { Ability, Profile } from "@/types/domain";
import type { Trial } from "@/types/scoring";

export type GameKind =
  | "coding"
  | "digitForward"
  | "digitBackward"
  | "series"
  | "rotation"
  | "knowledge"
  | "wordLearn"
  | "wordRecall";

export interface StepDef {
  task_id: string;
  ability: Ability;
  game: GameKind;
  label: string;
}

/**
 * セッション（6能力・8ステップ）。
 * 記憶は学習を前半・再生を末尾に置き、間の課題を自然な遅延にする。
 */
export const STEPS: StepDef[] = [
  { task_id: "Gs_coding", ability: "Gs", game: "coding", label: "記号変換" },
  { task_id: "Glr_word_learn", ability: "Glr", game: "wordLearn", label: "単語をおぼえる" },
  { task_id: "Gsm_digit_forward", ability: "Gsm", game: "digitForward", label: "数唱" },
  { task_id: "Gsm_digit_backward", ability: "Gsm", game: "digitBackward", label: "逆唱" },
  { task_id: "Gf_series", ability: "Gf", game: "series", label: "数列完成" },
  { task_id: "Gv_rotation", ability: "Gv", game: "rotation", label: "心的回転" },
  { task_id: "Gc_knowledge", ability: "Gc", game: "knowledge", label: "知識" },
  { task_id: "Glr_word_recall", ability: "Glr", game: "wordRecall", label: "単語を思い出す" },
];

/** Glr 学習・再生で同じ学習語を共有するための固定 seed オフセット。 */
export const GLR_SEED_OFFSET = 999;

export interface DeviceInfo {
  ua: string;
  viewport: { w: number; h: number; dpr: number };
  touch: boolean;
}

export interface SessionState {
  seed: number;
  profile: Profile;
  stepIndex: number;
  trials: Trial[];
  completed: string[];
  startedAt: number;
  device?: DeviceInfo;
}

const KEY = "brain_session";

function captureDevice(): DeviceInfo | undefined {
  if (typeof window === "undefined") return undefined;
  return {
    ua: navigator.userAgent,
    viewport: {
      w: window.innerWidth,
      h: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
    },
    touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
  };
}

export function createSession(profile: Profile): SessionState {
  return {
    seed: (Math.floor(Math.random() * 0xffffffff) >>> 0) || 1,
    profile,
    stepIndex: 0,
    trials: [],
    completed: [],
    startedAt: Date.now(),
    device: captureDevice(),
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
