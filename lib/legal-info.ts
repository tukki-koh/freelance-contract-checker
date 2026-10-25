// 特定商取引法に基づく表記で使う運営者情報。
// 法律上、実在の情報でなければならないため、ここは必ず本物を入れる。
export const LEGAL_INFO = {
  seller: 'ワークシールド',
  // 運営責任者は実名が必要。未記入のまま公開しないこと（/legal がビルド時に警告する）。
  operator: '月足 昂誠',
  // 所在地・電話番号は、請求があり次第すみやかに開示する方針。
  // 実際に請求が来たら必ず開示すること。
  addressOnRequest: true,
  phoneOnRequest: true,
  email: 'yuezuangcheng@gmail.com',
  siteUrl: 'https://freelance-contract-checker.vercel.app',
} as const

export const PRICING_ROWS = [
  { plan: '単発診断プラン', price: '300円（税込）', billing: '1回限り' },
  { plan: '定額使い放題プラン', price: '2,980円／月（税込）', billing: '月額（自動更新）' },
]
