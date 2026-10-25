import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuthenticatedUser } from '../../../../lib/server/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await requireAuthenticatedUser(req, res)
  if (!user) return

  // Payments are deliberately unavailable until a verified server-side payment
  // provider and idempotency store are configured. Never substitute mock money flows.
  return res.status(503).json({
    error: 'Payments are not configured',
    code: 'PAYMENTS_NOT_CONFIGURED',
  })
}
