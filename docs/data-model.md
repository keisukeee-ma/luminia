# データモデル / Supabase スキーマ

## 方針（既存の役割分担を踏襲）
- **localStorage = 自分の結果の一次保存**（結果画面・履歴の読み取り元）。
- **Supabase = 匿名データの書き込みシンク ＋ 規準/集計の読み取り専用**。
- → ユーザーは自分のPIIをSupabaseから読み戻さない。RLSは原則 **anon=INSERTのみ**、SELECTは規準テーブルと集計RPCに限定。認証不要。

## 標準化（偏差値・脳年齢）の処理フロー
1. セッション完了 → クライアントが trials を集計し task 生スコアを算出（既に手元にある）。
2. 公開 `norms` を該当 (task/ability, age_band, sex) で取得。
3. 能力ごとに z・T（`50+10z`）を計算。流動系コンポジット → `score_models` の係数で脳年齢を推定。
4. 結果を localStorage に保存（一次） ＋ 匿名行を Supabase に INSERT（蓄積）。
5. 蓄積データから定期的に経験的規準を再計算 → `norms` を version 更新（暫定→経験）。

---

## ENUM
```sql
create type ability        as enum ('Gs','Gsm','Gf','Gv','Glr','Gc');
create type session_status as enum ('in_progress','partial','completed');
create type session_mode   as enum ('core','extended');
create type norm_source    as enum ('provisional','empirical');
```

## テーブル定義

### participants（再受験の紐付け・任意）
クライアントが localStorage に保持する uuid。匿名のまま複数セッションを緩く連結。
```sql
create table participants (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
```

### sessions
属性は「計測前=age_band・sex」「結果後に任意で残り」を反映し、後半属性は NULL 許容。
```sql
create table sessions (
  id            uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id),
  status        session_status not null default 'in_progress',
  mode          session_mode   not null default 'core',
  seed          bigint not null,                  -- 生成型の再現用
  app_version   text,
  -- 端末（RT規準の補正に必要）
  device_type   text,            -- 'mobile' | 'tablet' | 'desktop'
  input_method  text,            -- 'touch' | 'mouse' | 'key'
  viewport      jsonb,           -- {w,h,dpr}
  -- 属性（計測前）
  age_band      text,            -- '20-24' 等 5歳刻み
  sex           text,            -- 'male'|'female'|'other'|'na'
  -- 属性（結果後・任意）
  postal_code   text,            -- 上3桁推奨（識別性低減）
  occupation    text,
  job_type      text,
  industry      text,
  job_position  text,
  education     text,
  started_at    timestamptz not null default now(),
  completed_at  timestamptz
);
create index on sessions (age_band, sex);
create index on sessions (status);
```

### trials（最重要・項目レベル生ログ）
```sql
create table trials (
  id           bigint generated always as identity primary key,
  session_id   uuid not null references sessions(id) on delete cascade,
  task_id      text not null,          -- 'Gs_coding' 等
  ability      ability not null,
  ordinal      int not null,           -- task内の出題順
  difficulty   numeric,                -- 生成型はparams由来 / バンクはitem.difficulty
  item_id      text,                   -- バンク項目ID（生成型は null）
  params       jsonb,                  -- 生成型の生成パラメータ
  response     jsonb,
  correct      boolean,                -- 非採点(learn/distractor)は null
  rt_ms        int,                    -- 入力受付可能〜確定
  input_method text,
  extra        jsonb,                  -- partial, distractor_type, 桁別rt, 系列位置 等
  created_at   timestamptz not null default now()
);
create index on trials (session_id);
create index on trials (task_id);
create index on trials (ability);
```

### task_scores（課題集計・1セッション1課題）
```sql
create table task_scores (
  id         bigint generated always as identity primary key,
  session_id uuid not null references sessions(id) on delete cascade,
  task_id    text not null,
  ability    ability not null,
  raw_score  numeric,                  -- throughput / maxSpan / accuracy 等
  metrics    jsonb,                    -- rt_median, rt_sd, false_alarm, slope 等
  completed  boolean not null default true,
  unique (session_id, task_id)
);
create index on task_scores (task_id);
```

### ability_scores（能力偏差値・1セッション1能力）
```sql
create table ability_scores (
  id            bigint generated always as identity primary key,
  session_id    uuid not null references sessions(id) on delete cascade,
  ability       ability not null,
  raw_composite numeric,
  z_age numeric, t_age numeric,        -- 同年齢帯比
  z_overall numeric, t_overall numeric,-- 全体比
  norm_version  text,                  -- 使用した規準のversion（スナップショット）
  unique (session_id, ability)
);
```

