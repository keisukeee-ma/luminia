# CHC指標 設計（測定する6能力）

CHC理論（g → 広域能力 → 狭域能力）にもとづき、脳年齢偏差値のために測定する指標。
**加齢で低下する流動系（Gf/Gs/Gsm/Glr/Gv）を主軸に、加齢で安定〜上昇する Gc を対照アンカー**とする。

## 設計思想
- 脳年齢の推定値 = 流動系コンポジットを年齢に回帰して算出。
- 偏差値（T=50+10z） = 各能力を同年齢帯の規準と比較して標準化。
- Gc は流動系の低下を相対化する基準（脳年齢式には軽く入れる/対照表示）。

## 6能力

| 能力 | 加齢感度 | 主な狭域 | 代表課題 |
|---|---|---|---|
| Gs 処理速度 | 最強（主軸） | Perceptual Speed, Number Facility | 記号変換 / 一致判定 |
| Gsm 作業記憶 | 高 | Memory Span, Working Memory | 数唱・逆唱 / 空間スパン |
| Gf 流動性推論 | 高（gに最も近い） | Induction, Sequential Reasoning | 行列推理 / 数列完成 |
| Glr 長期記憶 | 高 | Associative/Free Recall, Fluency | ペア連想 / 単語リスト学習 |
| Gv 視覚処理 | 中〜高 | Visualization, Spatial Relations | 心的回転 / 紙折り |
| Gc 結晶性知能 | 低（対照） | Lexical Knowledge, General Info | 語彙 / 一般知識 / ことわざ |

## 取得データの方針
試行（item）レベルで RT・正誤・項目難易度・誤答内容・系列位置効果などを保存し、
偏差値・IRT・脳年齢回帰の3用途すべてを満たす粒度で取得する。

詳細は `docs/item-design.md`（課題別アイテム）・`docs/generative-spec.md`（生成型アルゴリズム）・
`docs/session-design.md`（10分セッション）・`docs/data-model.md`（スキーマ）を参照。
