'use client'

import { useEffect, useState } from 'react'
import { History } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ContractHistory } from '@/components/ContractHistory'
import { AnalysisResultView } from '@/components/AnalysisResult'
import type { ContractAnalysis } from '@/types'
import { Button } from '@/components/ui/Button'

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<ContractAnalysis[]>([])
  const [selected, setSelected] = useState<ContractAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyses = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('contract_analyses')
        .select('*')
        .order('created_at', { ascending: false })

      setAnalyses((data as ContractAnalysis[]) ?? [])
      setLoading(false)
    }

    fetchAnalyses()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <History className="h-6 w-6 text-slate-400" />
          <h1 className="text-2xl font-bold text-slate-100">分析履歴</h1>
        </div>
        <p className="text-sm text-slate-400">過去にチェックした契約書の結果一覧</p>
      </div>

      {selected ? (
        <div>
          <div className="mb-6 flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
              ← 履歴一覧に戻る
            </Button>
            <div>
              <p className="text-sm font-medium text-slate-200">{selected.file_name}</p>
              <p className="text-xs text-slate-500">
                {new Date(selected.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          <AnalysisResultView result={selected.analysis_result} />
        </div>
      ) : (
        <>
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mb-3" />
              <p className="text-slate-400 text-sm">読み込み中...</p>
            </div>
          ) : (
            <ContractHistory analyses={analyses} onSelect={setSelected} />
          )}
        </>
      )}
    </div>
  )
}
