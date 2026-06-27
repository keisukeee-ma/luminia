"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AGE_BANDS,
  SEX_LABEL,
  OCCUPATIONS,
  INDUSTRIES,
  JOB_TYPES,
  type AgeBand,
  type Sex,
  type Occupation,
  type Industry,
  type JobType,
} from "@/types/domain";
import { createSession, saveSession } from "@/lib/session";

const SEXES: Sex[] = ["male", "female", "other"];

export default function SetupPage() {
  const router = useRouter();
  const [age, setAge] = useState<AgeBand | "">("");
  const [sex, setSex] = useState<Sex | "">("");
  const [occupation, setOccupation] = useState<Occupation | "">("");
  const [industry, setIndustry] = useState<Industry | "">("");
  const [jobType, setJobType] = useState<JobType | "">("");
  const [postal, setPostal] = useState("");

  const postalDigits = postal.replace(/[^0-9]/g, "");
  const postalValid = postalDigits.length === 7;
  const ready =
    age !== "" &&
    sex !== "" &&
    occupation !== "" &&
    industry !== "" &&
    jobType !== "" &&
    postalValid;

  const begin = () => {
    if (!ready) return;
    saveSession(
      createSession({
        age_band: age as AgeBand,
        sex: sex as Sex,
        occupation: occupation as Occupation,
        industry: industry as Industry,
        job_type: jobType as JobType,
        postal_code: postalDigits || undefined,
      }),
    );
    router.push("/session");
  };

  const selectCls =
    "mt-2 w-full border border-border bg-paper rounded-md px-4 py-3 text-base text-ink";

  return (
    <div className="mx-auto max-w-md w-full px-4 py-12">
      <h1 className="font-data text-3xl text-ink">はじめる前に</h1>
      <p className="mt-3 text-base text-muted leading-relaxed">
        はじめに、あなたについて教えてください。
      </p>

      <div className="mt-8">
        <label className="font-body text-base text-ink">年代</label>
        <select
          value={age}
          onChange={(e) => setAge(e.target.value as AgeBand)}
          className={selectCls}
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
        <label className="font-body text-base text-ink">性別</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {SEXES.map((s) => (
            <button
              key={s}
              onClick={() => setSex(s)}
              className="rounded-md py-3 text-base border transition-colors"
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

      <div className="mt-6">
        <label className="font-body text-base text-ink">職業</label>
        <select
          value={occupation}
          onChange={(e) => setOccupation(e.target.value as Occupation)}
          className={selectCls}
        >
          <option value="">選択してください</option>
          {OCCUPATIONS.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="font-body text-base text-ink">業種</label>
        <select
          value={industry}
          onChange={(e) => setIndustry(e.target.value as Industry)}
          className={selectCls}
        >
          <option value="">選択してください</option>
          {INDUSTRIES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="font-body text-base text-ink">職種</label>
        <select
          value={jobType}
          onChange={(e) => setJobType(e.target.value as JobType)}
          className={selectCls}
        >
          <option value="">選択してください</option>
          {JOB_TYPES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <label className="font-body text-base text-ink">郵便番号</label>
        <input
          type="text"
          inputMode="numeric"
          value={postal}
          onChange={(e) => setPostal(e.target.value)}
          placeholder="例: 1000001（7桁）"
          className={selectCls}
        />
        {postal.trim() !== "" && !postalValid && (
          <p className="mt-1.5 text-base" style={{ color: "var(--red)" }}>
            郵便番号は7桁の数字で入力してください。
          </p>
        )}
      </div>

      <button
        onClick={begin}
        disabled={!ready}
        className="mt-10 w-full bg-brass text-white rounded-md py-3.5 text-lg font-body disabled:opacity-50"
      >
        計測をはじめる
      </button>
    </div>
  );
}
