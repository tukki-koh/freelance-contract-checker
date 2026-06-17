import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { FileSearch, History, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { RiskBadge } from '@/components/ui/Badge'
import type { ContractAnalysis } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: analyses } = await supabase
    .from('contract_analyses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const { count: totalCount } = await supabase
    .from('contract_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: criticalCount } = await supabase
    .from('contract_analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('risk_level', ['critical', 'high'])

  const stats = [
    { label: '総チェック数', value: totalCount ?? 0, icon: FileSearch, color: 'text-blue-400' },
    { label: '要注意契約', value: criticalCount ?? 0, icon: AlertTriangle, color: 'text-amber-400' },
    { label: '安全な契約', value: Math.max(0, (totalCount ?? 0) - (criticalCount ?? 0)), icon: CheckCircle, color: 'text-green-400' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">ダッシュボード</h1>
        <p className="text-sm text-slate-400 mt-1">{user.email}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} variant="elevated">
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700">
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Link
          href="/check"
          className="group rounded-xl border border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 p-6 transition-all"
        >
          <FileSearch className="h-8 w-8 text-blue-400 mb-3" />
          <h3 className="font-semibold text-slate-100 mb-1">契約書をチェックする</h3>
          <p className="text-sm text-slate-400">PDF・画像・テキストをアップロードして即座に法律違反リスクを判定</p>
        </Link>
        <Link
          href="/history"
          className="group rounded-xl border border-slate-700/50 bg-slate-800/50 hover:border-slate-600 p-6 transition-all"
        >
          <History className="h-8 w-8 text-slate-400 mb-3" />
          <h3 className="font-semibold text-slate-100 mb-1">分析履歴を見る</h3>
          <p className="text-sm text-slate-400">過去にチェックした契約書の結果を確認</p>
        </Link>
      </div>

      {analyses && analyses.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-slate-400" />
                最近の分析
              </CardTitle>
              <Link href="/history" className="text-xs text-blue-400 hover:text-blue-300">
                すべて見る →
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {(analyses as ContractAnalysis[]).map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-t border-slate-700/50 first:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{a.file_name}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(a.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <RiskBadge level={a.risk_level} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
