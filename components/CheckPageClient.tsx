'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileSearch, Lock, Zap, Building2, CreditCard } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { AnalysisResultView } from './AnalysisResult'
import type { AnalysisResult, AccessStatus, UserSubscription } from '@/types'
import { cn } from '@/lib/utils'

interface Props {
  access: AccessStatus
  sub: UserSubscription | null
}

// ── ペイウォール（未購入ユーザーへの案内）────────────────────
function Paywall({ reason }: { reason: string }) {
  const messages: Record<string, { title: string; desc: string }> = {
    no_subscription: {
      title: 'プランを購入して診断を開始',
      desc: 'フリーランス新法・下請法に基づく契約書の違反リスク診断を利用するには、プランの購入が必要です。',
    },
    no_credits: {
      title: '診断クレジットが不足しています',
      desc: '単発診断プランのクレジットを使い切りました。追加購入するか、法人プランへのアップグレードをご検討ください。',
    },
    expired: {
      title: 'プランの有効期限が切れています',
      desc: '法人向け定額プランの有効期限が終了しました。継続してご利用の場合は再度お申し込みください。',
    },
    pending: {
      title: '決済処理中です',
      desc: '決済の反映には数秒〜1分程度かかる場合があります。しばらくしてからページを再読み込みしてください。',
    },
  }

  const msg = messages[reason] ?? messages.no_subscription

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-10 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-700 mb-5">
        <Lock className="h-6 w-6 text-slate-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-100 mb-2">{msg.title}</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-sm mx-auto leading-relaxed">{msg.desc}</p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/pricing"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium text-sm transition-all"
        >
          <CreditCard className="h-4 w-4" />
          プランを選ぶ
        </Link>
        {reason === 'pending' && (
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-6 py-3 rounded-xl font-medium text-sm transition-all border border-slate-600"
          >
            再読み込み
          </button>
        )}
      </div>

      {/* プランの簡易比較 */}
      <div className="mt-10 grid sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto">
        <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-semibold text-slate-100">単発診断</span>
            <span className="text-xs text-slate-400 ml-auto">¥300</span>
          </div>
          <p className="text-xs text-slate-400">1回の診断クレジット。まずはお試しに。</p>
        </div>
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-semibold text-slate-100">定額使い放題</span>
            <span className="text-xs text-slate-400 ml-auto">¥980/月</span>
          </div>
          <p className="text-xs text-slate-400">月間無制限。人気AIの約1/3で使い放題。</p>
        </div>
      </div>
    </div>
  )
}

// ── メインクライアントコンポーネント ──────────────────────────
export function CheckPageClient({ access, sub }: Props) {
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [creditsLeft, setCreditsLeft] = useState<number | undefined>(
    access.allowed && access.planType === 'single' ? access.creditsRemaining : undefined
  )

  const handleAnalyze = async (file: File | null, text: string) => {
    setLoading(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    if (file) formData.append('file', file)
    else formData.append('text', text)

    const response = await fetch('/api/analyze', { method: 'POST', body: formData })
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 402) {
        // 支払い必要 → ページをリロードしてガードを再評価
        window.location.href = '/pricing'
        return
      }
      setError(data.error ?? '分析に失敗しました。再度お試しください。')
      setLoading(false)
      return
    }

    setResult(data.analysis)
    if (data.creditsRemaining !== undefined) setCreditsLeft(data.creditsRemaining)
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* ヘッダー */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileSearch className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-slate-100">契約書チェック</h1>
          </div>

          {/* プランバッジ */}
          {access.allowed && (
            <div className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium border',
              access.planType === 'corporate'
                ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                : 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
            )}>
              {access.planType === 'corporate'
                ? <><Building2 className="h-3.5 w-3.5" /> 法人定額プラン</>
                : <><Zap className="h-3.5 w-3.5" /> 残り {creditsLeft} 回</>}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-400">
          フリーランス新法・下請法に基づき、契約書の違反リスクをAIが判定します
        </p>
      </div>

      {/* ペイウォール or 診断フォーム */}
      {!access.allowed ? (
        <Paywall reason={access.reason} />
      ) : (
        <>
          {/* クレジット警告 */}
          {access.planType === 'single' && creditsLeft === 0 && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm text-amber-300 flex items-center justify-between">
              <span>診断クレジットを使い切りました</span>
              <Link href="/pricing" className="text-xs underline hover:text-amber-200">追加購入する</Link>
            </div>
          )}

          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 mb-6">
            <FileUpload
              onAnalyze={handleAnalyze}
              loading={loading}
              disabled={access.planType === 'single' && (creditsLeft ?? 0) === 0}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-sm text-red-400 mb-6">
              {error}
            </div>
          )}

          {loading && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-12 text-center mb-6">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
              <p className="text-slate-300 font-medium">Claude AIが契約書を分析中...</p>
              <p className="text-slate-500 text-sm mt-1">フリーランス新法・下請法の全条項をチェックしています</p>
            </div>
          )}

          {result && <AnalysisResultView result={result} />}
        </>
      )}
    </div>
  )
}
