# 生成型課題 アルゴリズム仕様

生成型（パラメータで無限に出題できる）課題の生成・採点・ログを実装直結レベルで定義する。
擬似コードはTypeScript準拠。対象: 記号変換 / 一致判定 / 数唱・逆唱 / 空間スパン / 数列完成 / 心的回転。

---

## 0. 共通基盤

### 0.1 シード付き乱数（再現性）
各セッションで `seed` を1つ生成し保存。全課題の項目はこのseed＋課題インデックスから決定論的に生成できる → 監査・再現・難易度統制が可能。

```ts
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296; // [0,1)
  };
}
const randInt = (rng: () => number, lo: number, hi: number) =>
  lo + Math.floor(rng() * (hi - lo + 1));            // 両端含む
const pick = <T>(rng: () => number, arr: T[]) => arr[Math.floor(rng() * arr.length)];
function shuffle<T>(rng: () => number, a: T[]) {     // Fisher–Yates
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
```

### 0.2 生成項目とログの共通型
生成型でも「項目の同一性」を残すため、生成パラメータをそのまま `item_params` として trial に保存する（IRT不要・difficultyはparamsで一意）。

```ts
interface GeneratedItem<P> { task_id: string; difficulty: number; params: P; }
interface Trial<P, R> {
  session_id: string; task_id: string; ordinal: number;
  difficulty: number; params: P;
  response: R; correct: boolean; rt_ms: number;          // rt = 反応可能になってから入力まで
  input_method: 'touch' | 'mouse' | 'key';
}
```
**RT計測の起点**: 刺激が完全提示され入力受付可能になった時刻。終点は確定入力。

---

## 1. 記号変換（Digit-Symbol Coding） — Gs

速度課題。難易度は単一（量で測る）。30秒の連続ストリーム。

- **記号セット（9種・固定）**: `○ △ □ ◇ ▽ ☆ ＋ ∽ ≡`
- **対応表**: セッション毎に記号↔数字(1-9)をシャッフルして割当（難易度はどの割当でも不変。再受験時の練習効果を抑える）。割当は trial に保存。

```ts
const SYMBOLS = ['○','△','□','◇','▽','☆','＋','∽','≡'];
function genCodingKey(rng) {
  const syms = shuffle(rng, [...SYMBOLS]);
  const map: Record<string, number> = {};
  syms.forEach((s, i) => (map[s] = i + 1));   // 記号 -> 数字
  return map;                                  // 上部に対応表として常時表示
}
function nextSymbol(rng, prev: string | null) {
  let s; do { s = pick(rng, SYMBOLS); } while (s === prev); return s;
}
```

- **進行**: 記号を1つ提示 → テンキーで数字入力 → 即次へ。30秒で終了。
- **採点**: 正答 = 入力 === key[symbol]。誤答も次へ進む（やり直し不可）。
- **ログ(trial毎)**: `symbol, expected, response, correct, rt_ms, ordinal`、対応表(key)はセッション単位で保存。
- **集計**: `n_correct, n_attempted, accuracy, rt_median, rt_sd, rt_firstHalf, rt_secondHalf`（後半−前半＝持続低下）。

---

## 2. 一致判定（Pattern comparison） — Gs（拡張）

```ts
interface PCParams { length: 5|6|7; isSame: boolean; diffPos?: number; }
const PC_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.split(''); // 紛らわしい I,O,0,1 除外
function genPatternPair(rng, length: 5|6|7, matchProb = 0.5) {
  const base = Array.from({length}, () => pick(rng, PC_CHARS));
  if (rng() < matchProb) return { left: base.join(''), right: base.join(''), params:{length,isSame:true} };
  const other = [...base];
  const pos = randInt(rng, 0, length - 1);                 // 末尾寄り=易, 中央=難
  let c; do { c = pick(rng, PC_CHARS); } while (c === other[pos]);
  other[pos] = c;
  return { left: base.join(''), right: other.join(''), params:{length,isSame:false,diffPos:pos} };
}
```
- **進行**: 左右2文字列を提示 →「同じ/違う」2ボタン。時間制限内（例30s）に連続。
- **難易度**: `length`（5<6<7）と `diffPos`（中央ほど難）。
- **集計**: `accuracy, rt_median, false_alarm率（同なのに違うと誤答）, miss率`。

