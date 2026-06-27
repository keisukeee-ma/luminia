"use client";

import { supabase } from "./supabase";
import type { Ability } from "@/types/domain";

/** 1能力ぶんの実分布。buckets[1..12] が各 0.5SD 区間の人数（index 0 は未使用）。 */
export interface AbilityDist {
  buckets: number[]; // length 13, index 1..12 を使う
  total: number;
}

export type AgeBandDist = Partial<Record<Ability, AbilityDist>>;

interface Row {
  ability: Ability;
  bucket: number; // 0..13（0=t<20, 13=t>=80）
  cnt: number;
}

/**
 * 年齢帯ごとの全能力ヒストグラムを取得する。
 * width_bucket の端 0/13 はそれぞれ 1/12 に畳む。取得失敗時は null。
 */
export async function fetchAgeBandDistribution(
  ageBand: string
): Promise<AgeBandDist | null> {
  const { data, error } = await supabase.rpc("age_band_distribution", {
    p_age_band: ageBand,
  });
  if (error || !data) {
    console.error("[compare] age_band_distribution failed", error);
    return null;
  }

  const out: AgeBandDist = {};
  for (const r of data as Row[]) {
    const dist = (out[r.ability] ??= { buckets: new Array(13).fill(0), total: 0 });
    const idx = Math.max(1, Math.min(12, r.bucket)); // 0→1, 13→12 に畳む
    dist.buckets[idx] += r.cnt;
    dist.total += r.cnt;
  }
  return out;
}
