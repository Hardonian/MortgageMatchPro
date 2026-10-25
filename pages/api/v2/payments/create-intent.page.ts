import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireAuthenticatedUser } from '../../../../lib/server/auth'
import {
  createPaymentIntent,
  IdempotencyConflictError,
  PaymentsUnavailableError,
} from '../../../../lib/server/payments'

const requestSchema = z.object({
  product: z.literal('rate_check'),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parsed = requestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid payment request' })

  const idempotencyKey = req.headers['idempotency-key']
  if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 16 || idempotencyKey.length > 255) {
    return res.status(400).json({ error: 'A valid Idempotency-Key header is required' })
  }

  const user = await requireAuthenticatedUser(req, res)
  if (!user) return

  try {
    const payment = await createPaymentIntent({
      userId: user.id,
      product: parsed.data.product,
      idempotencyKey,
    })
    return res.status(201).json(payment)
  } catch (error) {
    if (error instanceof IdempotencyConflictError) {
      return res.status(409).json({ error: 'Idempotency key conflicts with a prior payment request' })
    }
    if (error instanceof PaymentsUnavailableError) {
      return res.status(503).json({ error: 'Payments are temporarily unavailable', code: 'PAYMENTS_UNAVAILABLE' })
    }
    return res.status(502).json({ error: 'Payment provider request failed' })
  }
}
