'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('パスワードは8文字以上で設定してください')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${next}`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-3">メールを確認してください</h1>
          <p className="text-sm text-slate-400 mb-6">
            {email} に確認メールを送信しました。
            メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            ログインページへ
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">アカウント作成</h1>
          <p className="text-sm text-slate-400 mt-2">無料でフリーランス新法チェックを始める</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              パスワード <span className="text-slate-500 font-normal">（8文字以上）</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
            アカウントを作成
          </Button>

          <p className="text-xs text-slate-500 text-center">
            登録することで、利用規約およびプライバシーポリシーに同意したものとみなされます。
          </p>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            ログイン
          </Link>
        </p>
        <p className="text-center text-sm text-slate-500 mt-2">
          <Link href="/" className="hover:text-slate-400 transition-colors">
            ← トップに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
