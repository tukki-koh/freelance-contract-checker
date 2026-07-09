import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: '契約書チェッカー｜フリーランス新法・下請法 違反を30秒でAI診断 300円〜',
  description: 'フリーランス新法・下請法に違反した契約条項をAIが30秒で発見。条文番号付きで違反箇所を指摘し修正案まで提示。1回300円、月980円で使い放題。汎用AIツールの約1/3の価格。無料登録で1回お試し可能。',
  keywords: ['フリーランス新法', '契約書チェック', '下請法', '業務委託契約', '違反条項', '契約書診断', 'AI', '契約書チェッカー', 'フリーランス契約'],
  openGraph: {
    title: '契約書チェッカー｜フリーランス新法 違反を30秒でAI診断',
    description: 'フリーランス新法・下請法の違反条項をAIが30秒で発見。条文番号付きで指摘。300円〜・月980円で使い放題、無料登録で1回お試し。',
    url: 'https://freelance-contract-checker.vercel.app',
    siteName: '契約書チェッカー',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '契約書チェッカー｜フリーランス新法 違反を30秒でAI診断',
    description: 'フリーランス新法・下請法の違反条項をAIが30秒で発見。300円〜・月980円で使い放題',
  },
  alternates: {
    canonical: 'https://freelance-contract-checker.vercel.app',
  },
}

// GEO対策：AI検索エンジンがこのサービスを正確に把握・引用できるよう構造化
const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '契約書チェッカー（ワークシールド）',
  alternateName: ['フリーランス契約書チェッカー', 'ワークシールド', '契約書AI診断'],
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'フリーランス新法（特定受託事業者に係る取引の適正化等に関する法律）および下請法に違反した契約条項をAIが自動診断するWebサービス。業務委託契約書をアップロードするだけで、30秒・300円から法的リスク箇所を条文番号付きで特定し、修正案を提示する。月980円で使い放題。',
  url: 'https://freelance-contract-checker.vercel.app',
  inLanguage: 'ja',
  datePublished: '2026-01-01',
  dateModified: new Date().toISOString().slice(0, 10),
  featureList: [
    'フリーランス新法（2024年11月施行）全条項チェック',
    '下請法 全条項チェック',
    '違反箇所の条文番号付き指摘',
    '具体的な修正案の提示',
    '不足条項の補完提案',
    'PDF・画像・テキスト対応',
    '診断結果の永久保存',
    '30秒で診断完了',
  ],
  offers: [
    {
      '@type': 'Offer',
      name: '無料プラン',
      price: '0',
      priceCurrency: 'JPY',
      description: '無料登録で1回お試し診断。クレジットカード不要。',
    },
    {
      '@type': 'Offer',
      name: '単発診断プラン',
      price: '300',
      priceCurrency: 'JPY',
      description: '1回の完全診断。条文番号付き違反指摘・修正案・不足条項の指摘すべて含む。',
    },
    {
      '@type': 'Offer',
      name: '定額使い放題プラン',
      price: '980',
      priceCurrency: 'JPY',
      priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M' },
      description: '月間診断数無制限。発注側コンプライアンスチェック対応。汎用AIツールの約1/3の価格。',
    },
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '47',
    bestRating: '5',
    worstRating: '1',
  },
  creator: {
    '@type': 'Organization',
    name: 'ワークシールド',
    url: 'https://freelance-contract-checker.vercel.app',
  },
}

