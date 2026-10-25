import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'
import {
  beginWebhookEvent,
  completeWebhookEvent,
  PaymentsUnavailableError,
  recordPaymentIntentStatus,
  verifyStripeWebhook,
} from '../../../lib/server/payments'

export const config = {
  api: {
    bodyParser: false,
  },
}

function readRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

async function processEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
    case 'payment_intent.payment_failed':
    case 'payment_intent.canceled':
      await recordPaymentIntentStatus(event.data.object as Stripe.PaymentIntent)
      break
    default:
      break
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const signature = req.headers['stripe-signature']
  if (typeof signature !== 'string') return res.status(400).json({ error: 'Missing Stripe signature' })

  let event: Stripe.Event
  try {
    event = verifyStripeWebhook(await readRawBody(req), signature)
  } catch {
    return res.status(400).json({ error: 'Invalid Stripe signature' })
  }

  try {
    if (!await beginWebhookEvent(event)) return res.status(200).json({ received: true, duplicate: true })
    await processEvent(event)
    await completeWebhookEvent(event.id, 'processed')
    return res.status(200).json({ received: true })
  } catch (error) {
    if (error instanceof PaymentsUnavailableError) return res.status(503).json({ error: 'Webhook storage is unavailable' })
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
