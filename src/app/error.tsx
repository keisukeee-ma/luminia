"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <h1 className="font-data text-2xl text-ink">問題が発生しました</h1>
      <p className="mt-4 text-base text-muted leading-relaxed">
        一時的なエラーの可能性があります。お手数ですが、もう一度お試しください。
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          onClick={() => unstable_retry()}
          className="bg-brass text-white rounded-md px-8 py-3 font-body"
        >
          再試行する
        </button>
        <Link href="/" className="text-base text-brass underline">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}