### session_results（脳年齢）
```sql
create table session_results (
  session_id        uuid primary key references sessions(id) on delete cascade,
  brain_age         numeric,
  brain_age_delta   numeric,           -- brain_age - 実年齢中央値
  fluid_composite_z numeric,
  gc_z              numeric,
  model_version     text,
  computed_at       timestamptz default now()
);
```

### norms（規準・公開読み取り）
```sql
create table norms (
  id         bigint generated always as identity primary key,
  scope      text not null,            -- 'task' | 'ability'
  key        text not null,            -- task_id or ability
  metric     text not null,            -- 標準化する生指標名
  age_band   text not null,
  sex        text not null default 'all',
  mean       numeric not null,
  sd         numeric not null,
  n          int not null default 0,
  source     norm_source not null default 'provisional',
  version    text not null,
  updated_at timestamptz default now(),
  unique (scope, key, metric, age_band, sex, version)
);
```

### score_models（脳年齢回帰の係数・公開読み取り）
```sql
create table score_models (
  id           text primary key,       -- 'brain_age_v1'
  kind         text not null,          -- 'brain_age'
  coefficients jsonb not null,         -- {intercept, weights:{Gs,Gsm,Gf,Gv,Glr,Gc}}
  version      text not null,
  active       boolean default true
);
```

### items（バンク項目・任意・公開読み取り）
生成型には不要。語彙/知識/ことわざ/行列で使用。IRT難易度を更新可能にするためDB管理。
```sql
create table items (
  id         text primary key,         -- 'Gc_vocab_001'
  ability    ability not null,
  task_id    text not null,
  difficulty numeric,                  -- IRT b（暫定→更新）
  content    jsonb not null,           -- {prompt, options, correct_index, ...}
  active     boolean default true
);
create index on items (task_id) where active;
```
> 注意: `content` に正解を含めるとクライアントへ露出する。知識クイズの不正対策が要る場合は正解をサーバ側に置き採点RPC化する（MVPはクライアント採点で許容）。

---

## RLS（行レベルセキュリティ）

```sql
-- 書き込み専用テーブル: anon は INSERT のみ、SELECT 不可
alter table sessions        enable row level security;
alter table trials          enable row level security;
alter table task_scores     enable row level security;
alter table ability_scores  enable row level security;
alter table session_results enable row level security;
alter table participants    enable row level security;

create policy ins_sessions   on sessions        for insert to anon with check (true);
create policy ins_trials     on trials          for insert to anon with check (true);
create policy ins_tasks      on task_scores     for insert to anon with check (true);
create policy ins_abilities  on ability_scores  for insert to anon with check (true);
create policy ins_results    on session_results for insert to anon with check (true);
create policy ins_participants on participants  for insert to anon with check (true);
-- ↑ SELECT ポリシーを作らない = anon は他人/自分のPIIを読めない

-- 参照専用テーブル: 公開 SELECT
alter table norms        enable row level security;
alter table score_models enable row level security;
alter table items        enable row level security;
create policy sel_norms   on norms        for select to anon using (true);
create policy sel_models  on score_models for select to anon using (true);
create policy sel_items   on items        for select to anon using (active);
```

## ダッシュボード集計（PIIを返さない）
他人との比較は **SECURITY DEFINER の RPC** で集計値のみ返す（行は返さない）。
```sql
create or replace function ability_distribution(p_ability ability, p_age_band text)
returns table (bucket int, cnt int) language sql security definer set search_path = public as $$
  select width_bucket(t_age, 20, 80, 12) as bucket, count(*)::int
  from ability_scores a join sessions s on s.id = a.session_id
  where a.ability = p_ability and s.age_band = p_age_band and s.status = 'completed'
  group by 1 order by 1;
$$;
revoke all on function ability_distribution(ability, text) from public;
grant execute on function ability_distribution(ability, text) to anon;
```

---

## 規準のブートストラップと更新
- 初期: `norms` に **文献ベースの暫定値**（source='provisional', version='v0'）を投入。
- 蓄積後: 各 (scope,key,metric,age_band,sex) の mean/sd を実データから再計算し source='empirical' で version 更新。
- `ability_scores.norm_version` / `session_results.model_version` に使用versionを記録 → 後から再計算・比較可能。

## プライバシー
- PII（氏名/メール）は保持しない。`postal_code` は**上3桁**で保存し識別性を下げる。
- `age_band`+`postal_code`+`occupation` は準識別子になり得るが、読み戻し不可＋集計RPCのみで露出を抑える。
- 後半属性（職業等）は結果後に任意入力（離脱対策と整合）。

## TypeScript型
`supabase gen types typescript` で `src/types/database.ts` を生成し、scoring/norms 層から参照する。
