import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_INFO, PRICING_ROWS } from '@/lib/legal-info'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記｜ワークシールド',
  description: 'ワークシールド（契約書チェッカー）の特定商取引法に基づく表記です。販売価格、支払方法、サービス提供時期、解約と返金の条件を記載しています。',
  robots: { index: true, follow: true },
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[13rem_1fr] border-b border-slate-200 last:border-0">
      <dt className="bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-700">{label}</dt>
      <dd className="px-5 py-4 text-sm text-slate-600 leading-relaxed">{children}</dd>
    </div>
  )
}

// 運営責任者が空のまま公開されるのを防ぐ。空ならビルドを落とす。
if (!LEGAL_INFO.operator) {
  throw new Error('lib/legal-info.ts の operator（運営責任者の氏名）が未設定です。特定商取引法上、実名の記載が必要です。')
}

export default function LegalPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Link href="/" className="text-sm text-blue-600 hover:underline">← トップに戻る</Link>
        <h1 className="mt-5 text-2xl font-extrabold text-slate-900">特定商取引法に基づく表記</h1>

        <dl className="mt-8 rounded-2xl border border-slate-200 overflow-hidden">
          <Row label="販売事業者">{LEGAL_INFO.seller}</Row>
          <Row label="運営責任者">{LEGAL_INFO.operator}</Row>
          <Row label="所在地">
            {LEGAL_INFO.addressOnRequest
              ? '請求があり次第、遅滞なく開示いたします。下記メールアドレスまでご連絡ください。'
              : ''}
          </Row>
          <Row label="電話番号">
            {LEGAL_INFO.phoneOnRequest
              ? '請求があり次第、遅滞なく開示いたします。下記メールアドレスまでご連絡ください。'
              : ''}
          </Row>
          <Row label="メールアドレス">{LEGAL_INFO.email}</Row>
          <Row label="販売URL">{LEGAL_INFO.siteUrl}</Row>

          <Row label="販売価格">
            <table className="w-full text-sm">
              <tbody>
                {PRICING_ROWS.map(r => (
                  <tr key={r.plan} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 font-medium text-slate-700">{r.plan}</td>
                    <td className="py-2 pr-4">{r.price}</td>
                    <td className="py-2 text-slate-500">{r.billing}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-slate-500">表示価格はすべて消費税込みです。</p>
          </Row>

          <Row label="商品代金以外の必要料金">
            インターネット接続に必要な通信費はお客様のご負担となります。
          </Row>
          <Row label="支払方法">
            クレジットカード決済（Visa／Mastercard／American Express／JCB）。
            決済は Stripe, Inc. の決済システムを利用しており、カード情報は当社サーバーに保存されません。
          </Row>
          <Row label="支払時期">
            単発プランはご購入時に即時決済されます。定額プランは初回購入時および毎月の更新日に自動決済されます。
          </Row>
          <Row label="サービスの提供時期">
            決済完了後、ただちにご利用いただけます。オンラインサービスのため物品の発送はありません。
          </Row>
          <Row label="役務の内容">
            アップロードされた契約書（PDF・画像・テキスト）をAIが解析し、フリーランス新法および下請法に照らして
            違反の疑いがある条項を検出し、根拠条文と修正案を含む診断結果を提供するクラウドサービスです。
            <span className="mt-2 block rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-900">
              本サービスは法律相談ではなく、AIによる参考情報の提供です。法的な判断が必要な場合は弁護士等の専門家にご相談ください。
            </span>
          </Row>
          <Row label="返品・返金について">
            デジタルサービスの性質上、ご利用開始後の返金は原則としてお受けできません。
            ただし、システム障害により診断が完了しなかった場合、および決済が重複した場合は返金いたします。
            上記メールアドレスまでご連絡ください。
          </Row>
          <Row label="定額プランの解約">
            マイページからいつでも解約できます。解約後は現在の契約期間の末日までご利用いただけます。日割りでの返金は行っておりません。
          </Row>
          <Row label="動作環境">
            Google Chrome / Safari / Microsoft Edge / Firefox の各最新版。インターネット接続が必要です。
          </Row>
        </dl>
      </div>
    </main>
  )
}
