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
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-xs font-bold text-gray-900">まず1回、無料で試してみませんか？</p>
          <p className="text-xs text-green-600 font-medium">カード不要・30秒で登録完了</p>
        </div>
        <Link
          href="/signup"
          className="shrink-0 inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-400 active:bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
        >
          無料で試す
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
