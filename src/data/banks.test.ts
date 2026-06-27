import { describe, it, expect } from "vitest";
import { KNOWLEDGE_BANK } from "./knowledgeBank";
import { WORD_BANK, selectGlrWords, WORD_LEARN_COUNT, WORD_DISTRACTOR_COUNT } from "./wordBank";

describe("knowledgeBank", () => {
  it("各問: 選択肢4つ・answer を含む・id 一意", () => {
    const ids = new Set<string>();
    for (const q of KNOWLEDGE_BANK) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
      expect(ids.has(q.id)).toBe(false);
      ids.add(q.id);
    }
    expect(KNOWLEDGE_BANK.length).toBeGreaterThanOrEqual(8);
  });
});

describe("selectGlrWords", () => {
  it("学習語とディストラクタは重複せず seed で決定論的", () => {
    expect(WORD_BANK.length).toBeGreaterThanOrEqual(WORD_LEARN_COUNT + WORD_DISTRACTOR_COUNT);
    const a = selectGlrWords(123);
    const b = selectGlrWords(123);
    expect(a).toEqual(b); // 同じ seed は同じ結果
    expect(a.learned).toHaveLength(WORD_LEARN_COUNT);
    expect(a.distractors).toHaveLength(WORD_DISTRACTOR_COUNT);
    const overlap = a.learned.filter((w) => a.distractors.includes(w));
    expect(overlap).toHaveLength(0);
  });
});
