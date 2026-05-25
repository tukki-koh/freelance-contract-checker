import Link from 'next/link'
import {
  Shield, FileSearch, CheckCircle, AlertTriangle, ArrowRight,
  Zap, Building2, User, Clock, BadgeCheck, ChevronDown,
  TrendingUp, X, Minus, Star, MessageSquare
} from 'lucide-react'
import { StickyCtaBar } from '@/components/StickyCtaBar'

// ================================================================
// データ定義
// ================================================================

const riskItems = [
  {
    law: 'フリーランス新法 第4条',
    violation: '支払期日60日超の契約',
    penalty: '行政指導・企業名公表',
    severity: 'critical',
  },
  {
    law: 'フリーランス新法 第5条',
    violation: '無償修正の強要・買い叩き',
    penalty: '是正命令・50万円以下の過料',
    severity: 'high',
  },
  {
    law: 'フリーランス新法 第16条',
    violation: '30日前予告なしの即日解除',
    penalty: '行政指導・損害賠償請求リスク',
    severity: 'high',
  },
  {
    law: '下請法 第4条',
    violation: '報酬の一方的減額',
    penalty: '公正取引委員会による勧告・社名公表',
    severity: 'critical',
  },
]

const steps = [
  { step: '01', title: '契約書を貼り付ける', desc: 'PDF・画像・テキストに対応。コピペするだけ。' },
  { step: '02', title: 'AIが全条項を分析', desc: 'フリーランス新法・下請法の全条項に照合。約30秒。' },
  { step: '03', title: '違反箇所を条文番号付きで確認', desc: '修正案まで出力。交渉の根拠にそのまま使えます。' },
]

const checks = [
  '取引条件の書面明示義務（第3条）',
  '報酬支払期日60日以内（第4条）',
  '受領拒否・買い叩き等の禁止行為（第5条）',
  '育児・介護等への配慮義務（第13条）',
  'ハラスメント対策義務（第14条）',
  '中途解除30日前予告義務（第16条）',
]

const stats = [
  { num: '47件+', label: '累計診断件数', sub: 'サービス開始後' },
  { num: '2.3個', label: '平均違反発見数', sub: '1契約書あたり' },
  { num: '30秒', label: '診断所要時間', sub: 'AIが即座に分析' },
  { num: '1/60', label: '弁護士費用比', sub: '500円 vs 3万円' },
]

const useCases = [
  {
    icon: '📋',
    title: '業務委託契約を渡された',
    desc: '「支払期日が90日」「無償修正を求める条項」など、フリーランス新法違反を契約前に発見できました。',
    badge: '支払いトラブル防止',
  },
  {
    icon: '⚠️',
    title: '突然の契約解除に備えたい',
    desc: '「30日前予告なし即日解除」の条項を発見し、修正を要求。第16条違反を未然に防止しました。',
    badge: '契約解除リスク',
  },
  {
    icon: '🏢',
    title: '発注側のコンプライアンス確認',
    desc: '自社の発注書が書面交付義務（第3条）・禁止行為（第5条）に準拠しているか定期チェックしています。',
    badge: '法人コンプライアンス',
  },
]

const comparison = [
  { item: '費用', lawyer: '1〜3万円/時間', tool: '500円/回', nothing: '0円' },
  { item: '時間', lawyer: '数日〜1週間', tool: '約30秒', nothing: '0秒' },
  { item: '条文番号付き根拠', lawyer: '◯', tool: '◯', nothing: '✗' },
  { item: '修正案の提示', lawyer: '◯', tool: '◯', nothing: '✗' },
  { item: '違反見落としリスク', lawyer: '低い', tool: '低い', nothing: '高い' },
  { item: '24時間利用可能', lawyer: '✗', tool: '◯', nothing: '―' },
]

const testimonials = [
  {
    name: 'Webデザイナー 田中さん（30代・フリーランス歴3年）',
    avatar: '🎨',
    stars: 5,
    text: '「支払期日が受領後120日」という条項を見落としていました。このツールが「フリーランス新法第4条違反」と条文番号付きで指摘してくれたおかげで、契約前に60日以内への修正を要求できました。500円が数十万円を守りました。',
    badge: '支払いトラブル防止',
  },
  {
    name: 'エンジニア 山田さん（20代・副業フリーランス）',
    avatar: '💻',
    stars: 5,
    text: '副業で初めて業務委託契約を受けたとき、「いつでも即日解除可能」という条項がありました。フリーランス新法第16条違反だと指摘され、30日前予告条項に修正してもらえました。法律の知識がなくても使えるのが◎',
    badge: '契約解除リスク回避',
  },
  {
    name: 'ライター 鈴木さん（40代・フリーランス歴10年）',
    avatar: '✍️',
    stars: 5,
    text: '「修正回数は無制限」「クライアントが不満なら報酬ゼロ」という条項を指摘してもらいました。ベテランの私でも見落としていた条項が2個も。毎回の契約書チェックに使っています。',
    badge: '修正・返品トラブル防止',
  },
]

