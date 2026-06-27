export type KnowledgeKind = "vocab" | "general" | "idiom";

export interface KnowledgeItem {
  id: string;
  kind: KnowledgeKind;
  prompt: string;
  options: string[]; // 4択（順不同。正解は answer 値で判定）
  answer: string;
  difficulty: number; // 1〜3
}

/** Gc 結晶性知能の問題バンク（語彙・一般知識・ことわざ）。 */
export const KNOWLEDGE_BANK: KnowledgeItem[] = [
  // --- 語彙（意味が最も近いもの） ---
  { id: "voc_kokumei", kind: "vocab", prompt: "「克明」に最も意味が近いのは？", options: ["詳しく丁寧", "大胆", "簡潔", "あいまい"], answer: "詳しく丁寧", difficulty: 2 },
  { id: "voc_huhen", kind: "vocab", prompt: "「普遍」に最も意味が近いのは？", options: ["すべてに共通する", "めずらしい", "一時的", "個別の"], answer: "すべてに共通する", difficulty: 2 },
  { id: "voc_shisa", kind: "vocab", prompt: "「示唆」に最も意味が近いのは？", options: ["それとなく示す", "強く命じる", "完全に否定する", "繰り返す"], answer: "それとなく示す", difficulty: 3 },
  { id: "voc_zeijaku", kind: "vocab", prompt: "「脆弱」に最も意味が近いのは？", options: ["もろくて弱い", "頑丈", "巨大", "高価"], answer: "もろくて弱い", difficulty: 1 },
  { id: "voc_kanyou", kind: "vocab", prompt: "「寛容」に最も意味が近いのは？", options: ["心が広く受け入れる", "きびしい", "臆病", "勤勉"], answer: "心が広く受け入れる", difficulty: 1 },
  { id: "voc_kencho", kind: "vocab", prompt: "「顕著」に最も意味が近いのは？", options: ["はっきり目立つ", "かすか", "平凡", "一時的"], answer: "はっきり目立つ", difficulty: 2 },
  { id: "voc_husshoku", kind: "vocab", prompt: "「払拭」に最も意味が近いのは？", options: ["ぬぐい去る", "増やす", "隠す", "飾る"], answer: "ぬぐい去る", difficulty: 3 },

  // --- 一般知識 ---
  { id: "gen_river", kind: "general", prompt: "日本で最も長い川は？", options: ["信濃川", "利根川", "石狩川", "北上川"], answer: "信濃川", difficulty: 2 },
  { id: "gen_genji", kind: "general", prompt: "「源氏物語」の作者は？", options: ["紫式部", "清少納言", "与謝野晶子", "樋口一葉"], answer: "紫式部", difficulty: 1 },
  { id: "gen_water", kind: "general", prompt: "水の化学式は？", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O", difficulty: 1 },
  { id: "gen_light", kind: "general", prompt: "光が1秒で進む距離に最も近いのは？", options: ["約30万km", "約3万km", "約300万km", "約3000km"], answer: "約30万km", difficulty: 3 },
  { id: "gen_fuji", kind: "general", prompt: "日本の最高峰は？", options: ["富士山", "北岳", "槍ヶ岳", "立山"], answer: "富士山", difficulty: 1 },
  { id: "gen_geshi", kind: "general", prompt: "1年で昼が最も長い日は？", options: ["夏至", "冬至", "春分", "秋分"], answer: "夏至", difficulty: 2 },
  { id: "gen_continent", kind: "general", prompt: "最も面積が大きい大陸は？", options: ["ユーラシア大陸", "アフリカ大陸", "北アメリカ大陸", "南アメリカ大陸"], answer: "ユーラシア大陸", difficulty: 2 },

  // --- ことわざ・慣用句 ---
  { id: "idi_saru", kind: "idiom", prompt: "猿も木から◯◯◯（あてはまるのは？）", options: ["落ちる", "転ぶ", "降りる", "滑る"], answer: "落ちる", difficulty: 1 },
  { id: "idi_nikai", kind: "idiom", prompt: "「二階から目薬」の意味は？", options: ["もどかしく効果がない", "高い所が好き", "準備が良い", "幸運が続く"], answer: "もどかしく効果がない", difficulty: 2 },
  { id: "idi_isogaba", kind: "idiom", prompt: "「急がば回れ」の意味は？", options: ["急ぐときほど安全な道を", "遠回りは損だ", "急げば間に合う", "回り道を楽しもう"], answer: "急ぐときほど安全な道を", difficulty: 2 },
  { id: "idi_ishi", kind: "idiom", prompt: "石の上にも◯◯（あてはまるのは？）", options: ["三年", "一年", "十年", "百年"], answer: "三年", difficulty: 1 },
];
