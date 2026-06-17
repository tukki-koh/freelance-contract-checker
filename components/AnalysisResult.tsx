'use client'

import {
  AlertTriangle, CheckCircle, ChevronDown, ChevronUp,
  Info, AlertCircle, Scale, BookOpen, Wrench, PlusCircle
} from 'lucide-react'
import { useState } from 'react'
import type { AnalysisResult, ViolationItem, RiskLevel, ConfidenceLevel, MissingClause } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { RiskBadge } from './ui/Badge'
import { cn } from '@/lib/utils'

interface Props {
  result: AnalysisResult
}

// ── 信頼度バッジ ──────────────────────────────────────────
const confidenceConfig: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: { label: '高信頼', className: 'bg-green-500/15 text-green-400 border border-green-500/30' },
  medium: { label: '要注意', className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30' },
  low: { label: '要確認', className: 'bg-slate-500/20 text-slate-300 border border-slate-500/40' },
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const c = confidenceConfig[level]
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', c.className)}>
      {level === 'low' && <AlertCircle className="h-3 w-3 mr-1" />}
      {c.label}
    </span>
  )
}

// ── 適用法バッジ ──────────────────────────────────────────
const lawLabels: Record<string, string> = {
  freelance_act: 'フリーランス新法',
  subcontract_act: '下請法',
  both: '両法',
}

function LawBadge({ law }: { law: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
      <Scale className="h-3 w-3 mr-1" />
      {lawLabels[law] ?? law}
    </span>
  )
}

// ── 違反ボーダー ──────────────────────────────────────────
const severityBorder: Record<RiskLevel, string> = {
  critical: 'border-red-500/50 bg-red-500/5',
  high: 'border-amber-500/50 bg-amber-500/5',
  medium: 'border-yellow-500/40 bg-yellow-500/5',
  low: 'border-slate-500/30 bg-slate-800/30',
}

const severityIcon: Record<RiskLevel, React.ReactNode> = {
  critical: <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />,
  high: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
  medium: <Info className="h-4 w-4 text-yellow-400 shrink-0" />,
  low: <Info className="h-4 w-4 text-slate-400 shrink-0" />,
}