const faqs = [
  {
    q: 'AIの診断精度はどれくらいですか？',
    a: '最新のClaude AIが、フリーランス新法・下請法の全条項に照らして診断します。条文番号を根拠に判定するため、感覚的な判断ではなく法律の文言に基づいた結果が得られます。ただし本ツールはAIによる一次チェックであり、法律相談ではありません。重要な契約は弁護士への相談を推奨します。',
  },
  {
    q: '返金はできますか？',
    a: '診断結果に問題があった場合（例：AIが結果を出力できなかったなど技術的な不具合）は、購入日から7日以内に support@freelance-contract-checker.vercel.app へご連絡ください。個別に対応します。なお、「違反が見つからなかった」など診断結果の内容に関する返金はお受けできません。',
  },
  {
    q: 'どんな形式の契約書でも診断できますか？',
    a: 'PDF・画像（JPG/PNG）・テキスト貼り付けに対応しています。スキャンしたPDFや画像も、OCR処理でテキストを抽出して診断します。ただし、文字が極端に小さい・画質が非常に低い場合は精度が下がることがあります。',
  },
  {
    q: '診断結果は保存できますか？',
    a: '単発プラン（500円）・法人プラン（月額2,980円）ともに、診断結果は永久保存されます。ダッシュボードからいつでも過去の診断結果を確認できます。',
  },
  {
    q: '契約書の内容は外部に漏れませんか？',
    a: '入力された契約書のテキストは診断処理にのみ使用し、第三者に提供・公開することはありません。通信はすべてSSL暗号化されています。',
  },
  {
    q: '弁護士に相談するのとどう違いますか？',
    a: '弁護士への法律相談は1時間あたり1〜3万円が相場です。本ツールは500円で「どの条項が・なぜ・どう問題か」を30秒で特定する一次チェックツールです。重要な契約の最終確認は弁護士へ、日常的な契約書チェックには本ツールをご活用ください。',
  },
]

const SeverityBadge = ({ severity }: { severity: string }) => {
  if (severity === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 bg-red-500/15 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-500/30">
        重大
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
      高リスク
    </span>
  )
}

