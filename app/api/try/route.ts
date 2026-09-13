import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { analyzeContract } from '@/lib/anthropic'
import { extractTextFromPdf, extractTextFromImage } from '@/lib/pdf-parser'
import type { AnalysisResult, TrialResult } from '@/types'

// ================================================================
// 登録不要の無料お試し診断
// - 1端末(IP)につき24時間で1回、全体で1日の上限あり（API費用の上限を固定するため）
// - 結果は「総合判定＋1件目の指摘の全文」だけを返し、残りは項目名のみ。
//   全件の修正案は登録・購入後の本診断で見られる（クライアントで隠すだけだと中身が見えてしまうため、サーバーで削る）
// ================================================================

// 診断JSON(最大8192トークン)の生成に60秒以上かかるため、Hobbyの上限300秒まで延ばす
export const maxDuration = 300

const PER_IP_WINDOW_HOURS = 24
const GLOBAL_DAILY_CAP = 60
const MAX_CHARS = 20000
const MAX_FILE_BYTES = 5 * 1024 * 1024

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function hashIp(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const salt = process.env.TRIAL_SALT ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

function toTrialResult(r: AnalysisResult): TrialResult {
  const [first, ...rest] = r.violations ?? []
  return {
    risk_level: r.risk_level,
    applicable_laws: r.applicable_laws ?? [],
    summary: r.summary,
    violation_count: r.violations?.length ?? 0,
    missing_count: r.missing_clauses?.length ?? 0,
    first_violation: first ?? null,
    locked_violations: rest.map(v => ({ article: v.article, article_name: v.article_name, severity: v.severity })),
    locked_missing: (r.missing_clauses ?? []).map(m => ({ article: m.article, article_name: m.article_name })),
    disclaimer: r.disclaimer,
  }
}

export async function POST(request: NextRequest) {
  const admin = getAdminClient()
  const ipHash = hashIp(request)

  // ── 利用回数の制限 ─────────────────────────────────────────
  const since = new Date(Date.now() - PER_IP_WINDOW_HOURS * 3600 * 1000).toISOString()
  const { count: mine } = await admin
    .from('trial_diagnoses')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .eq('status', 'ok')
    .gte('created_at', since)
  if ((mine ?? 0) > 0) {
    return NextResponse.json(
      { error: '無料お試しは24時間に1回までです。続けて診断するには、登録して単発プラン（300円）をご利用ください。', reason: 'limit' },
      { status: 429 }
    )
  }

  const dayStart = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  const { count: all } = await admin
    .from('trial_diagnoses')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', dayStart)
  if ((all ?? 0) >= GLOBAL_DAILY_CAP) {
    return NextResponse.json(
      { error: '本日の無料お試し枠が上限に達しました。明日もう一度お試しいただくか、単発プラン（300円）をご利用ください。', reason: 'global_limit' },
      { status: 429 }
    )
  }

  // ── 入力の取り出し ─────────────────────────────────────────
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const text = formData.get('text') as string | null

  let extractedText = ''
  let imageBase64: string | undefined
  let imageMimeType: string | undefined

  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'お試し診断のファイルは5MBまでです。' }, { status: 400 })
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    if (file.type === 'application/pdf') {
      extractedText = await extractTextFromPdf(buffer)
    } else if (file.type.startsWith('image/')) {
      imageBase64 = buffer.toString('base64')
      imageMimeType = file.type
      extractedText = await extractTextFromImage(buffer)
    } else {
      extractedText = buffer.toString('utf-8')
    }
  } else if (text) {
    extractedText = text
  } else {
    return NextResponse.json({ error: 'ファイルまたはテキストを入力してください。' }, { status: 400 })
  }

  if (!imageBase64 && extractedText.trim().length < 50) {
    return NextResponse.json({ error: '契約書の本文が短すぎます。条文を含む本文を貼り付けてください。' }, { status: 400 })
  }
  if (extractedText.length > MAX_CHARS) {
    extractedText = extractedText.slice(0, MAX_CHARS)
  }

  // ── 診断 ───────────────────────────────────────────────────
  try {
    const result = await analyzeContract(extractedText, imageBase64, imageMimeType)
    await admin.from('trial_diagnoses').insert({
      ip_hash: ipHash,
      risk_level: result.risk_level,
      violation_count: result.violations?.length ?? 0,
      missing_count: result.missing_clauses?.length ?? 0,
      input_chars: extractedText.length,
      status: 'ok',
    })
    return NextResponse.json({ trial: toTrialResult(result) })
  } catch (e) {
    console.error('[try] analyze failed', e)
    await admin.from('trial_diagnoses').insert({
      ip_hash: ipHash, input_chars: extractedText.length, status: 'error',
    })
    return NextResponse.json(
      { error: '診断中にエラーが発生しました。お手数ですが、もう一度お試しください（この失敗は回数に数えません）。' },
      { status: 500 }
    )
  }
}
