"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { loadHistory, type HistoryEntry } from "@/lib/history";
import { STEPS } from "@/lib/session";
import { getUserId, setUserId } from "@/lib/userId";
import { fetchRemoteHistory, fetchMyHistory, mergeIntoLocal } from "@/lib/remote-history";
import { sendMagicLink, signOut, getAuthUser, onAuthChange, type AuthUser } from "@/lib/auth";
import ResultsView from "@/components/ResultsView";
import TrendChart from "@/components/TrendChart";
import type { Trial } from "@/types/scoring";

const TASK_LABEL: Record<string, string> = Object.fromEntries(
  STEPS.map((s) => [s.task_id, s.label])
);

function RtChart({ trials }: { trials: Trial[] }) {
  const timed = trials.filter((t) => t.rt_ms !== null && t.rt_ms > 0);
  if (timed.length === 0) return null;

  const rts = timed.map((t) => t.rt_ms as number);
  const maxRt = Math.max(...rts);
  const avgRt = Math.round(rts.reduce((s, v) => s + v, 0) / rts.length);

  const W = 300;
  const H = 40;
  const barW = Math.min(20, (W - 4) / timed.length - 2);
  const gap = (W - 4 - timed.length * barW) / Math.max(1, timed.length - 1);
  const avgX = (avgRt / maxRt) * H;

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted">反応時間</span>
        <span className="text-xs text-muted tabular-nums">平均 {avgRt} ms</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="反応時間">
        <line
          x1="0" y1={H - avgX} x2={W} y2={H - avgX}
          stroke="var(--muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"
        />
        {timed.map((t, i) => {
          const x = 2 + i * (barW + gap);
          const barH = ((t.rt_ms as number) / maxRt) * (H - 2);
          const fill = t.correct === false ? "var(--red)" : t.correct === true ? "var(--blue)" : "var(--muted)";
          return (
            <rect key={i} x={x} y={H - barH} width={barW} height={barH} rx="2"
              fill={fill} opacity="0.6" aria-label={`${t.rt_ms}ms`} />
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted mt-0.5 tabular-nums">
        <span>速い</span>
        <span>遅い ▶ {Math.round(maxRt)}ms</span>
      </div>
    </div>
  );
}

function TrialReview({ trials }: { trials: Trial[] }) {
  const byTask = new Map<string, Trial[]>();
  for (const t of trials) {
    if (t.correct === null) continue;
    const arr = byTask.get(t.task_id) ?? [];
    arr.push(t);
    byTask.set(t.task_id, arr);
  }
  const taskOrder = STEPS.map((s) => s.task_id).filter((id) => byTask.has(id));
  if (taskOrder.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-body text-ink text-lg mb-4">回答の振り返り</h2>
      <div className="flex flex-col gap-4">
        {taskOrder.map((taskId) => {
          const ts = byTask.get(taskId)!;
          const nCorrect = ts.filter((t) => t.correct).length;
          return (
            <div key={taskId} className="bg-paper border border-border rounded-lg px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-body text-ink text-base">{TASK_LABEL[taskId] ?? taskId}</span>
                <span className="text-base text-muted tabular-nums">{nCorrect} / {ts.length} 正解</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ts.map((t, i) => (
                  <div key={i} title={t.rt_ms != null ? `${t.rt_ms}ms` : undefined}
                    className="w-8 h-8 rounded-md flex items-center justify-center text-sm font-data"
                    style={{ background: t.correct ? "var(--green)" : "var(--red)", color: "#fff" }}>
                    {t.correct ? "○" : "×"}
                  </div>
                ))}
              </div>
              <RtChart trials={ts} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

type ImportState = "idle" | "loading" | "ok" | "empty" | "error";
type SendState = "idle" | "sending" | "sent" | "error";

function AccountSection({ onHistoryMerged }: { onHistoryMerged: () => void }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendError, setSendError] = useState("");

  // UUID フォールバック用
  const [userId, setUserIdState] = useState("");
  const [copied, setCopied] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [importState, setImportState] = useState<ImportState>("idle");
  const [importCount, setImportCount] = useState(0);

  useEffect(() => {
    setUserIdState(getUserId());
    // 初期認証状態を取得
    getAuthUser().then(setAuthUser);
    // 状態変化を監視（Magic Link クリック後のセッション確立を検知）
    const unsub = onAuthChange(async (user) => {
      setAuthUser(user);
      if (user) {
        // ログイン時にリモート履歴を自動マージ
        const remote = await fetchMyHistory();
        if (remote && remote.length > 0) {
          mergeIntoLocal(remote);
          onHistoryMerged();
        }
      }
    });
    return unsub;
  }, [onHistoryMerged]);

  const handleSend = async () => {
    if (!email.trim()) return;
    setSendState("sending");
    const { error } = await sendMagicLink(email.trim());
    if (error) {
      setSendError(error);
      setSendState("error");
    } else {
      setSendState("sent");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setAuthUser(null);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = async () => {
    const code = importCode.trim();
    if (!/^[0-9a-f-]{36}$/i.test(code)) { setImportState("error"); return; }
    setImportState("loading");
    const remote = await fetchRemoteHistory(code);
    if (!remote) { setImportState("error"); return; }
    if (remote.length === 0) { setImportState("empty"); return; }
    const added = mergeIntoLocal(remote);
    setUserId(code);
    setUserIdState(code);
    setImportCount(added);
    setImportState("ok");
    onHistoryMerged();
  };

  return (
    <div className="mt-6 flex flex-col gap-3">
      {/* ── メール認証セクション ── */}
      <div className="bg-paper border border-border rounded-lg px-5 py-4">
        <h2 className="font-body text-ink text-base mb-1">アカウント連携</h2>
        <p className="text-xs text-muted mb-3">
          メールアドレスで連携すると、どの端末でも計測履歴を引き継げます。
        </p>

        {authUser ? (
          /* ログイン済み */
          <div>
            <p className="text-sm text-ink mb-2">
              ログイン中：<span className="font-data">{authUser.email}</span>
            </p>
            <p className="text-xs text-muted mb-3">
              今後の計測は自動的にこのアカウントに紐付けられます。
            </p>
            <button
              onClick={handleSignOut}
              className="text-xs text-muted underline"
            >
              ログアウト
            </button>
          </div>
        ) : sendState === "sent" ? (
          /* 送信済み */
          <p className="text-sm text-ink">
            メールを送信しました。届いたリンクをクリックするとログインします。
          </p>
        ) : (
          /* 未ログイン */
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="メールアドレス"
                className="flex-1 border border-border rounded px-3 py-2 text-sm bg-background text-ink"
              />
              <button
                onClick={handleSend}
                disabled={sendState === "sending" || !email.trim()}
                className="shrink-0 px-4 py-2 rounded-md text-sm font-body"
                style={{ background: "var(--brass)", color: "#fff", opacity: sendState === "sending" ? 0.6 : 1 }}
              >
                {sendState === "sending" ? "送信中…" : "送信"}
              </button>
            </div>
            {sendState === "error" && (
              <p className="text-xs" style={{ color: "var(--red)" }}>{sendError}</p>
            )}
          </div>
        )}
      </div>

      {/* ── マイID（UUIDフォールバック）セクション ── */}
      {userId && (
        <div className="bg-paper border border-border rounded-lg px-5 py-4">
          <h2 className="font-body text-ink text-base mb-1">マイID（旧方式）</h2>
          <p className="text-xs text-muted mb-3">
            メール連携の前に取得したデータの引き継ぎに使えます。
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs text-ink font-data break-all select-all">
              {userId}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 px-3 py-2 rounded border text-xs font-body transition-colors"
              style={copied
                ? { borderColor: "var(--green)", color: "var(--green)" }
                : { borderColor: "var(--border)", color: "var(--muted)" }}
            >
              {copied ? "コピー済" : "コピー"}
            </button>
          </div>
          <button
            onClick={() => { setShowImport((v) => !v); setImportState("idle"); }}
            className="mt-3 text-xs text-brass underline"
          >
            別端末から引き継ぐ
          </button>
          {showImport && (
            <div className="mt-3 flex flex-col gap-2">
              <input
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="引き継ぎ元のマイIDを貼り付け"
                className="w-full border border-border rounded px-3 py-2 text-xs font-data bg-background text-ink"
              />
              <button
                onClick={handleImport}
                disabled={importState === "loading" || !importCode.trim()}
                className="w-full py-2 rounded-md text-sm font-body"
                style={{ background: "var(--brass)", color: "#fff", opacity: importState === "loading" ? 0.6 : 1 }}
              >
                {importState === "loading" ? "読み込み中…" : "引き継ぐ"}
              </button>
              {importState === "ok" && (
                <p className="text-xs" style={{ color: "var(--green)" }}>
                  {importCount > 0 ? `${importCount}件を追加しました。` : "すでに揃っています。"}
                </p>
              )}
              {importState === "empty" && (
                <p className="text-xs text-muted">データが見つかりませんでした。</p>
              )}
              {importState === "error" && (
                <p className="text-xs" style={{ color: "var(--red)" }}>IDの形式が正しくないか、読み込みに失敗しました。</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyPage() {
  const [history, setHistory] = useState<HistoryEntry[] | null>(null);
  const [sel, setSel] = useState(0);

  const reloadHistory = () => {
    setHistory(loadHistory().filter((h) => h && h.scores && Array.isArray(h.scores.abilities)));
  };

  useEffect(() => {
    reloadHistory();
  }, []);

  if (history === null) return null;

  if (history.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-data text-2xl text-ink">マイページ</h1>
        <p className="mt-4 text-base text-muted">まだ計測結果がありません。</p>
        <Link href="/setup" className="inline-block mt-6 bg-brass text-white rounded-md px-8 py-3 font-body">
          計測をはじめる
        </Link>
        <AccountSection onHistoryMerged={reloadHistory} />
      </div>
    );
  }

  const entry = history[Math.min(sel, history.length - 1)];

  return (
    <div className="mx-auto max-w-xl w-full px-4 py-10">
      <h1 className="font-data text-2xl text-ink">マイページ</h1>
      <p className="mt-1 text-base text-muted">これまでの計測：{history.length}件</p>

      <TrendChart history={history} />

      <div className="mt-4 flex flex-col gap-2">
        {history.map((h, i) => (
          <button key={h.id} onClick={() => setSel(i)}
            className="flex items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors"
            style={i === sel
              ? { borderColor: "var(--brass)", background: "var(--paper)" }
              : { borderColor: "var(--border)" }}
          >
            <span className="text-base text-ink">
              {new Date(h.at).toLocaleString("ja-JP", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
            <span className="font-data text-ink">脳年齢 {h.scores.result.brain_age ?? "—"} 歳</span>
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-border">
        <ResultsView key={entry.id} scores={entry.scores} />
        {entry.trials && entry.trials.length > 0 && <TrialReview trials={entry.trials} />}
      </div>

      <AccountSection onHistoryMerged={reloadHistory} />
    </div>
  );
}
