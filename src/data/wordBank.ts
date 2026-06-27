import { mulberry32, shuffle } from "@/lib/rng";

/** Glr 単語記憶のための具体名詞プール（学習語・ディストラクタの両方に使う）。 */
export const WORD_BANK: string[] = [
  "りんご", "机", "電車", "桜", "時計", "傘",
  "猫", "帽子", "車", "花", "本", "椅子",
  "みかん", "電話", "鳥", "靴", "山", "川",
  "パン", "船", "犬", "月", "星", "鍵",
];

export const WORD_LEARN_COUNT = 6; // 学習する単語数
export const WORD_DISTRACTOR_COUNT = 6; // 再認テストの新規（ダミー）語数

/**
 * seed から学習語とディストラクタを決定論的に選ぶ。
 * 学習ステップと再認ステップに同じ seed を渡せば、同一の学習語を共有できる（保存不要）。
 */
export function selectGlrWords(seed: number): {
  learned: string[];
  distractors: string[];
} {
  const pool = shuffle(mulberry32(seed), [...WORD_BANK]);
  return {
    learned: pool.slice(0, WORD_LEARN_COUNT),
    distractors: pool.slice(WORD_LEARN_COUNT, WORD_LEARN_COUNT + WORD_DISTRACTOR_COUNT),
  };
}
