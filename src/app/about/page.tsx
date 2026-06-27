import Link from "next/link";

const BROAD = [
  { code: "Gf", name: "流動性推論", measured: true, note: "新しい問題を解く力" },
  { code: "Gc", name: "結晶性知能", measured: true, note: "言葉・知識" },
  { code: "Gsm", name: "短期・作業記憶", measured: true, note: "覚えて操作する力" },
  { code: "Glr", name: "長期記憶", measured: true, note: "覚えて思い出す力" },
  { code: "Gv", name: "視覚処理", measured: true, note: "空間・図形の処理" },
  { code: "Gs", name: "処理速度", measured: true, note: "速く正確に処理" },
  { code: "Ga", name: "聴覚処理", measured: false, note: "" },
  { code: "Gt", name: "反応・判断速度", measured: false, note: "" },
  { code: "Gq", name: "量的知識", measured: false, note: "" },
  { code: "Grw", name: "読み書き能力", measured: false, note: "" },
  { code: "Gkn", name: "専門知識", measured: false, note: "" },
  { code: "Gps", name: "精神運動速度", measured: false, note: "" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl w-full px-4 py-12">
      <h1 className="font-data text-3xl text-ink leading-snug">このアプリについて</h1>
      <p className="mt-4 text-base text-muted leading-relaxed">
        このアプリは、心理学で広く使われる
        <span className="text-ink font-body">CHC理論</span>
        （Cattell-Horn-Carroll理論）にもとづいた認知課題で脳の働きを測り、
        同年代と比べた<span className="text-ink font-body">偏差値</span>と
        <span className="text-ink font-body">脳年齢の目安</span>を出します。
        さまざまな年代のデータを集めることで、より正確な「脳年齢のものさし」を作ることを目指しています。
      </p>

      <h2 className="font-data text-2xl text-ink mt-12">CHC理論とは</h2>
      <p className="mt-3 text-base text-muted leading-relaxed">
        人の知能を3つの階層でとらえる、現在もっとも実証的とされる知能の理論です。
        一番上に全体的な知能（g）があり、その下に「広域能力」、さらに細かい「狭域能力」が連なります。
      </p>

      <svg viewBox="0 0 600 220" width="100%" role="img" aria-label="CHC理論の3階層" className="mt-4">
        <rect x="230" y="16" width="140" height="40" rx="6" fill="var(--brass)" />
        <text x="300" y="41" textAnchor="middle" fontSize="16" fill="#fff">一般知能 g</text>
        <line x1="300" y1="56" x2="300" y2="80" stroke="var(--muted)" strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => {
          const x = 60 + i * 130;
          return (
            <g key={i}>
              <line x1="300" y1="80" x2={x + 55} y2="100" stroke="var(--muted)" strokeWidth="1" />
              <rect x={x} y="100" width="110" height="38" rx="6" fill="var(--paper)" stroke="var(--border)" />
              <text x={x + 55} y="124" textAnchor="middle" fontSize="15" fill="var(--ink)">広域能力</text>
            </g>
          );
        })}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const x = 40 + i * 68;
          return (
            <g key={i}>
              <rect x={x} y="170" width="52" height="30" rx="4" fill="var(--bg)" stroke="var(--border)" />
              <text x={x + 26} y="190" textAnchor="middle" fontSize="13" fill="var(--muted)">狭域</text>
            </g>
          );
        })}
      </svg>

      <h2 className="font-data text-2xl text-ink mt-12">本アプリが測る6つの能力</h2>
      <p className="mt-3 text-base text-muted leading-relaxed">
        CHCの広域能力は約16種類ありますが、本アプリは
        <span className="text-ink font-body">脳年齢に関係が深い6つ</span>を選んで測ります。
        色つきが測定対象です。
      </p>
      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {BROAD.map((b) => (
          <div
            key={b.code}
            className="flex items-center gap-3 rounded-lg border px-4 py-3"
            style={
              b.measured
                ? { borderColor: "var(--brass)", background: "var(--paper)" }
                : { borderColor: "var(--border)", opacity: 0.6 }
            }
          >
            <span
              className="font-data text-base"
              style={{ color: b.measured ? "var(--brass)" : "var(--muted)" }}
            >
              {b.code}
            </span>
            <span className="text-base text-ink">{b.name}</span>
            {b.note && <span className="text-base text-muted ml-auto">{b.note}</span>}
          </div>
        ))}
      </div>

      <h2 className="font-data text-2xl text-ink mt-12">なぜこの6つ？</h2>
      <p className="mt-3 text-base text-muted leading-relaxed">
        処理速度・作業記憶・流動性推論・記憶・視覚処理の5つは、
        <span className="text-ink font-body">加齢とともに変化しやすい（流動系）</span>能力です。
        脳年齢はこの5つの総合点から推定します。
        いっぽう結晶性知能（言葉・知識）は加齢で下がりにくいため、
        <span className="text-ink font-body">比較の基準（対照）</span>として使います。
      </p>

      <h2 className="font-data text-2xl text-ink mt-12">脳年齢と偏差値の出し方</h2>
      <ul className="mt-3 text-base text-muted leading-relaxed list-disc pl-5 space-y-1.5">
        <li>各課題のスコアを、同年代の標準と比べて偏差値（平均50）に変換します。</li>
        <li>流動系5能力の総合点から、脳年齢の目安を推定します。</li>
        <li>現在の基準値は文献ベースの暫定値で、データが集まるほど精度が上がります。</li>
      </ul>

      <div className="mt-12 text-center">
        <Link
          href="/setup"
          className="inline-block bg-brass text-white rounded-md px-8 py-3 text-lg font-body"
        >
          計測をはじめる
        </Link>
      </div>
    </div>
  );
}
