'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Shield, Lock, AlertTriangle, Scale, Wrench, BookOpen, PlusCircle, ArrowRight, CheckCircle,
} from 'lucide-react'
import { FileUpload } from './FileUpload'
import { RiskBadge } from './ui/Badge'
import type { TrialResult } from '@/types'

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

const lawLabels: Record<string, string> = {
  freelance_act: 'フリーランス新法',
  subcontract_act: '下請法',
  both: '両法',
}

function UnlockCta({ lockedCount }: { lockedCount: number }) {
  return (
    <div className="rounded-2xl border border-blue-500/40 bg-gradient-to-br from-blue-600/15 to-indigo-600/10 p-6 text-center">
      <p className="text-base font-bold text-slate-100 mb-1">
        {lockedCount > 0
          ? `残り${lockedCount}件の指摘と修正案を見る`
          : 'この契約書の修正案をすべて確認する'}
      </p>
      <p className="text-sm text-slate-400 mb-5">
        登録して単発プラン（300円）で本診断すると、全項目の問題点・根拠条文・そのまま使える修正案が見られます。
      </p>
      <Link
        href="/signup?next=/pricing"
        onClick={() => window.gtag?.('event', 'trial_unlock_click', { locked: lockedCount })}
        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-7 py-3 rounded-xl font-bold text-sm transition-all"
      >
        300円で全件を見る <ArrowRight className="h-4 w-4" />
      </Link>
      <p className="text-xs text-slate-500 mt-3">月980円の使い放題プランもあります</p>
    </div>
  )
}

function TrialResultView({ trial }: { trial: TrialResult }) {
  const v = trial.first_violation
  const lockedCount = trial.locked_violations.length + trial.locked_missing.length

  return (
    <div className="space-y-5">
      {/* 総合判定 */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-6">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
          <p className="flex items-center gap-2 text-base font-bold text-slate-100">
            <Scale className="h-5 w-5 text-blue-400" />総合リスク判定
          </p>
          <div className="flex items-center gap-2">
            {trial.applicable_laws.map(l => (
              <span key={l} className="text-xs px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">{lawLabels[l] ?? l}</span>
            ))}
            <RiskBadge level={trial.risk_level} />
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">{trial.summary}</p>
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-center">
            <p className="text-lg font-bold text-slate-100">{trial.violation_count}</p>
            <p className="text-xs text-slate-500">違反・リスク検出</p>
          </div>
          <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-center">
            <p className="text-lg font-bold text-slate-100">{trial.missing_count}</p>
            <p className="text-xs text-slate-500">不足している条項</p>
          </div>
        </div>
      </div>

      {/* 1件目は全文公開 */}
      {v ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-slate-100">{v.article_name}</span>
            <span className="text-xs text-slate-400 font-mono">{v.article}</span>
            <RiskBadge level={v.severity} />
            <span className="text-xs text-emerald-400 ml-auto">無料で全文公開</span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{v.description}</p>
          {v.excerpt && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5"><BookOpen className="h-3.5 w-3.5" />契約書の該当箇所</p>
              <blockquote className="text-sm text-slate-300 italic bg-slate-900/60 border-l-2 border-slate-500 pl-3 py-2 rounded-r-lg">{v.excerpt}</blockquote>
            </div>
          )}
          {v.legal_basis && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-1.5"><Scale className="h-3.5 w-3.5" />根拠条文</p>
              <p className="text-xs text-slate-400 leading-relaxed bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">{v.legal_basis}</p>
            </div>
          )}
          {v.correction && (
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-green-400 mb-1.5"><Wrench className="h-3.5 w-3.5" />修正案</p>
              <div className="text-sm text-green-300 leading-relaxed bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">{v.correction}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-6 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">明確な違反条項は見つかりませんでした。{trial.missing_count > 0 && `ただし、法律上入れておくべき条項が${trial.missing_count}件不足しています。`}</p>
        </div>
      )}

      {/* 残りは項目名のみ */}
      {lockedCount > 0 && (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6">
          <p className="text-sm font-bold text-slate-200 mb-3">ほかにも見つかった項目（{lockedCount}件）</p>
          <ul className="space-y-2">
            {trial.locked_violations.map((l, i) => (
              <li key={`v${i}`} className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="text-sm text-slate-300">{l.article_name}</span>
                <span className="text-xs text-slate-500 font-mono">{l.article}</span>
                <span className="ml-auto"><RiskBadge level={l.severity} /></span>
              </li>
            ))}
            {trial.locked_missing.map((m, i) => (
              <li key={`m${i}`} className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <PlusCircle className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span className="text-sm text-slate-300">不足：{m.article_name}</span>
                <span className="text-xs text-slate-500 font-mono">{m.article}</span>
                <Lock className="h-3.5 w-3.5 text-slate-500 ml-auto" />
              </li>
            ))}
          </ul>
        </div>
      )}

      <UnlockCta lockedCount={lockedCount} />

      <p className="text-xs text-slate-500 leading-relaxed">
        <span className="font-semibold text-slate-400">免責事項：</span>{trial.disclaimer}
      </p>
    </div>
  )
}

export function TryPageClient() {
  const [trial, setTrial] = useState<TrialResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limited, setLimited] = useState(false)

  const handleAnalyze = async (file: File | null, text: string) => {
    setLoading(true)
    setError('')
    setTrial(null)
    window.gtag?.('event', 'trial_start')

    const formData = new FormData()
    if (file) formData.append('file', file)
    else formData.append('text', text)

    try {
      const res = await fetch('/api/try', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '診断に失敗しました。もう一度お試しください。')
        if (res.status === 429) setLimited(true)
        return
      }
      setTrial(data.trial)
      window.gtag?.('event', 'trial_complete', { risk: data.trial.risk_level, violations: data.trial.violation_count })
    } catch {
      setError('通信に失敗しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600"><Shield className="h-4 w-4 text-white" /></span>
          <span className="text-sm font-bold text-slate-100">契約書チェッカー <span className="text-xs text-slate-500 font-normal">by ワークシールド</span></span>
        </Link>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mb-2">契約書を、無料で1回診断</h1>
        <p className="text-sm text-slate-400 mb-6">
          登録もクレジットカードも不要です。業務委託契約書を貼り付けるか、PDF・画像をアップロードしてください。
          フリーランス新法・下請法に照らして、問題のある条項を条文番号つきで指摘します。
        </p>

        {!trial && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-6 mb-6">
            <FileUpload onAnalyze={handleAnalyze} loading={loading} disabled={limited} />
            <p className="text-xs text-slate-500 mt-3">入力した契約書の本文は保存しません（診断件数などの統計のみ記録します）。</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-5 py-4 text-sm text-red-300 mb-6">
            {error}
            {limited && (
              <Link href="/signup?next=/pricing" className="block mt-2 text-blue-300 underline">登録して300円で本診断する</Link>
            )}
          </div>
        )}

        {loading && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-800/50 p-12 text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-4" />
            <p className="text-slate-300 font-medium">AIが契約書を読んでいます…</p>
            <p className="text-slate-500 text-sm mt-1">1〜2分ほどかかります。このままお待ちください</p>
          </div>
        )}

        {trial && <TrialResultView trial={trial} />}
      </div>
    </div>
  )
}
