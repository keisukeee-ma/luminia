"use client";

import { supabase } from "./supabase";
import { addHistoryEntry, loadHistory, type HistoryEntry } from "./history";
import type { Ability } from "@/types/domain";
import type { AbilityScore, SessionResult, ComputedScores } from "@/types/scoring";

const ALL_ABILITIES: Ability[] = ["Gs", "Gsm", "Gf", "Gv", "Glr", "Gc"];

interface RemoteSession {
  session_id: string;
  completed_at: string;
  age_band: string;
  sex: string;
  brain_age: number | null;
  brain_age_delta: number | null;
  fluid_composite_z: number | null;
  gc_z: number | null;
  model_version: string;
  abilities: Array<{
    ability: Ability;
    raw_composite: number;
    z_age: number;
    t_age: number;
    z_overall: number;
    t_overall: number;
    norm_version: string;
  }> | null;
}

function toHistoryEntry(r: RemoteSession): HistoryEntry {
  const measuredMap = new Map(
    (r.abilities ?? []).map((a) => [a.ability, a])
  );

  const abilities: AbilityScore[] = ALL_ABILITIES.map((ab) => {
    const a = measuredMap.get(ab);
    if (!a) {
      return {
        ability: ab,
        raw_composite: 0,
        z_age: 0,
        t_age: 0,
        z_overall: 0,
        t_overall: 0,
        norm_version: "v0",
        notMeasured: true,
      };
    }
    return {
      ability: a.ability,
      raw_composite: a.raw_composite,
      z_age: a.z_age,
      t_age: a.t_age,
      z_overall: a.z_overall,
      t_overall: a.t_overall,
      norm_version: a.norm_version,
    };
  });

  const result: SessionResult = {
    brain_age: r.brain_age,
    brain_age_delta: r.brain_age_delta,
    fluid_composite_z: r.fluid_composite_z,
    gc_z: r.gc_z,
    model_version: r.model_version,
  };

  const scores: ComputedScores = { tasks: [], abilities, result };

  return {
    id: r.session_id,
    at: new Date(r.completed_at).getTime(),
    profile: { age_band: r.age_band as HistoryEntry["profile"]["age_band"], sex: r.sex as HistoryEntry["profile"]["sex"] },
    scores,
  };
}

/**
 * ログイン済みユーザー自身の履歴を取得する（get_my_history RPC 使用）。
 * 未認証時や失敗時は null。
 */
export async function fetchMyHistory(): Promise<HistoryEntry[] | null> {
  const { data, error } = await supabase.rpc("get_my_history");
  if (error || data === null) {
    console.error("[remote-history] get_my_history failed", error);
    return null;
  }
  return (data as RemoteSession[]).map(toHistoryEntry);
}

/** 指定 user_id のリモート履歴を取得する（UUIDフォールバック用）。失敗時は null。 */
export async function fetchRemoteHistory(userId: string): Promise<HistoryEntry[] | null> {
  const { data, error } = await supabase.rpc("get_user_history", { p_user_id: userId });
  if (error || data === null) {
    console.error("[remote-history] fetch failed", error);
    return null;
  }
  return (data as RemoteSession[]).map(toHistoryEntry);
}

/**
 * リモート履歴をローカルにマージする。
 * 既存エントリ（同じ id）は上書きしない。新しいものだけ追加。
 * 追加件数を返す。
 */
export function mergeIntoLocal(remote: HistoryEntry[]): number {
  const local = loadHistory();
  const existingIds = new Set(local.map((h) => h.id));
  let added = 0;
  for (const entry of remote) {
    if (!existingIds.has(entry.id)) {
      addHistoryEntry({ profile: entry.profile, scores: entry.scores });
      added++;
    }
  }
  return added;
}
