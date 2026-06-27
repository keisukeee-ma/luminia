/**
 * 合成データ生成スクリプト（Supabase ノルム・ブートストラップ用）
 *
 * 使い方:
 *   node --env-file=.env.local scripts/seed-data.mjs --sessions=50
 *   → age_band 10種 × 50 = 500 セッションを Supabase に INSERT
 *
 * 注意: 合成データはシステム動作確認用。同じ規準から生成するため規準精度の向上には寄与しない。
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// ---- norms（src/lib/norms/provisional.ts からコピー）----
const NORMS = {
  Gs_coding:          { refAge: 22, mean: 55,   sd: 12,   slopePerYear: -0.35,  higherIsBetter: true },
  Gsm_digit_forward:  { refAge: 22, mean: 5.5,  sd: 0.8,  slopePerYear: -0.02,  higherIsBetter: true },
  Gsm_digit_backward: { refAge: 22, mean: 4.5,  sd: 1.0,  slopePerYear: -0.025, higherIsBetter: true },
  Gf_series:          { refAge: 22, mean: 0.7,  sd: 0.18, slopePerYear: -0.005, higherIsBetter: true },
  Gv_rotation:        { refAge: 22, mean: 0.85, sd: 0.12, slopePerYear: -0.004, higherIsBetter: true },
  Gc_knowledge:       { refAge: 22, mean: 0.7,  sd: 0.15, slopePerYear:  0.002, higherIsBetter: true },
  Glr_recognition:    { refAge: 22, mean: 10.5, sd: 1.5,  slopePerYear: -0.04,  higherIsBetter: true },
};

const POP_REF_AGE = 45;

const TASK_ABILITY = {
  Gs_coding:          'Gs',
  Gsm_digit_forward:  'Gsm',
  Gsm_digit_backward: 'Gsm',
  Gf_series:          'Gf',
  Gv_rotation:        'Gv',
  Gc_knowledge:       'Gc',
  Glr_recognition:    'Glr',
};

const CLAMP = {
  Gs_coding:          { min: 0, max: 120, integer: true },
  Gsm_digit_forward:  { min: 0, max: 6,   integer: true },
  Gsm_digit_backward: { min: 0, max: 6,   integer: true },
  Gf_series:          { min: 0, max: 1,   integer: false },
  Gv_rotation:        { min: 0, max: 1,   integer: false },
  Gc_knowledge:       { min: 0, max: 1,   integer: false },
  Glr_recognition:    { min: 0, max: 12,  integer: true },
};

const AGE_BANDS = ['20-24','25-29','30-34','35-39','40-44','45-49','50-54','55-59','60-64','65-69'];
const AGE_MID   = { '20-24':22,'25-29':27,'30-34':32,'35-39':37,'40-44':42,'45-49':47,'50-54':52,'55-59':57,'60-64':62,'65-69':67 };
const FLUID     = ['Gs','Gsm','Gf','Gv','Glr'];

// Box-Muller 正規乱数
function randn() {
  const u = Math.random() || 1e-10;
  const v = Math.random() || 1e-10;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pickSex() {
  const r = Math.random();
  return r < 0.48 ? 'male' : r < 0.96 ? 'female' : 'other';
}

function generateRaw(taskId, ageMid) {
  const n = NORMS[taskId];
  const meanT = n.mean + n.slopePerYear * (ageMid - n.refAge);
  let raw = meanT + n.sd * randn();
  const c = CLAMP[taskId];
  raw = Math.max(c.min, Math.min(c.max, raw));
  return c.integer ? Math.round(raw) : raw;
}

function zFor(raw, taskId, refAgeMid) {
  const n = NORMS[taskId];
  const meanT = n.mean + n.slopePerYear * (refAgeMid - n.refAge);
  let z = (raw - meanT) / n.sd;
  if (!n.higherIsBetter) z = -z;
  return z;
}

function avg(arr) { return arr.reduce((a, b) => a + b, 0) / arr.length; }

async function seedSession(ageBand) {
  const ageMid    = AGE_MID[ageBand];
  const sex       = pickSex();
  const sessionId = crypto.randomUUID();
  const now       = new Date().toISOString();
  const seed      = Math.floor(Math.random() * 0xffffffff);

  // 各課題の合成スコア生成
  const taskIds   = Object.keys(NORMS);
  const rawScores = Object.fromEntries(taskIds.map(id => [id, generateRaw(id, ageMid)]));

  // 能力ごとに z/t を集計
  const byAbility = {};
  for (const taskId of taskIds) {
    const ability = TASK_ABILITY[taskId];
    const zAge     = zFor(rawScores[taskId], taskId, ageMid);
    const zOverall = zFor(rawScores[taskId], taskId, POP_REF_AGE);
    if (!byAbility[ability]) byAbility[ability] = { age: [], overall: [] };
    byAbility[ability].age.push(zAge);
    byAbility[ability].overall.push(zOverall);
  }

  const abilityScores = {};
  for (const [ability, { age, overall }] of Object.entries(byAbility)) {
    const zAge     = avg(age);
    const zOverall = avg(overall);
    abilityScores[ability] = { zAge, zOverall, tAge: 50 + 10 * zAge, tOverall: 50 + 10 * zOverall };
  }

  // 脳年齢（流動系のみ）
  const fluidZs        = FLUID.filter(a => abilityScores[a]).map(a => abilityScores[a].zAge);
  const fluidComposite = fluidZs.length ? avg(fluidZs) : 0;
  const brainAge       = Math.round(ageMid - fluidComposite / 0.15);
  const gcZ            = abilityScores['Gc']?.zAge ?? null;

  // 1. sessions
  const { error: e1 } = await supabase.from('sessions').insert({
    id: sessionId, status: 'completed', mode: 'core', seed,
    app_version: '0.1.0-synthetic', age_band: ageBand, sex,
    started_at: now, completed_at: now,
  });
  if (e1) { console.error('sessions:', e1.message); return false; }

  // 2. task_scores
  const { error: e2 } = await supabase.from('task_scores').insert(
    taskIds.map(taskId => ({
      session_id: sessionId,
      task_id: taskId,
      ability: TASK_ABILITY[taskId],
      raw_score: rawScores[taskId],
      completed: true,
    }))
  );
  if (e2) { console.error('task_scores:', e2.message); return false; }

  // 3. ability_scores
  const { error: e3 } = await supabase.from('ability_scores').insert(
    Object.entries(abilityScores).map(([ability, s]) => ({
      session_id: sessionId, ability,
      raw_composite: s.zAge,
      z_age: s.zAge,   t_age: s.tAge,
      z_overall: s.zOverall, t_overall: s.tOverall,
      norm_version: 'v0',
    }))
  );
  if (e3) { console.error('ability_scores:', e3.message); return false; }

  // 4. session_results
  const { error: e4 } = await supabase.from('session_results').insert({
    session_id: sessionId,
    brain_age: brainAge,
    brain_age_delta: brainAge - ageMid,
    fluid_composite_z: fluidComposite,
    gc_z: gcZ,
    model_version: 'v1-synthetic',
  });
  if (e4) { console.error('session_results:', e4.message); return false; }

  return true;
}

// ---- main ----
const sessionsArg = process.argv.find(a => a.startsWith('--sessions='));
const N = sessionsArg ? parseInt(sessionsArg.split('=')[1], 10) : 50;

console.log(`Seeding ${AGE_BANDS.length} age_bands × ${N} sessions = ${AGE_BANDS.length * N} total...`);

let ok = 0, ng = 0;
for (const band of AGE_BANDS) {
  for (let i = 0; i < N; i++) {
    (await seedSession(band)) ? ok++ : ng++;
  }
  console.log(`  ${band}: done`);
}
console.log(`\nDone. success=${ok} failed=${ng}`);
