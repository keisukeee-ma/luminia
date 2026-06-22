import type { Profile } from "@/types/domain";
import type { ComputedScores } from "@/types/scoring";

export interface HistoryEntry {
  id: string;
  at: number;
  profile: Profile;
  scores: ComputedScores;
}

const KEY = "brain_history";

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, "id" | "at">): HistoryEntry {
  const full: HistoryEntry = {
    ...entry,
    id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    at: Date.now(),
  };
  const all = [full, ...loadHistory()];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  }
  return full;
}