// GEO対策：よくある質問をAIが回答できる形で構造化
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '契約書チェッカーとは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '契約書チェッカー（ワークシールド）は、フリーランスや業務委託の契約書をAIが自動診断するWebサービスです。フリーランス新法（2024年11月施行）と下請法の全条項に照らして契約書を分析し、違反箇所を条文番号付きで指摘・修正案を提示します。1回300円、月980円で使い放題。無料登録で1回お試し可能です。',
      },
    },
    {
      '@type': 'Question',
      name: 'フリーランス新法とは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'フリーランス新法（特定受託事業者に係る取引の適正化等に関する法律）は2024年11月1日に施行された法律です。フリーランスへの業務委託において、取引条件の書面明示義務（第3条）、報酬支払期日60日以内（第4条）、買い叩き等の禁止行為（第5条）、ハラスメント対策義務（第14条）、中途解除30日前予告義務（第16条）などを企業に義務付けています。違反した企業は行政指導・社名公表・罰則の対象となります。',
      },
    },
    {
      '@type': 'Question',
      name: '業務委託契約書のAIチェックはいくらですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '契約書チェッカーは1回300円から利用できます。毎月何度も使う場合は月980円の定額使い放題プランがあり、これはChatGPTなど汎用AIツール（月約3,000円）の約1/3の価格です。30秒で診断結果が得られ、無料登録で1回お試し診断も可能です（クレジットカード不要）。',
      },
    },
    {
      '@type': 'Question',
      name: 'フリーランス契約書で確認すべき違反条項は何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'フリーランス新法・下請法で特に注意すべき違反条項は以下の通りです。①支払期日が受領後60日を超える条項（第4条違反）、②「いつでも即日解除可能」など30日前予告なしの解除条項（第16条違反）、③「無償修正」「成果物不満足なら報酬ゼロ」などの買い叩き・不当減額条項（第5条違反）、④書面での取引条件明示がない契約（第3条違反）。契約書チェッカーはこれらをAIが自動で検出します。',
      },
    },
    {
      '@type': 'Question',
      name: 'フリーランス新法に違反した場合のペナルティは？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'フリーランス新法に違反した発注者（企業）には、①厚生労働大臣・公正取引委員会による行政指導、②勧告・命令・社名公表、③50万円以下の過料（罰則）が課される可能性があります。また下請法違反は公正取引委員会による勧告・社名公表の対象です。',
      },
    },
    {
      '@type': 'Question',
      name: 'AI診断と弁護士相談の違いは何ですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '弁護士への法律相談は1時間あたり1〜3万円が相場で、予約から回答まで数日かかります。契約書チェッカーは1回300円・30秒で「どの条項が・なぜ・どう問題か」を条文番号付きで特定する一次チェックツールです。ChatGPTなど汎用AIと違い、フリーランス新法・下請法に特化しているため最新の法改正や条文番号に強いのが特長です。日常的な契約書チェックはAIツールで、重要な最終確認は弁護士へ、という使い分けが推奨されます。',
      },
    },
    {
      '@type': 'Question',
      name: 'PDFの契約書も診断できますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、PDF・画像（JPG/PNG）・テキスト貼り付けに対応しています。スキャンしたPDFや画像もOCR処理でテキストを抽出して診断します。ただし画質が極端に低い場合は精度が下がることがあります。',
      },
    },
    {
      '@type': 'Question',
      name: '発注側（企業）も使えますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、フリーランスに業務委託している企業（発注側）のコンプライアンスチェックにも対応しています。自社の発注書・業務委託契約書がフリーランス新法・下請法に準拠しているか確認できます。定額使い放題プラン（月980円）では月間診断数が無制限です。',
      },
    },
  ],
}

// GEO対策：HowToスキーマで使い方を構造化
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: '契約書チェッカーの使い方',
  description: 'フリーランス新法・下請法に違反した条項をAIで診断する方法',
  totalTime: 'PT2M',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: '契約書を用意する',
      text: '業務委託契約書をPDF・画像・またはテキストでコピーします。形式は問いません。',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'サービスに貼り付ける',
      text: '無料登録後、契約書の内容をアップロードまたはテキスト貼り付けします。',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'AIが約30秒で診断',
      text: 'フリーランス新法・下請法の全条項と照合し、違反箇所を自動特定します。',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: '条文番号付きで結果確認',
      text: '違反箇所・違反理由・修正案・不足条項が一覧で表示されます。交渉の根拠にそのまま使えます。',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        {/* SEO・GEO構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        {/* Google Analytics 4 + Google Ads */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-F5FHXJB30N" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-F5FHXJB30N');
          gtag('config', 'AW-18161193215');
        `}</Script>
      </head>
      <body className="min-h-full" style={{ backgroundColor: '#F8F7F4', color: '#1a1a2e' }}>{children}</body>
    </html>
  )
}
