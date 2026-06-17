import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@supabase/supabase-js'
import { constructWebhookEvent } from '@/lib/stripe'
import type Stripe from 'stripe'

// Webhook では署名検証のため生 body が必要。bodyParser を無効化。
export const dynamic = 'force-dynamic'

// Stripe API 2025-04-30 では current_period_end が SubscriptionItem 配下に移動
function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  const periodEnd = subscription.items.data[0]?.current_period_end
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null
}

// Webhook 処理は Service Role で RLS をバイパスして DB を更新する
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const payload = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = constructWebhookEvent(payload, sig)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getAdminClient()

  // 二重処理防止：同じ event_id は一度だけ処理
  const { data: existingEvent } = await supabase
    .from('payment_events')
    .select('id')
    .eq('stripe_event_id', event.id)
    .single()

  if (existingEvent) {
    return NextResponse.json({ received: true, skipped: 'duplicate' })
  }

  try {
    switch (event.type) {
      // ── 一括払い / サブスクリプション 決済完了 ────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(supabase, session, event.id)
        break
      }

      // ── サブスクリプション更新（期間更新・プラン変更）────────────
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(supabase, subscription, event.id)
        break
      }

      // ── サブスクリプションキャンセル ──────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(supabase, subscription, event.id)
        break
      }

      // ── サブスクリプション支払い成功（毎月の更新）────────────────
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(supabase, invoice, event.id)
        break
      }

      // ── サブスクリプション支払い失敗 ──────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(supabase, invoice, event.id)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (err) {
    console.error(`Error processing event ${event.type}:`, err)
    // イベント記録（失敗）
    await supabase.from('payment_events').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      status: 'error',
    })
    return NextResponse.json({ error: 'Event processing failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

// ================================================================
// イベントハンドラー
// ================================================================

async function handleCheckoutCompleted(
  supabase: ReturnType<typeof getAdminClient>,
  session: Stripe.Checkout.Session,
  eventId: string
) {
  const userId = session.metadata?.supabase_user_id
  const planType = session.metadata?.plan_type as 'single' | 'corporate' | undefined

  if (!userId || !planType) {
    console.error('Missing metadata in checkout session:', session.id)
    return
  }

  if (planType === 'single') {
    // 単発プラン：クレジットを +1 加算
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('credits_remaining')
      .eq('user_id', userId)
      .single()

    await supabase.from('user_subscriptions').upsert(
      {
        user_id: userId,
        stripe_customer_id: session.customer as string,
        stripe_price_id: session.line_items?.data?.[0]?.price?.id ?? null,
        plan_type: 'single',
        status: 'active',
        credits_remaining: (existing?.credits_remaining ?? 0) + 1,
      },
      { onConflict: 'user_id' }
    )
  } else if (planType === 'corporate') {
    // 法人プラン：subscription.updated で処理されるためここでは pending → active のみ
    await supabase
      .from('user_subscriptions')
      .update({ status: 'active', stripe_customer_id: session.customer as string })
      .eq('user_id', userId)
  }

  await supabase.from('payment_events').insert({
    user_id: userId,
    stripe_event_id: eventId,
    stripe_session_id: session.id,
    event_type: 'checkout.session.completed',
    plan_type: planType,
    amount_jpy: session.amount_total ?? null,
    status: 'success',
  })
}

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof getAdminClient>,
  subscription: Stripe.Subscription,
  eventId: string
) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) return

  const status = subscription.status === 'active' ? 'active'
    : subscription.status === 'canceled' ? 'cancelled'
    : 'pending'

  await supabase.from('user_subscriptions').upsert(
    {
      user_id: userId,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0]?.price.id ?? null,
      plan_type: 'corporate',
      status,
      current_period_end: getSubscriptionPeriodEnd(subscription),
    },
    { onConflict: 'user_id' }
  )

  await supabase.from('payment_events').insert({
    user_id: userId,
    stripe_event_id: eventId,
    event_type: 'customer.subscription.updated',
    plan_type: 'corporate',
    status,
  })
}

async function handleSubscriptionDeleted(
  supabase: ReturnType<typeof getAdminClient>,
  subscription: Stripe.Subscription,
  eventId: string
) {
  const userId = subscription.metadata?.supabase_user_id
  if (!userId) return

  await supabase
    .from('user_subscriptions')
    .update({
      status: 'cancelled',
      current_period_end: getSubscriptionPeriodEnd(subscription),
    })
    .eq('user_id', userId)

  await supabase.from('payment_events').insert({
    user_id: userId,
    stripe_event_id: eventId,
    event_type: 'customer.subscription.deleted',
    plan_type: 'corporate',
    status: 'cancelled',
  })
}

async function handleInvoicePaid(
  supabase: ReturnType<typeof getAdminClient>,
  invoice: Stripe.Invoice,
  eventId: string
) {
  // Stripe API 2025-04-30: subscription は invoice.parent.subscription_details.subscription に移動
  const subscriptionId = invoice.parent?.subscription_details?.subscription
  if (!subscriptionId) return
  const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subId)
    .single()

  if (!sub) return

  await supabase
    .from('user_subscriptions')
    .update({ status: 'active' })
    .eq('stripe_subscription_id', subId)

  await supabase.from('payment_events').insert({
    user_id: sub.user_id,
    stripe_event_id: eventId,
    event_type: 'invoice.paid',
    plan_type: 'corporate',
    amount_jpy: invoice.amount_paid ?? null,
    status: 'success',
  })
}

async function handleInvoicePaymentFailed(
  supabase: ReturnType<typeof getAdminClient>,
  invoice: Stripe.Invoice,
  eventId: string
) {
  const subscriptionId = invoice.parent?.subscription_details?.subscription
  if (!subscriptionId) return
  const subId = typeof subscriptionId === 'string' ? subscriptionId : subscriptionId.id

  const { data: sub } = await supabase
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subId)
    .single()

  if (!sub) return

  await supabase.from('payment_events').insert({
    user_id: sub.user_id,
    stripe_event_id: eventId,
    event_type: 'invoice.payment_failed',
    plan_type: 'corporate',
    status: 'payment_failed',
  })
}
