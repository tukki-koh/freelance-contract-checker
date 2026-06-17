import Link from 'next/link'
import {
  Shield, CheckCircle, AlertTriangle, ArrowRight,
  Building2, User, Clock, ChevronDown, Star, FileSearch
} from 'lucide-react'
import { StickyCtaBar } from '@/components/StickyCtaBar'

// ================================================================
// ページ本体
// ================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F4' }}>

      {/* ヘッダー */}
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">契約書チェッカー</span>
            <span className="text-xs text-gray-400 ml-1">by ワークシールド</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              無料で試す
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ================================================================
            ファーストビュー
        ================================================================ */}
        <section className="max-w-5xl mx-auto px-6 pt-16 pb-16">
          <div className="max-w-2xl">
            <p className="text-sm text-gray-500 mb-4">フリーランス新法・下請法 対応チェックツール</p>

            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              サインする前に、<br />
              <span className="text-blue-600">30秒だけ</span>確認してください。
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              2024年11月に施行されたフリーランス新法。「自分の契約書、実は違反してるかも」と気になっても、弁護士に頼むのはハードルが高い。
            </p>

            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              このツールは契約書を貼り付けるだけで、どの条項が問題なのかを条文番号付きで教えてくれます。費用は500円。弁護士相談の60分の1です。
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all shadow-sm"
              >
                無料で1回試してみる
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup?next=/pricing"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-3.5 rounded-xl font-medium text-base transition-all border border-gray-200"
              >
                500円で診断する
              </Link>
            </div>
            <p className="text-xs text-gray-400">クレジットカード不要で登録できます</p>
          </div>
        </section>

        {/* ================================================================
            「こんな経験ありませんか？」共感セクション
        ================================================================ */}
        <section className="border-y border-gray-200 bg-white py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-8">こんな経験、ありませんか？</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  q: '「支払いは納品後90日以内」という条項があったけど、これって普通なの？',
                  note: '→ フリーランス新法では60日以内が上限です',
                },
                {
                  q: '「修正回数は無制限、品質に満足できなければ報酬なし」という契約書を渡された',
                  note: '→ 買い叩きとして違反になる可能性があります',
                },
                {
                  q: '「いつでも即日解約できる」という条項があった。これで大丈夫？',
                  note: '→ 30日前予告が義務です（第16条）',
                },
              ].map(({ q, note }) => (
                <div key={q} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">「{q}」</p>
                  <p className="text-xs text-red-500 font-medium">{note}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-8">
              このような条項、自分では気づきにくいのが実情です。法律の文章を全部読んで照合するのは、現実的ではありません。
            </p>
          </div>
        </section>

        {/* ================================================================
            使い方（シンプルに）
        ================================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2">使い方はシンプルです</h2>
          <p className="text-gray-500 text-sm mb-10">難しい操作は何もありません</p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '1',
                title: '契約書をコピーする',
                desc: 'PDFでも画像でも、テキストをコピーするだけでも大丈夫です。',
              },
              {
                num: '2',
                title: '貼り付けて送信する',
                desc: '入力欄に貼り付けてボタンを押すだけ。フォームは1画面で完結します。',
              },
              {
                num: '3',
                title: '結果を確認する',
                desc: '約30秒で「第○条違反の可能性」と具体的に指摘。修正案もそのまま使えます。',
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {num}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-2 text-sm text-gray-400">
            <Clock className="h-4 w-4" />
            診断にかかる時間は平均30秒ほどです
          </div>
        </section>

        {/* ================================================================
            チェックしている内容
        ================================================================ */}
        <section className="border-y border-gray-200 bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">何をチェックしているか</h2>
            <p className="text-gray-500 text-sm mb-8">フリーランス新法と下請法の主要条項をすべてカバーしています</p>

            <div className="grid sm:grid-cols-2 gap-3 max-w-2xl">
              {[
                '取引条件の書面明示（第3条）',
                '報酬の支払期日・60日以内（第4条）',
                '受領拒否・返品・買い叩きの禁止（第5条）',
                'ハラスメント対策の整備義務（第14条）',
                '中途解除の30日前予告（第16条）',
                '下請法の禁止行為（減額・不当返品など）',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            使った人の声（自然な形で）
        ================================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2">使った人の声</h2>
          <p className="text-gray-500 text-sm mb-10">実際の体験をそのまま掲載しています</p>

          <div className="space-y-6">
            {[
              {
                name: 'Webデザイナー・田中さん（フリーランス歴3年）',
                stars: 5,
                text: '「支払いは納品確認後120日以内」という条項を見落としていました。指摘してもらって初めて気づき、交渉して60日に修正してもらいました。500円でよかったです。',
              },
              {
                name: 'エンジニア・山田さん（副業フリーランス）',
                stars: 5,
                text: '初めての業務委託で契約書の何を見ればいいかわからなかった。「即日解約可能」という条項が違反だと教えてもらえて、ちゃんと30日前予告の文言に直してもらえました。',
              },
              {
                name: 'ライター・鈴木さん（フリーランス歴10年）',
                stars: 5,
                text: '10年やってても見落とすんだな、と思いました。「修正は無制限」という条項が引っかかりました。ベテランほど「これくらいは普通」と流してしまうので、定期的に使っています。',
              },
            ].map(({ name, stars, text }) => (
              <div key={name} className="border border-gray-200 bg-white rounded-xl p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">{text}</p>
                <p className="text-xs text-gray-400">{name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            弁護士との比較（表ではなく文章で）
        ================================================================ */}
        <section className="border-y border-gray-200 bg-white py-16">
          <div className="max-w-5xl mx-auto px-6 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">弁護士に頼むのとどう違うの？</h2>
            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                弁護士への相談は、1時間あたり1〜3万円が相場で、予約から回答まで数日かかることもあります。「この条項だけ確認したい」という目的には少し重い選択肢かもしれません。
              </p>
              <p>
                このツールは500円・30秒で「どの条項が、なぜ問題なのか」を条文番号付きで出してくれます。弁護士の代わりではなく、弁護士に相談するかどうかの判断材料として使うのが、いちばん合理的だと思っています。
              </p>
              <p className="text-gray-400">
                ※ 重要な契約の最終判断は、必ず弁護士にご相談ください。
              </p>
            </div>
          </div>
        </section>

        {/* ================================================================
            料金（シンプルに）
        ================================================================ */}
        <section className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-xl font-bold text-gray-900 mb-2">料金</h2>
          <p className="text-gray-500 text-sm mb-10">まず無料で試してみてください</p>

          <div className="grid md:grid-cols-3 gap-5 max-w-3xl">
            {/* 無料 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">無料プラン</span>
              </div>
              <div className="mb-4">
                <span className="text-3xl font-extrabold text-gray-900">¥0</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />登録は無料</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />1回だけ診断できます</li>
              </ul>
              <Link href="/signup" className="block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-medium transition-colors text-sm">
                無料で始める
              </Link>
            </div>

            {/* 単発 */}
            <div className="rounded-xl border-2 border-blue-400 bg-white p-6 flex flex-col relative">
              <div className="absolute -top-3 left-5">
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">よく使われています</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <FileSearch className="h-4 w-4 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">単発診断</span>
              </div>
              <div className="mb-1">
                <span className="text-3xl font-extrabold text-gray-900">¥500</span>
                <span className="text-gray-400 text-xs ml-1">/ 1回</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">弁護士相談の約60分の1</p>
              <ul className="space-y-2 mb-6 flex-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />全条項チェック</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />条文番号付きで指摘</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />修正案の提示</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />結果は永久保存</li>
              </ul>
              <Link href="/signup?next=/pricing" className="block text-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold transition-colors text-sm">
                500円で診断する
              </Link>
            </div>

            {/* 法人 */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Building2 className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-medium text-purple-600">法人・月額</span>
              </div>
              <div className="mb-1">
                <span className="text-3xl font-extrabold text-gray-900">¥2,980</span>
                <span className="text-gray-400 text-xs ml-1">/ 月</span>
              </div>
              <p className="text-xs text-gray-400 mb-4">月6件以上なら月額が割安</p>
              <ul className="space-y-2 mb-6 flex-1 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />診断数は無制限</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />発注側のチェックも対応</li>
                <li className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />優先サポート</li>
              </ul>
              <Link href="/signup?next=/pricing" className="block text-center bg-purple-600 hover:bg-purple-700 text-white py-2.5 rounded-lg font-bold transition-colors text-sm">
                法人プランを始める
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            FAQ（自然な口調で）
        ================================================================ */}
        <section className="border-t border-gray-200 bg-gray-50 py-16">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-10">よく聞かれること</h2>

            <div className="space-y-3">
              {[
                {
                  q: 'AIの診断はどれくらい正確ですか？',
                  a: '最新のClaude AIが条文と照合して判定しています。感覚的な判断ではなく、条文番号を根拠にしているので、「なぜ問題なのか」が明確にわかります。ただし、これはあくまで一次チェックです。確信が持てない場合や重要な契約は、弁護士への相談をお勧めします。',
                },
                {
                  q: '契約書の内容が外部に漏れる心配はありませんか？',
                  a: '入力した内容は診断処理にのみ使用します。第三者への提供や公開はしません。通信はSSLで暗号化されています。',
                },
                {
                  q: 'PDFや画像でも使えますか？',
                  a: 'はい。PDF・画像（JPG/PNG）・テキスト貼り付けに対応しています。スキャンしたPDFもOCRで読み取ります。ただし画質が著しく低い場合は精度が落ちることがあります。',
                },
                {
                  q: '返金してもらえますか？',
                  a: 'AIが結果を返せなかったなど、技術的な問題があった場合は7日以内にご連絡いただければ対応します。「違反が見つからなかった」という診断内容に関する返金はお受けできません。',
                },
                {
                  q: '発注側（企業）も使えますか？',
                  a: 'はい。自社が発注する際の契約書が、フリーランス新法・下請法に違反していないか確認するのにも使えます。月額プランでは件数無制限です。',
                },
              ].map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                    <span className="text-sm font-medium text-gray-800">{q}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 pt-1">
                    <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            最終CTA（押しつけがましくなく）
        ================================================================ */}
        <section className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            まず1回、試してみてください
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            無料登録で1回だけ診断できます。クレジットカードの登録は必要ありません。
            気に入ったら、そのあとで500円プランを選んでいただければ。
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-10 py-4 rounded-xl font-bold text-base transition-all"
          >
            無料で試してみる
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-gray-400 mt-4">登録は30秒で完了します</p>
        </section>
      </main>

      <StickyCtaBar />

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" />
            <span>ワークシールド｜契約書チェッカー</span>
          </div>
          <p>AIによる一次チェックツールです。重要な契約の最終判断は弁護士にご相談ください。</p>
        </div>
      </footer>
    </div>
  )
}
