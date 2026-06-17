'use client'

import { FileText, Calendar } from 'lucide-react'
import type { ContractAnalysis } from '@/types'
import { RiskBadge } from './ui/Badge'
import { Card } from './ui/Card'

interface Props {
  analyses: ContractAnalysis[]
  onSelect?: (analysis: ContractAnalysis) => void
}

export function ContractHistory({ analyses, onSelect }: Props) {
  if (analyses.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="mx-auto h-10 w-10 text-slate-600 mb-3" />
        <p className="text-slate-400 text-sm">分析履歴がありません</p>
        <p className="text-slate-500 text-xs mt-1">契約書チェックを実行すると履歴が表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {analyses.map((analysis) => (
        <Card
          key={analysis.id}
          className={`transition-all duration-200 ${onSelect ? 'cursor-pointer hover:border-slate-500' : ''}`}
          onClick={() => onSelect?.(analysis)}
        >
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700 shrink-0">
              <FileText className="h-5 w-5 text-slate-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 truncate">{analysis.file_name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span className="text-xs text-slate-500">
                  {new Date(analysis.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <RiskBadge level={analysis.risk_level} />
          </div>
        </Card>
      ))}
    </div>
  )
}
