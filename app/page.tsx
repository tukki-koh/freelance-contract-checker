import Link from 'next/link'
import {
  Shield, CheckCircle, AlertTriangle, ArrowRight,
  Building2, User, Clock, ChevronDown, Star, FileSearch
} from 'lucide-react'
import { StickyCtaBar } from '@/components/StickyCtaBar'

// ================================================================
// フリーランス契約書チェッカー ランディングページ
// 世界水準のSaaS（Stripe / Linear / Notion 系）を参照した信頼設計
// ================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F7F4' }}>

      {/* ================================================================
          告知バー（施行済みの事実で緊急性と信頼を提示）
      ================================================================ */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 h-9 flex items-center justify-center gap-2 text-xs">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300">
            2024年11月<span className="text-white font-medium">「フリーランス新法」施行済み</span>
            <span className="hidden sm:inline text-slate-400"> ― あなたの契約書、今の条項のままで本当に大丈夫ですか？</span>
          </span>
        </div>
      </div>

      {/* ================================================================
          ヘッダー
      ================================================================ */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm shadow-blue-600/30">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="leading-none">
              <span className="text-sm font-bold text-slate-900">契約書チェッカー</span>
              <span className="block text-[10px] text-slate-400 mt-0.5">by ワークシールド</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-500">
            <a href="#how" className="hover:text-slate-900 transition-colors">使い方</a>
            <a href="#voices" className="hover:text-slate-900 transition-colors">利用者の声</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">料金</a>
            <a href="#faq" className="hover:text-slate-900 transition-colors">よくある質問</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              無料で試す
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* ================================================================
            ファーストビュー（左：訴求 / 右：診断結果モックアップ）
        ================================================================ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 aurora pointer-events-none" />
          <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">

            {/* 左：コピー */}
            <div className="animate-float-up">
              {/* 評価バッジ */}
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 backdrop-blur px-3 py-1.5 mb-6 shadow-sm">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600">4.8</span>
                <span className="text-xs text-slate-400">/ 全国のフリーランスに利用されています</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold text-slate-900 leading-[1.12] mb-6">
                サインする前に、<br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  たった30秒
                </span>
                だけ<br className="hidden md:block" />
                確認してください。
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-6 max-w-lg">
                その業務委託契約書、フリーランス新法に違反しているかもしれません。
                契約書を貼り付けるだけで、<span className="text-slate-900 font-medium">どの条項が・なぜ問題なのか</span>を
                条文番号付きでAIが指摘します。
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <Link
                  href="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/25"
                >
                  無料で1回診断してみる
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/signup?next=/pricing"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-xl font-medium text-base transition-all border border-slate-200 shadow-sm"
                >
                  500円で本診断する
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />クレジットカード不要
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />登録30秒
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />SSL暗号化・内容は保存しません
                </span>
              </div>
            </div>

            {/* 右：診断結果モックアップ（製品を見せる） */}
            <div className="animate-float-up lg:pl-4" style={{ animationDelay: '0.12s' }}>
              <div className="relative">
                {/* 背面の装飾カード */}
                <div className="absolute -inset-3 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 rounded-[26px] blur-xl" />

                <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 overflow-hidden">
                  {/* ウィンドウ風ヘッダー */}
                  <div className="flex items-center gap-1.5 px-4 h-10 border-b border-slate-100 bg-slate-50/80">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-3 text-[11px] text-slate-400 flex items-center gap-1">
                      <Shield className="h-3 w-3" /> 診断結果
                    </span>
                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />完了・28秒
                    </span>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* サマリー */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">業務委託契約書.pdf</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="h-3 w-3" />要修正 2件
                      </span>
                    </div>

                    {/* 違反カード1 */}
                    <div className="rounded-xl border border-red-100 bg-red-50/60 p-3.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900">支払期日が「納品後90日」になっています</p>
                          <p className="text-[11px] text-red-600 mt-0.5">第4条違反の可能性 ― 支払期日は受領後60日以内が上限</p>
                          <div className="mt-2 rounded-lg bg-white border border-slate-100 p-2 text-[11px] text-slate-600">
                            <span className="text-emerald-600 font-medium">修正案：</span>「報酬は成果物の受領日から起算して60日以内に支払う」
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 違反カード2 */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3.5">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900">「即日解約可能」の条項があります</p>
                          <p className="text-[11px] text-amber-600 mt-0.5">第16条 ― 中途解除は30日前の予告が義務です</p>
                        </div>
                      </div>
                    </div>

                    {/* 適合カード */}
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                        <p className="text-[13px] font-medium text-slate-700">取引条件の書面明示（第3条）は適合しています</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 浮遊する信頼バッジ */}
                <div className="absolute -bottom-4 -left-4 hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-xl">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div className="leading-none">
                    <p className="text-[11px] text-slate-400">平均診断時間</p>
                    <p className="text-sm font-bold text-slate-900">約30秒</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            信頼バー（数値で裏付け）
        ================================================================ */}
        <section className="border-y border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { v: '30秒', l: '平均診断時間' },
              { v: '1/60', l: '弁護士相談比のコスト' },
              { v: '¥500〜', l: '1回あたりの料金' },
              { v: '4.8 / 5', l: '利用者の満足度' },
            ].map(({ v, l }) => (
              <div key={l} className="text-center">
                <p className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{v}</p>
                <p className="text-xs text-slate-500 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            共感セクション
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Problem</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">
              こんな条項、見落としていませんか？
            </h2>
            <p className="text-slate-500 mt-3">
              法律の条文を全部読んで契約書と照合するのは、現実的ではありません。だから、気づかないうちに不利な条項にサインしてしまう。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                q: '支払いは納品後90日以内という条項があったけど、これって普通なの？',
                note: 'フリーランス新法では60日以内が上限です',
              },
              {
                q: '修正回数は無制限、品質に満足できなければ報酬なしという契約書を渡された',
                note: '買い叩きとして違反になる可能性があります',
              },
              {
                q: 'いつでも即日解約できるという条項があった。これで大丈夫？',
                note: '30日前予告が義務です（第16条）',
              },
            ].map(({ q, note }) => (
              <div key={q} className="group rounded-2xl bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <p className="text-sm text-slate-700 leading-relaxed mb-4">「{q}」</p>
                <div className="flex items-start gap-2 pt-3 border-t border-slate-100">
                  <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 font-medium leading-relaxed">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================
            使い方
        ================================================================ */}
        <section id="how" className="border-y border-slate-200 bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">How it works</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">3ステップ、難しい操作はありません</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { num: '01', title: '契約書をコピーする', desc: 'PDF・画像・テキスト貼り付けのいずれでもOK。スキャンしたPDFもそのまま読み取ります。' },
                { num: '02', title: '貼り付けて送信する', desc: '入力欄に貼り付けてボタンを押すだけ。フォームは1画面で完結します。' },
                { num: '03', title: '結果を確認する', desc: '約30秒で「第○条違反の可能性」と条文番号付きで指摘。修正案もそのまま交渉に使えます。' },
              ].map(({ num, title, desc }) => (
                <div key={num} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-7">
                  <span className="text-4xl font-extrabold bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">{num}</span>
                  <h3 className="font-bold text-slate-900 mt-3 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400">
              <Clock className="h-4 w-4" />
              診断にかかる時間は平均30秒ほどです
            </div>
          </div>
        </section>

        {/* ================================================================
            チェック内容
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Coverage</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2 mb-4">
                フリーランス新法と下請法の<br className="hidden md:block" />主要条項をすべてカバー
              </h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                最新のClaude AIが、感覚ではなく条文を根拠に判定します。だから「なぜ問題なのか」が明確にわかり、そのまま交渉材料に使えます。
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:gap-3 transition-all">
                無料で診断してみる <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {[
                '取引条件の書面明示（第3条）',
                '報酬の支払期日・60日以内（第4条）',
                '受領拒否・返品・買い叩きの禁止（第5条）',
                'ハラスメント対策の整備義務（第14条）',
                '中途解除の30日前予告（第16条）',
                '下請法の禁止行為（減額・不当返品など）',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-700 leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            利用者の声
        ================================================================ */}
        <section id="voices" className="border-y border-slate-200 bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl mb-12">
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Voices</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">使った人の声</h2>
              <p className="text-slate-500 mt-3">実際の体験をそのまま掲載しています。</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  name: '田中さん', role: 'Webデザイナー・フリーランス歴3年', initial: '田',
                  text: '「支払いは納品確認後120日以内」という条項を見落としていました。指摘してもらって初めて気づき、交渉して60日に修正。500円でよかったです。',
                },
                {
                  name: '山田さん', role: 'エンジニア・副業フリーランス', initial: '山',
                  text: '初めての業務委託で何を見ればいいかわからなかった。「即日解約可能」が違反だと教えてもらえて、30日前予告の文言にちゃんと直せました。',
                },
                {
                  name: '鈴木さん', role: 'ライター・フリーランス歴10年', initial: '鈴',
                  text: '10年やってても見落とすんだな、と。ベテランほど「これくらい普通」と流してしまうので、契約のたびに使っています。',
                },
              ].map(({ name, role, initial, text }) => (
                <div key={name} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/50 p-6 shadow-sm">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed flex-1 mb-5">{text}</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-bold">
                      {initial}
                    </div>
                    <div className="leading-tight">
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-400">{role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            弁護士との比較
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Comparison</span>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">弁護士に頼むのと、どう違うの？</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* 弁護士 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <p className="text-sm font-semibold text-slate-400 mb-4">弁護士に相談する場合</p>
              <ul className="space-y-3 text-sm text-slate-600">
                {['1時間あたり1〜3万円が相場', '予約から回答まで数日かかることも', '「この条項だけ確認したい」には少し重い'].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />{t}
                  </li>
                ))}
              </ul>
            </div>
            {/* ツール */}
            <div className="rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-7 relative shadow-lg shadow-blue-600/10">
              <span className="absolute -top-3 left-7 bg-blue-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">日常のチェックに最適</span>
              <p className="text-sm font-semibold text-blue-600 mb-4">契約書チェッカーの場合</p>
              <ul className="space-y-3 text-sm text-slate-700">
                {['500円・30秒で結果が出る', '「どの条項が・なぜ問題か」を条文番号付きで', '弁護士に相談すべきかの判断材料になる'].map((t) => (
                  <li key={t} className="flex items-start gap-2.5">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-5">※ 重要な契約の最終判断は、必ず弁護士にご相談ください。本サービスは一次チェックを目的としています。</p>
        </section>

        {/* ================================================================
            料金
        ================================================================ */}
        <section id="pricing" className="border-y border-slate-200 bg-white py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Pricing</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">シンプルな料金</h2>
              <p className="text-slate-500 mt-3">まずは無料で1回、試してみてください。</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {/* 無料 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">無料プラン</span>
                </div>
                <div className="mb-5"><span className="text-4xl font-extrabold text-slate-900">¥0</span></div>
                <ul className="space-y-2.5 mb-7 flex-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />登録は無料</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />1回だけ診断できます</li>
                </ul>
                <Link href="/signup" className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 rounded-xl font-medium transition-colors text-sm">
                  無料で始める
                </Link>
              </div>

              {/* 単発（推し） */}
              <div className="rounded-2xl border-2 border-blue-500 bg-white p-7 flex flex-col relative shadow-xl shadow-blue-600/10 md:-translate-y-3">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-3 py-0.5 rounded-full whitespace-nowrap">よく選ばれています</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <FileSearch className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">単発診断</span>
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-slate-900">¥500</span>
                  <span className="text-slate-400 text-xs ml-1">/ 1回</span>
                </div>
                <p className="text-xs text-slate-400 mb-5">弁護士相談の約60分の1</p>
                <ul className="space-y-2.5 mb-7 flex-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />全条項チェック</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />条文番号付きで指摘</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />修正案の提示</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />結果は永久保存</li>
                </ul>
                <Link href="/signup?next=/pricing" className="block text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-xl font-bold transition-all text-sm shadow-lg shadow-blue-600/25">
                  500円で診断する
                </Link>
              </div>

              {/* 法人 */}
              <div className="rounded-2xl border border-slate-200 bg-white p-7 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">法人・月額</span>
                </div>
                <div className="mb-1">
                  <span className="text-4xl font-extrabold text-slate-900">¥2,980</span>
                  <span className="text-slate-400 text-xs ml-1">/ 月</span>
                </div>
                <p className="text-xs text-slate-400 mb-5">月6件以上なら月額が割安</p>
                <ul className="space-y-2.5 mb-7 flex-1 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />診断数は無制限</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />発注側のチェックも対応</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />優先サポート</li>
                </ul>
                <Link href="/signup?next=/pricing" className="block text-center bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-colors text-sm">
                  法人プランを始める
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            セキュリティ・信頼
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-3xl bg-slate-900 text-white p-10 md:p-14 relative overflow-hidden">
            <div className="absolute inset-0 aurora opacity-40 pointer-events-none" />
            <div className="relative max-w-2xl">
              <span className="text-xs font-semibold text-blue-300 tracking-wide uppercase">Security & Trust</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-4">大切な契約書だからこそ、安全に。</h2>
              <p className="text-slate-300 leading-relaxed mb-8">
                入力された契約書の内容は診断処理にのみ使用し、第三者への提供や公開は一切行いません。通信はすべてSSLで暗号化されています。
              </p>
              <div className="grid sm:grid-cols-3 gap-5">
                {[
                  { icon: Shield, t: 'SSL暗号化通信', d: '全通信を暗号化' },
                  { icon: CheckCircle, t: '内容は非公開', d: '第三者提供なし' },
                  { icon: FileSearch, t: '診断のみに利用', d: '目的外利用なし' },
                ].map(({ icon: Icon, t, d }) => (
                  <div key={t} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                    <Icon className="h-5 w-5 text-blue-300 mb-3" />
                    <p className="text-sm font-semibold">{t}</p>
                    <p className="text-xs text-slate-400 mt-1">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FAQ
        ================================================================ */}
        <section id="faq" className="border-t border-slate-200 bg-white py-20">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">FAQ</span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">よく聞かれること</h2>
            </div>

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
                <details key={q} className="group rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none">
                    <span className="text-sm font-semibold text-slate-800">{q}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-5 pt-1">
                    <p className="text-sm text-slate-600 leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            最終CTA
        ================================================================ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 hero-grid opacity-50 pointer-events-none" />
          <div className="relative max-w-2xl mx-auto px-6 py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 mb-6 shadow-sm">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-500">多くのフリーランスが利用しています</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              まず1回、<br className="sm:hidden" />試してみてください。
            </h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              無料登録で1回だけ診断できます。クレジットカードの登録は不要。
              気に入ったら、そのあとで500円プランを選んでいただければ大丈夫です。
            </p>
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-base transition-all shadow-xl shadow-blue-600/25"
            >
              無料で試してみる
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <p className="text-xs text-slate-400 mt-4">登録は30秒で完了します</p>
          </div>
        </section>
      </main>

      <StickyCtaBar />

      {/* ================================================================
          フッター
      ================================================================ */}
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">ワークシールド｜契約書チェッカー</span>
          </div>
          <p className="text-xs text-slate-400 text-center sm:text-right max-w-md">
            AIによる一次チェックツールです。重要な契約の最終判断は弁護士にご相談ください。
          </p>
        </div>
      </footer>
    </div>
  )
}
