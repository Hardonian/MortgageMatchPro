import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const paymentProducts = {
  rate_check: {
    amount: 299,
    currency: 'cad',
    description: 'MortgageMatch Pro rate check',
  },
} as const

export type PaymentProduct = keyof typeof paymentProducts

export class PaymentsUnavailableError extends Error {}
export class IdempotencyConflictError extends Error {}

type PaymentRequestRow = {
  request_fingerprint: string
  stripe_payment_intent_id: string | null
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new PaymentsUnavailableError('Payment storage is not configured')

  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function stripeClient() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret?.startsWith('sk_')) {
    throw new PaymentsUnavailableError('Stripe is not configured')
  }

  return new Stripe(secret)
}

function requestFingerprint(userId: string, product: PaymentProduct): string {
  return crypto.createHash('sha256').update(`${userId}:${product}`).digest('hex')
}

function stripeIdempotencyKey(userId: string, idempotencyKey: string): string {
  return `mmp_pi_${crypto.createHash('sha256').update(`${userId}:${idempotencyKey}`).digest('hex')}`
}

function toStoredStatus(intent: Stripe.PaymentIntent): 'processing' | 'succeeded' | 'failed' | 'canceled' {
  if (intent.status === 'succeeded') return 'succeeded'
  if (intent.status === 'canceled') return 'canceled'
  if (intent.status === 'requires_payment_method') return 'failed'
  return 'processing'
}

async function responseForIntent(intent: Stripe.PaymentIntent) {
  if (!intent.client_secret) throw new PaymentsUnavailableError('Payment intent has no client secret')

  return {
    paymentIntentId: intent.id,
    clientSecret: intent.client_secret,
    status: intent.status,
  }
}

export async function createPaymentIntent({
  userId,
  product,
  idempotencyKey,
}: {
  userId: string
  product: PaymentProduct
  idempotencyKey: string
}) {
  const storage = serviceClient()
  const fingerprint = requestFingerprint(userId, product)
  const { data: existing, error: existingError } = await storage
    .from('payment_requests')
    .select('request_fingerprint, stripe_payment_intent_id')
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle<PaymentRequestRow>()

  if (existingError) throw new PaymentsUnavailableError('Payment storage is unavailable')
  if (existing) {
    if (existing.request_fingerprint !== fingerprint) {
      throw new IdempotencyConflictError('Idempotency key was already used for a different request')
    }
    if (!existing.stripe_payment_intent_id) {
      throw new PaymentsUnavailableError('Payment request is still being initialized')
    }
    return responseForIntent(await stripeClient().paymentIntents.retrieve(existing.stripe_payment_intent_id))
  }

  const item = paymentProducts[product]
  const intent = await stripeClient().paymentIntents.create({
    amount: item.amount,
    currency: item.currency,
    description: item.description,
    automatic_payment_methods: { enabled: true },
    metadata: {
      mortgage_match_product: product,
      mortgage_match_user_id: userId,
    },
  }, { idempotencyKey: stripeIdempotencyKey(userId, idempotencyKey) })

  const { error: insertError } = await storage.from('payment_requests').insert({
    user_id: userId,
    idempotency_key: idempotencyKey,
    request_fingerprint: fingerprint,
    product_code: product,
    amount: item.amount,
    currency: item.currency,
    status: toStoredStatus(intent),
    stripe_payment_intent_id: intent.id,
    stripe_customer_id: typeof intent.customer === 'string' ? intent.customer : intent.customer?.id || null,
  })

  if (insertError && insertError.code !== '23505') {
    throw new PaymentsUnavailableError('Payment storage is unavailable')
  }

  return responseForIntent(intent)
}

export async function beginWebhookEvent(event: Stripe.Event): Promise<boolean> {
  const { error } = await serviceClient().from('stripe_webhook_events').insert({
    stripe_event_id: event.id,
    event_type: event.type,
  })

  if (!error) return true
  if (error.code === '23505') return false
  throw new PaymentsUnavailableError('Webhook storage is unavailable')
}

export async function completeWebhookEvent(eventId: string, status: 'processed' | 'failed', errorCode?: string) {
  const { error } = await serviceClient().from('stripe_webhook_events').update({
    status,
    error_code: errorCode || null,
    processed_at: new Date().toISOString(),
  }).eq('stripe_event_id', eventId)

  if (error) throw new PaymentsUnavailableError('Webhook storage is unavailable')
}

export async function recordPaymentIntentStatus(intent: Stripe.PaymentIntent) {
  const { error } = await serviceClient().from('payment_requests').update({
    status: toStoredStatus(intent),
    stripe_customer_id: typeof intent.customer === 'string' ? intent.customer : intent.customer?.id || null,
  }).eq('stripe_payment_intent_id', intent.id)

  if (error) throw new PaymentsUnavailableError('Payment storage is unavailable')
}

export function verifyStripeWebhook(rawBody: Buffer, signature: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) throw new PaymentsUnavailableError('Stripe webhook signing secret is not configured')
  return stripeClient().webhooks.constructEvent(rawBody, signature, secret)
}
