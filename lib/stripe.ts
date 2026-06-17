import Stripe from 'stripe'
import type { PlanConfig, PlanType, UserSubscription, AccessStatus } from '@/types'

// ── Stripe クライアント（サーバー専用）────────────────────
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
})

// ── プラン定義 ─────────────────────────────────────────────
// STRIPE_PRICE_ID_SINGLE / STRIPE_PRICE_ID_CORPORATE は
// Stripe Dashboard で作成した Price ID を .env.local に設定する
export const PLANS: Record<PlanType, PlanConfig> = {
  single: {
    id: 'single',
    name: '単発診断プラン',
    price: 500,
    interval: 'once',
    description: '1回の契約書診断に使えるクレジット',
    features: [
      'フリーランス新法・下請法の全条項チェック',
      '違反箇所の条文番号付き指摘',
      '修正案の提示',
      '不足条項の指摘',
      '診断結果の保存・再閲覧',
    ],
    stripePriceId: process.env.STRIPE_PRICE_ID_SINGLE!,
  },
  corporate: {
    id: 'corporate',
    name: '法人向け定額プラン',
    price: 2980,
    interval: 'month',
    description: '毎月無制限で契約書を診断できるプラン',
    badge: '人気',
    features: [
      '単発プランの全機能',
      '月間診断数：無制限',
      '複数ユーザーでの利用（予定）',
      '優先サポート',
      '分析レポートのエクスポート（予定）',
    ],
    stripePriceId: process.env.STRIPE_PRICE_ID_CORPORATE!,
  },
}

// ── アクセス権チェック ────────────────────────────────────
export function checkAccess(sub: UserSubscription | null): AccessStatus {
  if (!sub || !sub.plan_type) {
    return { allowed: false, reason: 'no_subscription' }
  }

  if (sub.status === 'pending') {
    return { allowed: false, reason: 'pending' }
  }

  // 法人プラン
  if (sub.plan_type === 'corporate') {
    if (sub.status === 'active') {
      return { allowed: true, planType: 'corporate' }
    }
    // cancelled でも period_end まで利用可
    if (
      sub.status === 'cancelled' &&
      sub.current_period_end &&
      new Date(sub.current_period_end) > new Date()
    ) {
      return { allowed: true, planType: 'corporate' }
    }
    return { allowed: false, reason: 'expired' }
  }

  // 単発プラン
  if (sub.plan_type === 'single') {
    if (sub.credits_remaining > 0) {
      return { allowed: true, planType: 'single', creditsRemaining: sub.credits_remaining }
    }
    return { allowed: false, reason: 'no_credits' }
  }

  return { allowed: false, reason: 'no_subscription' }
}

// ── Webhook 署名検証 ──────────────────────────────────────
export function constructWebhookEvent(payload: string, sig: string): Stripe.Event {
  return stripe.webhooks.constructEvent(
    payload,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}
