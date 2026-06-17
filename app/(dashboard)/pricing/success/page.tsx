import Link from 'next/link'
import { CheckCircle2, ArrowRight, Zap, Building2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; session_id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const planType = params.plan as 'single' | 'corporate' | undefined

  const planMessages = {
    single: {
      title: '単発診断プランのご購入ありがとうございます',
      description: '1回分の診断クレジットが付与されました。さっそく契約書を診断してみましょう。',
      icon: <Zap className="h-8 w-8 text-yellow-400" />,
      cta: '契約書を診断する',
      href: '/check',
    },
    corporate: {
      title: '法人向け定額プランへご登録ありがとうございます',
      description: '月間無制限で契約書を診断できます。決済完了の反映には数秒かかる場合があります。',
      icon: <Building2 className="h-8 w-8 text-blue-400" />,
      cta: '契約書を診断する',
      href: '/check',
    },
  }

  const msg = planType ? planMessages[planType] : {
    title: 'ご購入ありがとうございます',
    description: '決済が完了しました。',
    icon: <CheckCircle2 className="h-8 w-8 text-green-400" />,
    cta: 'ダッシュボードへ',
    href: '/dashboard',
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 mb-6">
          {msg.icon}
        </div>

        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-500/15 border border-green-500/30 px-3 py-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
          <span className="text-xs font-medium text-green-400">決済完了</span>
        </div>

        <h1 className="text-xl font-bold text-slate-100 mt-3 mb-3">
          {msg.title}
        </h1>
        <p className="text-sm text-slate-400 mb-8 leading-relaxed">
          {msg.description}
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={msg.href}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all"
          >
            {msg.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/pricing"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            プラン詳細を確認する
          </Link>
        </div>
      </div>
    </div>
  )
}
