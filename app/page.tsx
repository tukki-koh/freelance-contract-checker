import Link from 'next/link'
import { Shield, FileSearch, CheckCircle, AlertTriangle, ArrowRight, Zap, Building2, User } from 'lucide-react'

const features = [
  {
    icon: FileSearch,
    title: 'PDF・画像・テキスト対応',
    description: '契約書のPDF、スキャン画像、テキストをそのままアップロードするだけ。形式を選ばず即座に分析できます。',
  },
  {
    icon: Shield,
    title: 'フリーランス新法準拠',
    description: '特定受託事業者に係る取引の適正化等に関する法律の全条項に基づいて違反リスクを判定します。',
  },
  {
    icon: AlertTriangle,
    title: '違反箇所を具体的に指摘',
    description: '法律違反の疑いがある箇所を抜粋して表示し、改善案まで提示。契約交渉の根拠として活用できます。',
  },
  {
    icon: CheckCircle,
    title: 'リスクレベル4段階評価',
    description: '低・中・高・重大の4段階でリスクを評価。一目で契約書の安全性が把握できます。',
  },
  {
    icon: Zap,
    title: '最速30秒で分析完了',
    description: 'Claude AIが高速に分析。弁護士に相談する前の一次チェックとして最適です。',
  },
]

const checks = [
  '取引条件の明示義務（第3条）',
  '報酬支払期日60日以内（第4条）',
  '受領拒否・買い叩き等の禁止行為（第5条）',
  '育児・介護等への配慮義務（第13条）',
  'ハラスメント対策義務（第14条）',
  '中途解除30日前予告義務（第16条）',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-100">契約書チェッカー</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/20 rounded-full px-4 py-1.5 text-xs font-medium text-blue-400 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            フリーランス新法（2024年11月施行）対応
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight mb-6">
            契約書の法律違反リスクを<br />
            <span className="text-blue-400">AIが即座に判定</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            フリーランス新法に基づき、契約書のPDF・画像・テキストをアップロードするだけで
            違反リスクを自動チェック。フリーランスの権利を守る一次チェックツールです。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium text-base transition-all shadow-lg shadow-blue-600/20"
            >
              無料で契約書をチェック
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-4 rounded-xl font-medium text-base transition-all border border-slate-700"
            >
              ログインして続ける
            </Link>
          </div>
        </section>

        <section className="border-y border-slate-800 bg-slate-900/50 py-12">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider mb-8">
              チェック対象条項
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {checks.map((check) => (
                <div key={check} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  {check}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-2xl font-bold text-slate-100 text-center mb-12">
            フリーランスの契約リスクを見逃さない
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 hover:border-slate-600 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20 mb-4">
                  <Icon className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-100 mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 料金セクション */}
        <section className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">シンプルな料金プラン</h2>
            <p className="text-slate-400">まずは無料で登録。必要に応じてアップグレード。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* 無料プラン */}
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-8 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-400">無料プラン</span>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-100">¥0</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['会員登録無料', '診断1回お試し', '結果の閲覧・保存'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center bg-slate-700 hover:bg-slate-600 text-slate-100 py-3 rounded-xl font-medium transition-colors">
                無料で始める
              </Link>
            </div>

            {/* 単発プラン */}
            <div className="rounded-2xl border border-blue-600/50 bg-blue-600/10 p-8 flex flex-col relative">
              <div className="flex items-center gap-2 mb-4">
                <FileSearch className="h-5 w-5 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">単発診断</span>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-bold text-slate-100">¥500</span>
                <span className="text-slate-400 text-sm ml-2">/ 1回</span>
              </div>
              <p className="text-xs text-slate-500 mb-6">弁護士相談の1/100以下のコスト</p>
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
              <Link href="/signup?next=/pricing" className="block text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-medium transition-colors">
                500円で診断する
              </Link>
            </div>

            {/* 法人プラン */}
            <div className="rounded-2xl border border-purple-600/50 bg-purple-600/10 p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">人気</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">法人向け定額</span>
              </div>
              <div className="mb-2">
                <span className="text-4xl font-bold text-slate-100">¥2,980</span>
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
              <Link href="/signup?next=/pricing" className="block text-center bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors">
                法人プランを始める
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16 text-center">
          <div className="rounded-2xl border border-blue-600/30 bg-blue-600/10 p-12">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">
              今すぐ契約書をチェックする
            </h2>
            <p className="text-slate-400 text-sm mb-8">
              アカウント登録無料。まずは1回無料でお試しください。
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20"
            >
              無料アカウントを作成
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-xs text-slate-600">
          <p>本サービスは法律相談ではなく、一次チェックツールとして提供しています。重要な契約については必ず弁護士にご相談ください。</p>
        </div>
      </footer>
    </div>
  )
}
