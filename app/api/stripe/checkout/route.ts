import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'
import type { PlanType } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { planType } = await request.json() as { planType: PlanType }

  if (!planType || !PLANS[planType]) {
    return NextResponse.json({ error: '無効なプランです' }, { status: 400 })
  }

  const plan = PLANS[planType]
  const origin = request.headers.get('origin')
    ?? process.env.NEXT_PUBLIC_APP_URL
    ?? 'https://freelance-contract-checker.vercel.app'

  // 既存の Stripe Customer ID を取得（あれば再利用）
  const { data: existingSub } = await supabase
    .from('user_subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  let customerId = existingSub?.stripe_customer_id ?? undefined

  // Customer がなければ作成
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id
  }

  // Checkout Session を作成
  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    customer: customerId,
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    mode: planType === 'corporate' ? 'subscription' : 'payment',
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${planType}`,
    cancel_url: `${origin}/pricing?cancelled=true`,
    locale: 'ja',
    metadata: {
      supabase_user_id: user.id,
      plan_type: planType,
    },
    // サブスクリプションにもメタデータを付与
    ...(planType === 'corporate' && {
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan_type: planType },
      },
    }),
  }

  const session = await stripe.checkout.sessions.create(sessionParams)

  // pending レコードを upsert（Webhook 到着前の UI 表示用）
  await supabase.from('user_subscriptions').upsert(
    {
      user_id: user.id,
      stripe_customer_id: customerId,
      stripe_price_id: plan.stripePriceId,
      plan_type: planType,
      status: 'pending',
    },
    { onConflict: 'user_id' }
  )

  return NextResponse.json({ url: session.url })
}
