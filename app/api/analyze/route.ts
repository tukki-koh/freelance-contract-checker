import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { analyzeContract } from '@/lib/anthropic'
import { extractTextFromPdf, extractTextFromImage } from '@/lib/pdf-parser'
import { checkAccess } from '@/lib/stripe'
import type { UserSubscription } from '@/types'

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 支払いガード ─────────────────────────────────────────
  const { data: subData } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const access = checkAccess(subData as UserSubscription | null)

  if (!access.allowed) {
    const messages: Record<string, string> = {
      no_subscription: 'プランを購入してください。診断を実行するには単発プラン（500円）または法人プラン（月額2,980円）が必要です。',
      no_credits: '診断クレジットが不足しています。追加購入してください。',
      expired: '利用期間が終了しています。プランを更新してください。',
      pending: '決済処理中です。しばらくお待ちください。',
    }
    return NextResponse.json(
      { error: messages[access.reason] ?? '利用権限がありません', reason: access.reason },
      { status: 402 }
    )
  }

  // ── ファイル・テキスト処理 ────────────────────────────────
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const text = formData.get('text') as string | null

  let extractedText = ''
  let fileType: 'pdf' | 'image' | 'text' = 'text'
  let fileName = 'テキスト入力'
  let imageBase64: string | undefined
  let imageMimeType: string | undefined

  if (file) {
    fileName = file.name
    const buffer = Buffer.from(await file.arrayBuffer())

    if (file.type === 'application/pdf') {
      fileType = 'pdf'
      extractedText = await extractTextFromPdf(buffer)
    } else if (file.type.startsWith('image/')) {
      fileType = 'image'
      imageBase64 = buffer.toString('base64')
      imageMimeType = file.type
      extractedText = await extractTextFromImage(buffer)
    } else {
      extractedText = buffer.toString('utf-8')
    }
  } else if (text) {
    extractedText = text
  } else {
    return NextResponse.json({ error: 'ファイルまたはテキストを提供してください' }, { status: 400 })
  }

  // ── Claude 分析実行 ───────────────────────────────────────
  const analysisResult = await analyzeContract(extractedText, imageBase64, imageMimeType)

  // ── 単発プランのクレジットを消費（Service Role で RLS をバイパス）
  if (access.planType === 'single') {
    const adminClient = getAdminClient()
    await adminClient
      .from('user_subscriptions')
      .update({ credits_remaining: (access.creditsRemaining ?? 1) - 1 })
      .eq('user_id', user.id)
  }

  // ── 分析結果を DB 保存 ────────────────────────────────────
  const { data, error } = await supabase
    .from('contract_analyses')
    .insert({
      user_id: user.id,
      file_name: fileName,
      file_type: fileType,
      extracted_text: extractedText.slice(0, 50000),
      analysis_result: analysisResult,
      risk_level: analysisResult.risk_level,
      plan_type_used: access.planType,
    })
    .select()
    .single()

  if (error) {
    console.error('DB insert error:', error)
    return NextResponse.json({ error: 'データの保存に失敗しました' }, { status: 500 })
  }

  // 残クレジット数をレスポンスに含める（UI 更新用）
  const creditsAfter = access.planType === 'single'
    ? (access.creditsRemaining ?? 1) - 1
    : undefined

  return NextResponse.json({
    analysis: analysisResult,
    id: data.id,
    creditsRemaining: creditsAfter,
  })
}
