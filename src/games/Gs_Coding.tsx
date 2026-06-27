"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import { Bridge } from "@/games/Gf_Series";
import { mulberry32 } from "@/lib/rng";
import {
  genCodingKey,
  nextSymbol,
  CODING_SYMBOLS,
  CODING_DURATION_MS,
  type CodingKey,
} from "@/lib/generators/coding";
import type { Trial } from "@/types/scoring";

type Phase = "ready" | "practice" | "bridge" | "real";
type Tone = "neutral" | "ok" | "ng";
const PRACTICE_N = 3;

export default function Gs_Coding({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [key, setKey] = useState<CodingKey | null>(null);
  const [symbol, setSymbol] = useState("");
  const [remaining, setRemaining] = useState(CODING_DURATION_MS);
  const [flash, setFlash] = useState<{ digit: number; tone: Tone } | null>(null);

  const rngRef = useRef(mulberry32(seed));
  const pracRngRef = useRef(mulberry32((seed ^ 0x4141) >>> 0));
  const trialsRef = useRef<Trial[]>([]);
  const ordinalRef = useRef(0);
  const practiceCountRef = useRef(0);
  const shownAtRef = useRef(0);
  const endAtRef = useRef(0);
  const doneRef = useRef(false);

  const startPractice = () => {
    const k = genCodingKey(pracRngRef.current);
    setKey(k);
    setSymbol(nextSymbol(pracRngRef.current, null));
    practiceCountRef.current = 0;
    shownAtRef.current = performance.now();
    setPhase("practice");
  };

  const startReal = () => {
    const k = genCodingKey(rngRef.current);
    setKey(k);
    setSymbol(nextSymbol(rngRef.current, null));
    trialsRef.current = [];
    ordinalRef.current = 0;
    doneRef.current = false;
    shownAtRef.current = performance.now();
    endAtRef.current = performance.now() + CODING_DURATION_MS;
    setRemaining(CODING_DURATION_MS);
    setPhase("real");
  };

  useEffect(() => {
    if (phase !== "real") return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, endAtRef.current - performance.now()));
    }, 100);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "real" && remaining <= 0 && !doneRef.current) {
      doneRef.current = true;
      onComplete(trialsRef.current);
    }
  }, [phase, remaining, onComplete]);

  const press = (digit: number) => {
    if (!key) return;
    const correct = key[symbol] === digit;

    if (phase === "practice") {
      setFlash({ digit, tone: correct ? "ok" : "ng" });
      window.setTimeout(() => setFlash(null), 300);
      practiceCountRef.current += 1;
      if (practiceCountRef.current >= PRACTICE_N) {
        window.setTimeout(() => setPhase("bridge"), 380);
        return;
      }
      setSymbol(nextSymbol(pracRngRef.current, symbol));
      shownAtRef.current = performance.now();
      return;
    }

    if (phase !== "real" || doneRef.current) return;
    const rt = Math.round(performance.now() - shownAtRef.current);
    trialsRef.current.push({
      task_id: "Gs_coding",
      ability: "Gs",
      ordinal: ordinalRef.current++,
      params: { symbol, expected: key[symbol] },
      response: digit,
      correct,
      rt_ms: rt,
      input_method: "mouse",
      extra: {
        events: [{ t: rt, type: "key", value: digit }],
        n_edits: 0,
        time_to_first_ms: rt,
        inter_response_ms: [],
      },
    });
    setFlash({ digit, tone: "neutral" });
    window.setTimeout(() => setFlash(null), 120);
    setSymbol(nextSymbol(rngRef.current, symbol));
    shownAtRef.current = performance.now();
  };

  // キーボード入力（数字キー1-9）
  useEffect(() => {
    if (phase !== "practice" && phase !== "real") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") press(Number(e.key));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, symbol, key]);

  if (phase === "ready") {
    return (
      <ReadyScreen
        title="記号変換"
        description={
          <>
            上の対応表を見ながら、出てきた記号に対応する
            <span className="text-ink font-body">数字</span>
            をできるだけ速く押してください。制限時間は30秒です。
          </>
        }
        example={
          <p className="text-muted text-base">
            例: ○ が 1 のとき、○ を見たら「1」を押す
            <br />
            （マウスでもキーボードの数字でも入力できます）
          </p>
        }
        onStart={startReal}
        onPractice={startPractice}
      />
    );
  }
  if (phase === "bridge") return <Bridge onStart={startReal} />;

  const secLeft = Math.ceil(remaining / 1000);
  const timerPct = (remaining / CODING_DURATION_MS) * 100;
  const toneColor = (t: Tone) =>
    t === "ok" ? "var(--green)" : t === "ng" ? "var(--red)" : "var(--brass)";

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6">
      {phase === "real" ? (
        <div className="w-full max-w-md h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full transition-all"
            style={{ width: `${timerPct}%`, background: secLeft <= 8 ? "var(--red)" : "var(--blue)" }}
          />
        </div>
      ) : (
        <p className="text-base text-muted">れんしゅう</p>
      )}

      <div className="mt-5 grid grid-cols-3 gap-2 w-fit mx-auto">
        {CODING_SYMBOLS.map((s) => (
          <div
            key={s}
            className="flex items-center justify-center gap-1 bg-paper border border-border rounded-md px-3 py-1.5"
          >
            <span className="text-lg">{s}</span>
            <span className="text-muted">=</span>
            <span className="font-data">{key?.[s]}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 font-data text-ink" style={{ fontSize: 64, lineHeight: 1 }}>
        {symbol}
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2 w-fit mx-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => {
          const f = flash?.digit === d;
          return (
            <button
              key={d}
              onClick={() => press(d)}
              className="w-16 h-16 rounded-lg border text-2xl font-data transition-colors"
              style={
                f
                  ? { background: toneColor(flash!.tone), color: "#fff", borderColor: "transparent" }
                  : { background: "var(--paper)", borderColor: "var(--border)", color: "var(--ink)" }
              }
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}
