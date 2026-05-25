'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

export function StickyCtaBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      // ファーストビュー（約600px）を過ぎたら表示
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-950/95 backdrop-blur-sm border-t border-slate-800 px-4 py-3 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-100">契約書の違反条項を今すぐ確認</p>
          <p className="text-xs text-slate-400">500円・30秒・弁護士費用の1/60</p>
        </div>
        <Link
          href="/signup?next=/pricing"
          className="shrink-0 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
        >
          診断する
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