---

## 3. 数唱・逆唱（Digit Span） — Gsm

順唱・逆唱で共通の**固定長**administration を使う（比較・規準化のため全員同一試行数）。
比較対象だけが順/逆で違う。

> 設計判断（2026-06-24）: 当初は適応ステアケース（2連続失敗で終了）だったが、
> 「正誤で問題数が変わると比較・規準化が不安定／早期終了の運で過小評価」という指摘を受け、
> **固定長（スパン3〜5を各2試行＝全員6試行）・同時提示・正答数で採点**へ変更した。

```ts
function genDigitSeq(rng, span: number) {
  const seq: number[] = [];
  while (seq.length < span) {
    const d = randInt(rng, 0, 9);
    if (seq.length && d === seq[seq.length - 1]) continue;     // 直前と同一を避ける
    seq.push(d);
  }
  if (isTrivialRun(seq)) return genDigitSeq(rng, span);        // 1234/9876 等の単調列を除外
  return seq;
}
function isTrivialRun(s: number[]) {                            // 連続昇降3つ以上を排除
  let inc = 1, dec = 1;
  for (let i = 1; i < s.length; i++) {
    inc = s[i] === s[i-1]+1 ? inc+1 : 1;
    dec = s[i] === s[i-1]-1 ? dec+1 : 1;
    if (inc >= 3 || dec >= 3) return true;
  }
  return false;
}
```

### 固定長 administration（共通）
```ts
const DIGIT_SPAN_PLAN = [3, 3, 4, 4, 5, 5]; // スパン3〜5を各2試行＝6試行

// mode: 'forward' | 'backward'
async function runSpan(rng, mode) {
  const plan = DIGIT_SPAN_PLAN.map((span) => genDigitSeq(rng, span));
  for (const seq of plan) {                                    // 早期終了なし
    await presentAll(seq, 1000 + 500 * seq.length);           // 系列全体を数秒まとめて提示
    const ans = await collectInput();                          // テンキー/キーボード
    const target = mode === 'backward' ? [...seq].reverse() : seq;
    const correct = arrEq(ans, target);
    const partial = longestCorrectPrefix(ans, target);         // 部分点
    log({ span: seq.length, sequence: seq, response: ans, correct, partial, mode });
  }
}
```
- **提示**: 系列全体を数秒まとめて提示（`1000+500*span` ms）→非表示→再生。スパン3〜5を各2試行、全員6試行（早期終了なし）。
- **ログ**: `span, sequence, response, correct, partial(系列内正答数), input_rt`。
- **集計**: `total_correct`（0〜10, 採点指標）＋ `max_span_reached`（正答した最大スパン）。順唱・逆唱を別task。

---

## 4. 空間スパン（Corsi / グリッド） — Gsm（拡張）

4×4＝16セル。点灯シーケンスを再生。ステアケースは§3と同一。

```ts
function genCellSeq(rng, span: number, cols = 4, rows = 4) {
  const seq: number[] = [];
  while (seq.length < span) {
    const c = randInt(rng, 0, cols * rows - 1);
    if (seq.length && c === seq[seq.length - 1]) continue;     // 直前と同一を避ける
    if (seq.includes(c) && rng() < 0.7) continue;             // 再訪をやや抑制
    seq.push(c);
  }
  return seq;
}
```
- **提示**: 各セル 600ms点灯。
- **採点/ログ**: `cell_sequence, tap_sequence, correct, partial, tap_rt`。集計: `maxSpan`（視空間）。

---

## 5. 数列完成（Number Series） — Gf

規則ファミリ＝難易度。5項提示し6項目を4択 or 入力。

