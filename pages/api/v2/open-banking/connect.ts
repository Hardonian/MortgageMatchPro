import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuthenticatedUser } from '../../../../lib/server/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const user = await requireAuthenticatedUser(req, res)
  if (!user) return

  // Open-banking credentials and consent flows must be provider-verified before
  // this endpoint can be enabled. Returning a clear unavailable state is safer
  // than minting a mock link token.
  return res.status(503).json({
    error: 'Open banking is not configured',
    code: 'OPEN_BANKING_NOT_CONFIGURED',
  })
}
