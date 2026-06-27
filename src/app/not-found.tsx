import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="font-data text-5xl text-brass">404</p>
      <h1 className="mt-4 font-data text-2xl text-ink">
        ページが見つかりませんでした
      </h1>
      <p className="mt-4 text-base text-muted leading-relaxed">
        お探しのページは移動または削除された可能性があります。
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="bg-brass text-white rounded-md px-8 py-3 font-body"
        >
          ホームに戻る
        </Link>
        <Link href="/setup" className="text-base text-brass underline">
          計測をはじめる
        </Link>
      </div>
    </div>
  );
}
