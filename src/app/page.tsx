import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="font-data text-3xl text-ink leading-snug">
        あなたの脳年齢を測る
      </h1>
      <p className="mt-5 text-muted leading-relaxed">
        CHC理論にもとづく認知課題で、処理速度・作業記憶・流動性推論などを測定し、
        同年代と比べた偏差値と脳年齢の目安を出します。
      </p>
      <Link
        href="/setup"
        className="inline-block mt-8 bg-brass text-white rounded-md px-8 py-3 font-body"
      >
        計測をはじめる
      </Link>
      <p className="mt-6 text-base text-muted">
        ※ 現在は縦切り版（3能力・約2分）です。
      </p>
    </div>
  );
}
