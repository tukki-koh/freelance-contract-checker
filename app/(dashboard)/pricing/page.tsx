import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PLANS } from '@/lib/stripe'
import { checkAccess } from '@/lib/stripe'
import type { UserSubscription } from '@/types'
import { PricingCards } from '@/components/PricingCards'
import { CreditCard, CheckCircle2, Zap } from 'lucide-react'

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const cancelled = params.cancelled === 'true'

  const { data: subData } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const sub = subData as UserSubscription | null
  const access = checkAccess(sub)

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-slate-100">プラン・料金</h1>
        </div>
        <p className="text-sm text-slate-400">
          必要な分だけ使える単発プランと、法人向けの定額プランをご用意しています
        </p>
      </div>

      {cancelled && (
        <div className="mb-6 rounded-xl border border-slate-600/50 bg-slate-800/50 px-5 py-4 text-sm text-slate-400">
          決済がキャンセルされました。プランを選択し直してください。
        </div>
      )}

      {/* 現在のプラン表示 */}
      {access.allowed && (
        <div className="mb-8 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <p className="text-sm font-semibold text-slate-100">
              {sub?.plan_type === 'corporate' ? '法人向け定額プラン' : '単発診断プラン'} 利用中
            </p>
          </div>
          {sub?.plan_type === 'single' && (
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Zap className="h-3 w-3 text-yellow-400" />
              残り診断クレジット：
              <span className="text-yellow-400 font-bold">{sub.credits_remaining} 回</span>
            </p>
          )}
          {sub?.plan_type === 'corporate' && sub.current_period_end && (
            <p className="text-xs text-slate-400">
              次回更新日：{new Date(sub.current_period_end).toLocaleDateString('ja-JP')}
            </p>
          )}
        </div>
      )}

      <PricingCards plans={[PLANS.single, PLANS.corporate]} currentSub={sub} />

      <p className="mt-8 text-center text-xs text-slate-500">
        決済は Stripe により安全に処理されます。クレジットカード情報は当サービスには保存されません。
      </p>
    </div>
  )
}
