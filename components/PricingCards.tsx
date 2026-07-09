'use client'

import { useState } from 'react'
import { CheckCircle, Zap, Building2, Loader2 } from 'lucide-react'
import type { PlanConfig, UserSubscription } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from './ui/Button'

interface Props {
  plans: PlanConfig[]
  currentSub: UserSubscription | null
}

export function PricingCards({ plans, currentSub }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handlePurchase = async (planId: string) => {
    setLoadingPlan(planId)
    setError('')

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType: planId }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error ?? '決済ページの取得に失敗しました。再度お試しください。')
        setLoadingPlan(null)
        return
      }

      window.location.href = data.url
    } catch {
      setError('通信エラーが発生しました。再度お試しください。')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentSub?.plan_type === plan.id && currentSub?.status === 'active'
          const isCorporate = plan.id === 'corporate'

          return (
            <div
              key={plan.id}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col',
                isCorporate
                  ? 'border-blue-500/50 bg-blue-500/5'
                  : 'border-slate-700/50 bg-slate-800/50'
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-xl mb-3',
                  isCorporate ? 'bg-blue-600/20' : 'bg-slate-700'
                )}>
                  {isCorporate
                    ? <Building2 className="h-5 w-5 text-blue-400" />
                    : <Zap className="h-5 w-5 text-slate-300" />}
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-100">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400">
                    {plan.interval === 'month' ? '/ 月' : '/ 回'}
                  </span>
                </div>
                {plan.interval === 'month' && (
                  <p className="text-xs text-slate-500 mt-0.5">税込表示（消費税は別途）</p>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <CheckCircle className={cn(
                      'h-4 w-4 shrink-0 mt-0.5',
                      isCorporate ? 'text-blue-400' : 'text-green-400'
                    )} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-green-400 border border-green-500/30 bg-green-500/10">
                  ✓ 現在のプラン
                </div>
              ) : (
                <Button
                  onClick={() => handlePurchase(plan.id)}
                  loading={loadingPlan === plan.id}
                  disabled={!!loadingPlan}
                  variant={isCorporate ? 'primary' : 'secondary'}
                  size="md"
                  className="w-full"
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      決済ページへ移動中...
                    </>
                  ) : plan.id === 'single' ? (
                    `${plan.price}円で購入する`
                  ) : (
                    `月額${plan.price.toLocaleString()}円で申し込む`
                  )}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
