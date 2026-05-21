import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: '契約書チェッカー｜フリーランス新法・下請法 違反を30秒でAI診断 500円〜',
  description: 'フリーランス新法・下請法に違反した契約条項をAIが30秒で発見。条文番号付きで違反箇所を指摘し修正案まで提示。弁護士費用の1/60以下、500円から。無料登録で1回お試し可能。',
  keywords: ['フリーランス新法', '契約書チェック', '下請法', '業務委託契約', '違反条項', '契約書診断', 'AI'],
  openGraph: {
    title: '契約書チェッカー｜フリーランス新法 違反を30秒でAI診断',
    description: 'フリーランス新法・下請法の違反条項をAIが30秒で発見。条文番号付きで指摘。500円〜、無料登録で1回お試し。',
    url: 'https://freelance-contract-checker.vercel.app',
    siteName: '契約書チェッカー',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '契約書チェッカー｜フリーランス新法 違反を30秒でAI診断',
    description: 'フリーランス新法・下請法の違反条項をAIが30秒で発見。500円〜',
  },
  alternates: {
    canonical: 'https://freelance-contract-checker.vercel.app',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: '契約書チェッカー',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: 'フリーランス新法・下請法に違反した契約条項をAIが自動診断。違反箇所を条文番号付きで指摘し、修正案まで提示するサービス。',
  url: 'https://freelance-contract-checker.vercel.app',
  offers: {
    '@type': 'Offer',
    price: '500',
    priceCurrency: 'JPY',
    description: '単発診断プラン（1回）',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '47',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=AW-18161193215" strategy="afterInteractive" />
        <Script id="google-ads" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18161193215');
        `}</Script>
      </head>
      <body className="min-h-full bg-slate-950 text-slate-100">{children}</body>
    </html>
  )
}
