"use client";

import { useEffect, useRef, useState } from "react";
import ReadyScreen from "@/components/ReadyScreen";
import { mulberry32 } from "@/lib/rng";
import {
  genCodingKey,
  nextSymbol,
  CODING_SYMBOLS,
  CODING_DURATION_MS,
  type CodingKey,
} from "@/lib/generators/coding";
import type { Trial } from "@/types/scoring";

export default function Gs_Coding({
  seed,
  onComplete,
}: {
  seed: number;
  onComplete: (trials: Trial[]) => void;
}) {
  const [started, setStarted] = useState(false);
  const [key, setKey] = useState<CodingKey | null>(null);
  const [symbol, setSymbol] = useState("");
  const [remaining, setRemaining] = useState(CODING_DURATION_MS);
  const [flash, setFlash] = useState<{ digit: number; ok: boolean } | null>(null);

  const rngRef = useRef(mulberry32(seed));
  const trialsRef = useRef<Trial[]>([]);
  const ordinalRef = useRef(0);
  const shownAtRef = useRef(0);
  const endAtRef = useRef(0);
  const doneRef = useRef(false);

  const start = () => {
    const k = genCodingKey(rngRef.current);
    setKey(k);
    setSymbol(nextSymbol(rngRef.current, null));
    shownAtRef.current = performance.now();
    endAtRef.current = performance.now() + CODING_DURATION_MS;
    setStarted(true);
  };

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => {
      setRemaining(Math.max(0, endAtRef.current - performance.now()));
    }, 100);
    return () => clearInterval(id);
  }, [started]);

  // 残り0の検知は updater 外（別 effect）で行う
  useEffect(() => {
    if (started && remaining <= 0 && !doneRef.current) {
      doneRef.current = true;
      onComplete(trialsRef.current);
    }
  }, [started, remaining, onComplete]);

  const press = (digit: number) => {
    if (!key || doneRef.current) return;
    const correct = key[symbol] === digit;
    trialsRef.current.push({
      task_id: "Gs_coding",
      ability: "Gs",
      ordinal: ordinalRef.current++,
      params: { symbol, expected: key[symbol] },
      response: digit,
      correct,
      rt_ms: Math.round(performance.now() - shownAtRef.current),
      input_method: "mouse",
    });
    setFlash({ digit, ok: correct });
    setTimeout(() => setFlash(null), 140);
    setSymbol(nextSymbol(rngRef.current, symbol));
    shownAtRef.current = performance.now();
  };

  if (!started) {
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
        example={<p className="text-muted text-sm">例: ○ が 1 のとき、○ を見たら「1」を押す</p>}
        onStart={start}
      />
    );
  }

  const secLeft = Math.ceil(remaining / 1000);
  const timerPct = (remaining / CODING_DURATION_MS) * 100;

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-md h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full transition-all"
          style={{ width: `${timerPct}%`, background: secLeft <= 8 ? "var(--red)" : "var(--blue)" }}
        />
      </div>

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
                  ? { background: flash!.ok ? "var(--green)" : "var(--red)", color: "#fff", borderColor: "transparent" }
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