```ts
type Rule = 'arith' | 'geom' | 'quad' | 'square' | 'fib' | 'interleave';
const FAMILY: Record<number, Rule[]> = {
  1: ['arith'], 2: ['geom'], 3: ['quad', 'square'], 4: ['fib', 'interleave'],
};
function computeTerms(rule: Rule, p: any, n = 6): number[] {
  switch (rule) {
    case 'arith':  return Array.from({length:n}, (_,i)=> p.a0 + i*p.step);
    case 'geom':   return Array.from({length:n}, (_,i)=> p.a0 * p.r**i);
    case 'square': return Array.from({length:n}, (_,i)=> (i+p.k)**2 + p.c);
    case 'quad': {                                   // 二階差分一定
      const t=[p.a0]; let d=p.d0;
      for (let i=1;i<n;i++){ t.push(t[i-1]+d); d+=p.dd; } return t;
    }
    case 'fib': { const t=[p.s0,p.s1]; for(let i=2;i<n;i++) t.push(t[i-1]+t[i-2]); return t; }
    case 'interleave': {                             // 2系列交互
      const out:number[]=[]; for(let i=0;i<n;i++) out.push(i%2? p.b0+(i>>1)*p.bs : p.a0+(i>>1)*p.as); return out;
    }
  }
}
function sampleParams(rng, rule: Rule) { /* 各ruleの係数を範囲内で抽選（下記制約を満たすまで再抽選） */ }
```
- **生成制約**: 全項が正整数・answer ≤ 999・先頭5項から自明な別解が立たない範囲に係数を制限。満たすまで再抽選。
- **誤答(distractor)生成**（4択時）:
  - `d1`: 最終差分を誤って一定適用（quad/fibを等差と誤解した値）
  - `d2`: answer ± step（off-by-one）
  - `d3`: 別opを適用（等差↔等比の取り違え）
  - 重複・answer一致・非正は除外。3つ確保しシャッフル。
- **ログ**: `rule, params, sequence(5項), answer, response, correct, rt_ms, chosen_distractor`。
- **集計**: 難易度別正答率・平均RT。

---

## 6. 心的回転（Mental Rotation） — Gv（半生成・SVG）

非対称ベース図形を回転/鏡像して提示し「同一/鏡像」を判定。

```ts
interface MRParams { shapeId: string; angle: 0|45|90|135|180; isMirror: boolean; }
const MR_SHAPES = ['F','R','L7','P9','poly1','poly2']; // 非対称（鏡像と区別できる）図形ID
function genMentalRotation(rng): GeneratedItem<MRParams> {
  const shapeId = pick(rng, MR_SHAPES);
  const angle = pick(rng, [0,45,90,135,180] as const);
  const isMirror = rng() < 0.5;
  const difficulty = 1 + [0,45,90,135,180].indexOf(angle) + (isMirror?1:0); // 角度大+鏡像で難
  return { task_id:'Gv_rotation', difficulty, params:{shapeId,angle,isMirror} };
}
// 描画: 基準=shape(0°,通常)。候補= rotate(angle) ∘ (isMirror? scale(-1,1):I)
```
- **採点**: 候補が基準の回転だけなら「同一」、鏡像が混じれば「鏡像」。`correct = response === (isMirror?'mirror':'same')`。
- **ログ**: `shapeId, angle, isMirror, response, correct, rt_ms`。
- **集計**: `accuracy`、**角度×RTの線形回帰の傾き＝心的回転速度**、鏡像弁別エラー率。

---

## 7. スコア集計 → 規準化への接続

| 課題 | 生スコア | 標準化の入力 |
|---|---|---|
| 記号変換 | 30秒内正答数 | throughput（高いほど良） |
| 一致判定 | accuracy・RT合成 | speed-accuracy |
| 数唱/逆唱 | total_correct（0〜6・固定6試行・同時提示） | 正答数 |
| 空間スパン | maxSpan | span値 |
| 数列完成 | 難易度重み付き正答率 | 能力推定値 |
| 心的回転 | accuracy・RT傾き | speed-accuracy |

- 生成型は params で難易度が既知 → **(task, difficulty) 層別**で年齢帯規準を作る（IRT推定は不要）。
- 各課題スコアを年齢帯規準でzスコア化 → 能力偏差値 `T = 50 + 10z`（設計ドキュメント §5）。
- バンク型（行列・語彙・知識・ことわざ等）のみ IRT で項目難易度を推定し別途規準化。

---

## 8. 実装メモ
- 生成は純関数（rng注入）に保ち、ユニットテストで「制約（正整数・自明解なし・answer範囲）」を検証する。
- `present()` のタイマーは「始める」押下後に開始（既存ルール）。`setX(updater)`内でonComplete等を呼ばない（既存の既知バグ回避）。
- RT は `performance.now()` 基準で記録。`input_method` も保存（タッチ/マウス/キーは速度規準補正に必要）。