// ── 個別違反カード ────────────────────────────────────────
function ViolationCard({ item }: { item: ViolationItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('rounded-xl border p-4 space-y-2 transition-all', severityBorder[item.severity])}>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {severityIcon[item.severity]}
          <span className="text-sm font-semibold text-slate-100 leading-tight">{item.article_name}</span>
          <span className="text-xs text-slate-400 font-mono shrink-0">{item.article}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RiskBadge level={item.severity} />
          <ConfidenceBadge level={item.confidence} />
          <LawBadge law={item.law} />
          {open
            ? <ChevronUp className="h-4 w-4 text-slate-400" />
            : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </button>

      {item.requires_review && (
        <div className="flex items-start gap-2 rounded-lg bg-slate-700/50 border border-slate-600/50 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">【要確認】</span>{' '}
            この判定は情報が不足しているか判断が難しいため、弁護士・法律専門家への確認を強く推奨します。
          </p>
        </div>
      )}

      {open && (
        <div className="space-y-4 pt-3 border-t border-slate-700/40">
          {/* 問題点 */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">問題点</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
          </div>

          {/* 該当箇所 */}
          {item.excerpt && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">契約書該当箇所</p>
              </div>
              <blockquote className="text-sm text-slate-300 italic bg-slate-900/60 border-l-2 border-slate-500 pl-3 py-2 rounded-r-lg">
                {item.excerpt}
              </blockquote>
            </div>
          )}

          {/* 根拠条文 */}
          {item.legal_basis && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Scale className="h-3.5 w-3.5 text-blue-400" />
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide">根拠条文</p>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed bg-blue-500/5 border border-blue-500/20 rounded-lg px-3 py-2">
                {item.legal_basis}
              </p>
            </div>
          )}

          {/* 修正案 */}
          {item.correction && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Wrench className="h-3.5 w-3.5 text-green-400" />
                <p className="text-xs font-semibold text-green-400 uppercase tracking-wide">修正案</p>
              </div>
              <div className="text-sm text-green-300 leading-relaxed bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">
                {item.correction}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── 不足条項カード ────────────────────────────────────────
function MissingClauseCard({ item }: { item: MissingClause }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-slate-600/40 bg-slate-800/30 p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex flex-wrap items-center gap-2">
          <PlusCircle className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-200">{item.article_name}</span>
          <span className="text-xs text-slate-500 font-mono">{item.article}</span>
          <LawBadge law={item.law} />
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
          : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />}
      </button>

      {open && (
        <div className="space-y-3 pt-3 border-t border-slate-700/40 mt-2">
          <p className="text-sm text-slate-300 leading-relaxed">{item.description}</p>
          {item.suggested_clause && (
            <div>
              <p className="text-xs font-semibold text-green-400 mb-1.5">追加条文の文例</p>
              <div className="text-sm text-green-300 leading-relaxed bg-green-500/5 border border-green-500/20 rounded-lg px-3 py-2 font-mono whitespace-pre-wrap">
                {item.suggested_clause}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── メインコンポーネント ──────────────────────────────────
export function AnalysisResultView({ result }: Props) {
  const highConfidenceViolations = result.violations.filter(v => v.confidence === 'high')
  const reviewRequiredViolations = result.violations.filter(v => v.requires_review)

  return (
    <div className="space-y-6">
      {/* サマリーカード */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-400" />
              総合リスク判定
            </CardTitle>
            <div className="flex items-center gap-2">
              {result.applicable_laws?.map(law => (
                <LawBadge key={law} law={law} />
              ))}
              <RiskBadge level={result.risk_level} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>

          {/* 統計 */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-center">
              <p className="text-lg font-bold text-slate-100">{result.violations.length}</p>
              <p className="text-xs text-slate-500">違反・リスク検出</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-center">
              <p className="text-lg font-bold text-green-400">{highConfidenceViolations.length}</p>
              <p className="text-xs text-slate-500">高信頼度判定</p>
            </div>
            <div className="rounded-lg bg-slate-900/60 px-3 py-2 text-center">
              <p className="text-lg font-bold text-slate-400">{reviewRequiredViolations.length}</p>
              <p className="text-xs text-slate-500">要確認項目</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 要確認バナー */}
      {reviewRequiredViolations.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-slate-600/50 bg-slate-800/50 px-5 py-4">
          <AlertCircle className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-200 mb-1">
              【要確認】{reviewRequiredViolations.length}件の項目があります
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              AIの判定信頼度が低い項目が含まれています。これらの項目については、
              弁護士・法律専門家にご確認いただくことを強く推奨します。
              本分析はAIによる一次チェックであり、法律的な判断を保証するものではありません。
            </p>
          </div>
        </div>
      )}

      {/* 違反・リスク一覧 */}
      {result.violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              違反・リスク検出 ({result.violations.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.violations.map((v, i) => (
              <ViolationCard key={i} item={v} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 不足条項 */}
      {result.missing_clauses && result.missing_clauses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-slate-400" />
              不足条項 ({result.missing_clauses.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-slate-500 mb-3">
              法律上必要ですが、契約書に記載が見当たらない条項です。追加を検討してください。
            </p>
            {result.missing_clauses.map((m, i) => (
              <MissingClauseCard key={i} item={m} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* 適法な点 */}
      {result.compliant_points && result.compliant_points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              適法な点 ({result.compliant_points.length}件)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.compliant_points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  {point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 推奨事項 */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-300">推奨事項・次のアクション</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {result.recommendation}
          </p>
        </CardContent>
      </Card>

      {/* 免責事項 */}
      <div className="rounded-xl border border-slate-700/30 bg-slate-900/40 px-5 py-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-400">免責事項：</span>
          {result.disclaimer}
        </p>
      </div>
    </div>
  )
}