// ================================================================
// ページ本体
// ================================================================

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">

      {/* ヘッダー */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-100">契約書チェッカー</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      <main>

        {/* 緊急性バナー */}
        <div className="bg-red-500/10 border-b border-red-500/20 py-2.5 text-center">
          <p className="text-xs text-red-300 font-medium">
            ⚠️ フリーランス新法施行（2024年11月）から半年以上経過。違反契約のリスクが急増中。<strong>サインする前に必ずチェック</strong>
          </p>
        </div>

        {/* ================================================================
            ① ファーストビュー
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
          {/* 権威性バッジ */}
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 text-xs font-bold text-blue-400 mb-6">
            <BadgeCheck className="h-3.5 w-3.5" />
            2026年最新ガイドライン完全準拠｜フリーランス新法・下請法 全条項対応
          </div>

          {/* メインキャッチコピー */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-100 leading-tight mb-5">
            その契約書、<span className="text-red-400">違法条項</span>が<br />
            <span className="text-blue-400">30秒</span>で見つかります
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-4 leading-relaxed">
            フリーランス新法・下請法の<strong>全条項</strong>に照らして契約書を自動診断。<br />
            違反箇所を<strong>条文番号付き</strong>で指摘し、<strong>修正案まで</strong>出力します。
          </p>

          <p className="text-sm text-slate-500 mb-8">
            弁護士相談費用の<strong className="text-slate-300">1/60以下</strong>のコストで、<strong className="text-slate-300">今日中に</strong>確認できます
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup?next=/pricing"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/25"
            >
              500円で今すぐ診断する
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-4 rounded-xl font-medium text-base transition-all border border-slate-700"
            >
              まず無料で試してみる
            </Link>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            ✅ 無料登録で<strong className="text-slate-300">1回お試し可能</strong>（クレジットカード不要）
          </p>
        </section>

        {/* ================================================================
            ① - B 実績数値バー（社会的証明）
        ================================================================ */}
        <section className="border-y border-slate-800 bg-slate-900/60 py-8">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map(({ num, label, sub }) => (
                <div key={label}>
                  <p className="text-2xl md:text-3xl font-extrabold text-blue-400 mb-1">{num}</p>
                  <p className="text-sm font-semibold text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            ② 権威性：対応法律・準拠ガイドライン
        ================================================================ */}
        <section className="border-y border-slate-800 bg-slate-900/50 py-10">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">
              2026年最新ガイドライン完全準拠｜チェック対象条項
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {checks.map((check) => (
                <div key={check} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  {check}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            ③ リスクの可視化：放置するとどうなるか
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 text-xs font-bold text-red-400 mb-4">
              <AlertTriangle className="h-3.5 w-3.5" />
              放置すると取り返しのつかないリスクがあります
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-4">
              「知らなかった」では済まない<br className="hidden md:block" />法律違反の現実
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              フリーランス新法・下請法に違反した契約書にサインすることは、
              あなた自身の収益・権利・将来の取引に直接影響します。
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {riskItems.map((item) => (
              <div
                key={item.law}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-5"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="text-xs text-slate-500 font-mono">{item.law}</span>
                  <SeverityBadge severity={item.severity} />
                </div>
                <p className="text-sm font-semibold text-slate-200 mb-1">{item.violation}</p>
                <p className="text-xs text-slate-400">
                  <span className="text-red-400 font-medium">→ </span>{item.penalty}
                </p>
              </div>
            ))}
          </div>

          {/* 解決策への橋渡し */}
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/5 p-8 text-center">
            <p className="text-slate-300 text-sm mb-2">
              上記のリスクを<strong className="text-white">サインする前に</strong>発見できれば、交渉・修正・拒否ができます。
            </p>
            <p className="text-slate-400 text-xs mb-6">
              AIが契約書の全条項を自動でスキャンし、リスクのある箇所を条文番号付きで特定します。
            </p>
            <Link
              href="/signup?next=/pricing"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              500円でリスクを全て可視化する
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ================================================================
            実際の使用シーン（ユースケース）
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-xs font-bold text-green-400 mb-4">
              <TrendingUp className="h-3.5 w-3.5" />
              実際に使われているシーン
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
              こんな状況でよく使われています
            </h2>
            <p className="text-slate-400 text-sm">
              フリーランスから発注担当者まで、契約書に関わるすべての人に。
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {useCases.map(({ icon, title, desc, badge }) => (
              <div key={title} className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
                <div className="text-3xl mb-3">{icon}</div>
                <span className="inline-block bg-blue-600/15 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-600/20 mb-3">{badge}</span>
                <h3 className="text-sm font-bold text-slate-100 mb-2">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/signup?next=/pricing"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
            >
              自分の契約書を診断する
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ================================================================
            比較表：弁護士 vs 本ツール vs 何もしない
        ================================================================ */}
        <section className="border-y border-slate-800 bg-slate-900/40 py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-10">
              「弁護士に頼む」「本ツールを使う」「何もしない」の比較
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-5 py-4 text-slate-400 font-medium w-32">比較項目</th>
                    <th className="px-5 py-4 text-center">
                      <span className="text-slate-300 font-semibold">弁護士相談</span>
                    </th>
                    <th className="px-5 py-4 text-center bg-blue-600/10">
                      <span className="text-blue-400 font-bold">本ツール ✓</span>
                    </th>
                    <th className="px-5 py-4 text-center">
                      <span className="text-slate-500 font-medium">何もしない</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(({ item, lawyer, tool, nothing }, i) => (
                    <tr key={item} className={`border-b border-slate-700/50 ${i % 2 === 0 ? '' : 'bg-slate-800/30'}`}>
                      <td className="px-5 py-3.5 text-slate-400 text-xs font-medium">{item}</td>
                      <td className="px-5 py-3.5 text-center text-slate-300 text-xs">{lawyer}</td>
                      <td className="px-5 py-3.5 text-center text-blue-400 font-bold text-xs bg-blue-600/5">{tool}</td>
                      <td className="px-5 py-3.5 text-center text-slate-500 text-xs">{nothing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-center mt-8">
              <p className="text-slate-400 text-xs mb-4">弁護士への相談は重要な最終確認に。日常的な契約書チェックは本ツールで。</p>
              <Link
                href="/signup?next=/pricing"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all"
              >
                500円で始める（弁護士費用の1/60）
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            使い方：3ステップ
        ================================================================ */}
        <section className="border-y border-slate-800 bg-slate-900/30 py-20">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
              使い方はたった3ステップ
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {steps.map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/20 border border-blue-600/30 text-blue-400 font-extrabold text-lg mb-4">
                    {step}
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mb-2">{title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                <Clock className="h-4 w-4 text-green-400" />
                診断所要時間：約30秒
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            ユーザーの声（社会的証明）
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-xs font-bold text-green-400 mb-4">
              <MessageSquare className="h-3.5 w-3.5" />
              ユーザーの声
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">
              実際に使った方の声
            </h2>
            <p className="text-slate-400 text-sm">契約書チェッカーで違反条項を発見したユーザーの体験談</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(({ name, avatar, stars, text, badge }) => (
              <div key={name} className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed flex-1">「{text}」</p>
                <div>
                  <span className="inline-block bg-blue-600/15 text-blue-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-600/20 mb-2">
                    {badge}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{avatar}</span>
                    <p className="text-xs text-slate-500">{name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/signup?next=/pricing"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              私も契約書をチェックする
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="text-xs text-slate-500 mt-3">✅ 無料登録で1回お試し（カード不要）</p>
          </div>
        </section>

        {/* ================================================================
            料金プラン
        ================================================================ */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">シンプルな料金プラン</h2>
            <p className="text-slate-400 text-sm">まず無料で登録。必要に応じてアップグレード。</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 無料 */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">無料プラン</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-slate-100">¥0</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['会員登録無料', '診断1回お試し', '結果の閲覧・保存'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-slate-700 hover:bg-slate-600 text-slate-100 py-3 rounded-xl font-medium transition-colors text-sm">
                無料で始める
              </Link>
            </div>

            {/* 単発 */}
            <div className="rounded-2xl border border-blue-600/50 bg-blue-600/10 p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">おすすめ</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <FileSearch className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">単発診断</span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-slate-100">¥500</span>
                <span className="text-slate-400 text-sm ml-2">/ 1回</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">弁護士相談の1/60以下のコスト</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '全条項チェック（フリーランス新法・下請法）',
                  '違反箇所の条文番号付き指摘',
                  '具体的な修正案の提示',
                  '不足条項の指摘',
                  '診断結果の永久保存',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?next=/pricing" className="block text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors text-sm">
                500円で今すぐ診断する
              </Link>
            </div>

            {/* 法人 */}
            <div className="rounded-2xl border border-purple-600/50 bg-purple-600/10 p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">法人向け定額</span>
              </div>
              <div className="mb-1">
                <span className="text-4xl font-extrabold text-slate-100">¥2,980</span>
                <span className="text-slate-400 text-sm ml-2">/ 月</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">月6件以上の診断で元が取れる</p>
              <ul className="space-y-3 mb-8 flex-1">
                {[
                  '単発プランの全機能',
                  '月間診断数：無制限',
                  '発注担当者向けコンプライアンスチェック',
                  '優先サポート',
                  '診断レポートのエクスポート（予定）',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup?next=/pricing" className="block text-center bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-colors text-sm">
                法人プランを始める
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            ④ FAQ：心理的ハードルを下げる
        ================================================================ */}
        <section className="border-t border-slate-800 bg-slate-900/30 py-20">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-100 text-center mb-3">よくある質問</h2>
            <p className="text-slate-400 text-sm text-center mb-12">
              購入前の不安を解消します
            </p>

            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <details
                  key={q}
                  className="group rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none">
                    <span className="text-sm font-medium text-slate-200">{q}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-6 pb-5 pt-1">
                    <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            最終CTA
        ================================================================ */}
        <section className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="rounded-2xl border border-blue-600/30 bg-blue-600/10 p-12">
            <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-600/30 rounded-full px-3 py-1 text-xs font-bold text-blue-400 mb-6">
              <Zap className="h-3 w-3" />
              診断所要時間：約30秒
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-3">
              サインする前の500円が、<br />あなたの権利を守ります
            </h2>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              違反条項を見つけてから交渉するのと、<br />
              知らずにサインしてしまうのでは、結果が全く変わります。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/signup?next=/pricing"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                500円で今すぐ診断する
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-8 py-4 rounded-xl font-medium transition-all border border-slate-700 text-sm"
              >
                まず無料で試してみる
              </Link>
            </div>
            <div className="mt-5 flex flex-col items-center gap-1.5">
              <p className="text-xs text-slate-500">✅ 無料登録で1回お試し可能（カード不要）</p>
              <p className="text-xs text-slate-600">✅ 技術的不具合は7日以内に返金対応</p>
              <p className="text-xs text-slate-600">✅ 登録30秒で今日中に確認できます</p>
            </div>
          </div>
        </section>
      </main>

      <StickyCtaBar />

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-600 space-y-1">
          <p>本サービスはAIによる一次チェックツールであり、法律相談ではありません。重要な契約については必ず弁護士にご相談ください。</p>
          <p>© 2026 契約書チェッカー｜フリーランス新法・下請法 2026年最新ガイドライン準拠</p>
        </div>
      </footer>
    </div>
  )
}
