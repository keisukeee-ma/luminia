"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AGE_BANDS,
  SEX_LABEL,
  type AgeBand,
  type Sex,
} from "@/types/domain";
import { createSession, saveSession } from "@/lib/session";

const SEXES: Sex[] = ["male", "female", "other", "na"];

export default function SetupPage() {
  const router = useRouter();
  const [age, setAge] = useState<AgeBand | "">("");
  const [sex, setSex] = useState<Sex | "">("");
  const ready = age !== "" && sex !== "";

  const begin = () => {
    if (!ready) return;
    saveSession(createSession({ age_band: age as AgeBand, sex: sex as Sex }));
    router.push("/session");
  };

  return (
    <div className="mx-auto max-w-md w-full px-4 py-12">
      <h1 className="font-data text-2xl text-ink">はじめる前に</h1>
      <p className="mt-2 text-sm text-muted">
        同年代と比べるために、年代と性別だけ教えてください。
      </p>

      <div className="mt-8">
        <label className="font-body text-sm text-ink">年代</label>
        <select
          value={age}
          onChange={(e) => setAge(e.target.value as AgeBand)}
          className="mt-2 w-full border border-border bg-paper rounded-md px-3 py-2.5 text-ink"
        >
          <option value="">選択してください</option>
          {AGE_BANDS.map((b) => (
            <option key={b} value={b}>
              {b} 歳
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="font-body text-sm text-ink">性別</label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {SEXES.map((s) => (
            <button
              key={s}
              onClick={() => setSex(s)}
              className="rounded-md py-2.5 text-sm border transition-colors"
              style={
                sex === s
                  ? { background: "var(--brass)", color: "#fff", borderColor: "transparent" }
                  : { background: "var(--paper)", color: "var(--ink)", borderColor: "var(--border)" }
              }
            >
              {SEX_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={begin}
        disabled={!ready}
        className="mt-10 w-full bg-brass text-white rounded-md py-3 font-body disabled:opacity-50"
      >
        計測をはじめる
      </button>
      <p className="mt-4 text-xs text-muted">
        職業や地域などは、結果を見たあとに任意でうかがいます。
      </p>
    </div>
  );
}
