"use client";

import { supabase } from "./supabase";
import { getUserId } from "./userId";
import type { SessionState } from "./session";
import type { ComputedScores } from "@/types/scoring";

function deviceType(s: SessionState): string {
  const w = s.device?.viewport.w ?? 1024;
  if (s.device?.touch && w < 768) return "mobile";
  if (s.device?.touch && w < 1024) return "tablet";
  return "desktop";
}

export async function syncSession(
  s: SessionState,
  computed: ComputedScores
): Promise<void> {
  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  // 認証済みなら auth.uid()、未認証なら localStorage UUID
  const { data: { session: authSession } } = await supabase.auth.getSession();
  const userId = authSession?.user?.id ?? (getUserId() || null);

  // 1. sessions
  const { error: sessErr } = await supabase.from("sessions").insert({
    id: sessionId,
    user_id: userId,
    status: "completed",
    mode: "core",
    seed: s.seed,
    app_version: "0.1.0",
    device_type: deviceType(s),
    input_method: s.device?.touch ? "touch" : "mouse",
    viewport: s.device?.viewport ?? null,
    age_band: s.profile.age_band,
    sex: s.profile.sex,
    postal_code: s.profile.postal_code?.slice(0, 3) ?? null,
    occupation: s.profile.occupation ?? null,
    job_type: s.profile.job_type ?? null,
    industry: s.profile.industry ?? null,
    started_at: new Date(s.startedAt).toISOString(),
    completed_at: now,
  });
  if (sessErr) {
    console.error("[sync] sessions insert failed", sessErr);
    return;
  }

  // 2. trials（採点課題のみ）
  const scoringTrials = s.trials.filter((t) => t.correct !== null || t.task_id !== "Glr_word_learn");
  if (scoringTrials.length > 0) {
    const { error: trialsErr } = await supabase.from("trials").insert(
      scoringTrials.map((t, i) => ({
        session_id: sessionId,
        task_id: t.task_id,
        ability: t.ability,
        ordinal: t.ordinal ?? i,
        difficulty: t.difficulty ?? null,
        item_id: t.item_id ?? null,
        params: t.params ?? null,
        response: t.response,
        correct: t.correct,
        rt_ms: t.rt_ms,
        input_method: t.input_method ?? null,
        extra: t.extra ?? null,
      }))
    );
    if (trialsErr) console.error("[sync] trials insert failed", trialsErr);
  }

  // 3. task_scores
  if (computed.tasks.length > 0) {
    const { error: tsErr } = await supabase.from("task_scores").insert(
      computed.tasks.map((ts) => ({
        session_id: sessionId,
        task_id: ts.task_id,
        ability: ts.ability,
        raw_score: ts.raw_score,
        metrics: ts.metrics ?? null,
        completed: ts.completed,
      }))
    );
    if (tsErr) console.error("[sync] task_scores insert failed", tsErr);
  }

  // 4. ability_scores
  if (computed.abilities.length > 0) {
    const { error: asErr } = await supabase.from("ability_scores").insert(
      computed.abilities.map((ab) => ({
        session_id: sessionId,
        ability: ab.ability,
        raw_composite: ab.raw_composite,
        z_age: ab.z_age,
        t_age: ab.t_age,
        z_overall: ab.z_overall,
        t_overall: ab.t_overall,
        norm_version: ab.norm_version,
      }))
    );
    if (asErr) console.error("[sync] ability_scores insert failed", asErr);
  }

  // 5. session_results
  const r = computed.result;
  const { error: srErr } = await supabase.from("session_results").insert({
    session_id: sessionId,
    brain_age: r.brain_age,
    brain_age_delta: r.brain_age_delta,
    fluid_composite_z: r.fluid_composite_z,
    gc_z: r.gc_z,
    model_version: r.model_version,
  });
  if (srErr) console.error("[sync] session_results insert failed", srErr);
}
