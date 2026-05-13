import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: '契約書チェッカー | フリーランス新法対応',
  description: 'フリーランス新法（特定受託事業者に係る取引の適正化等に関する法律）に基づいた契約書の法律違反リスク自動判定サービス',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <head>
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
