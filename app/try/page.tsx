import type { Metadata } from 'next'
import { TryPageClient } from '@/components/TryPageClient'

export const metadata: Metadata = {
  title: '登録不要・無料で契約書を1回診断 | 契約書チェッカー（ワークシールド）',
  description: '業務委託契約書を貼り付けるだけで、フリーランス新法・下請法の違反リスクをAIが条文番号付きで指摘。登録不要・クレジットカード不要で1回無料。',
}

export default function TryPage() {
  return <TryPageClient />
}
