export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-data text-2xl text-ink mb-2">プライバシーポリシー</h1>
      <p className="text-sm text-muted mb-10">最終更新：2026年6月27日</p>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">1. 事業者</h2>
        <p className="text-base text-muted leading-relaxed">
          Luminia（以下「当サービス」）は、個人情報保護法その他の関連法令を遵守し、
          利用者の個人情報を適切に取り扱います。
        </p>
        <dl className="mt-3 text-base text-muted leading-relaxed">
          <dt className="font-body text-ink mt-2">サービス名</dt>
          <dd>Luminia</dd>
          <dt className="font-body text-ink mt-2">お問い合わせ先</dt>
          <dd>ykkm2160m@gmail.com</dd>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">2. 収集する情報</h2>
        <p className="text-base text-muted leading-relaxed mb-3">
          当サービスは以下の情報を収集します。
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 font-body text-ink">情報</th>
                <th className="text-left py-2 pr-4 font-body text-ink">取得タイミング</th>
                <th className="text-left py-2 font-body text-ink">個人情報該当</th>
              </tr>
            </thead>
            <tbody className="text-muted">
              <tr className="border-b border-border">
                <td className="py-2 pr-4">メールアドレス</td>
                <td className="py-2 pr-4">アカウント連携時</td>
                <td className="py-2">該当</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">年齢帯・性別・職業等</td>
                <td className="py-2 pr-4">計測開始前</td>
                <td className="py-2">単体では非該当（匿名統計）</td>
              </tr>
              <tr className="border-b border-border">
                <td className="py-2 pr-4">認知テスト結果（反応時間・正答率）</td>
                <td className="py-2 pr-4">計測中</td>
                <td className="py-2">単体では非該当（匿名統計）</td>
              </tr>
              <tr>
                <td className="py-2 pr-4">デバイス情報（画面サイズ・OS等）</td>
                <td className="py-2 pr-4">計測中</td>
                <td className="py-2">非該当</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-muted">
          ※ メールアドレスを登録しない場合、計測データはすべて匿名で処理されます。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">3. 利用目的</h2>
        <ul className="text-base text-muted leading-relaxed list-disc list-inside space-y-1">
          <li>ログイン認証および計測履歴の端末間同期</li>
          <li>サービスの提供・改善・不正利用防止</li>
          <li>規準値・評価モデルの精度向上（統計処理）</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">4. 第三者提供</h2>
        <p className="text-base text-muted leading-relaxed">
          法令に基づく場合を除き、取得した個人情報を第三者に提供することはありません。
          ただし、サービス運営のため以下の業者に業務を委託しています。
        </p>
        <dl className="mt-3 text-base text-muted leading-relaxed">
          <dt className="font-body text-ink mt-2">Supabase Inc.</dt>
          <dd>データベース・認証基盤（サーバー所在地：米国・東京）</dd>
          <dt className="font-body text-ink mt-2">Vercel Inc.</dt>
          <dd>アプリケーションホスティング（サーバー所在地：米国）</dd>
        </dl>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">5. 保存期間</h2>
        <ul className="text-base text-muted leading-relaxed list-disc list-inside space-y-1">
          <li>メールアドレス：アカウント削除の申請を受けるまで</li>
          <li>計測データ（匿名統計）：サービス提供終了まで</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">6. ローカルストレージについて</h2>
        <p className="text-base text-muted leading-relaxed">
          当サービスは計測履歴の一時保存にブラウザの localStorage を使用します。
          サーバーへは送信されず、ブラウザのデータ消去により削除されます。
          Cookie は使用していません。
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">7. 開示・訂正・削除の請求</h2>
        <p className="text-base text-muted leading-relaxed">
          保有する個人情報の開示・訂正・利用停止・削除をご希望の場合は、
          以下の窓口までメールにてご連絡ください。本人確認の上、法令の定める範囲で対応いたします。
        </p>
        <p className="mt-2 text-base text-muted">
          お問い合わせ先：<a href="mailto:ykkm2160m@gmail.com" className="text-brass underline">ykkm2160m@gmail.com</a>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-lg text-ink mb-3">8. ポリシーの変更</h2>
        <p className="text-base text-muted leading-relaxed">
          本ポリシーは必要に応じて改定することがあります。
          重要な変更を行う場合は、サービス内でお知らせします。
        </p>
      </section>
    </div>
  );
}
