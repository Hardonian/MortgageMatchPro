import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireAuthenticatedUser } from '../../../../lib/server/auth'
import {
  exchangePublicToken,
  OpenBankingProviderError,
  OpenBankingUnavailableError,
} from '../../../../lib/server/open-banking'

const requestSchema = z.object({
  sessionId: z.string().uuid(),
  publicToken: z.string().trim().min(1).max(2_000),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parsed = requestSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid bank connection response' })

  const user = await requireAuthenticatedUser(req, res)
  if (!user) return

  try {
    const connection = await exchangePublicToken({
      userId: user.id,
      sessionId: parsed.data.sessionId,
      publicToken: parsed.data.publicToken,
    })
    return res.status(201).json(connection)
  } catch (error) {
    if (error instanceof OpenBankingUnavailableError) {
      return res.status(503).json({ error: 'Open banking is temporarily unavailable', code: 'OPEN_BANKING_UNAVAILABLE' })
    }
    if (error instanceof OpenBankingProviderError) {
      return res.status(400).json({ error: 'Unable to complete the bank connection' })
    }
    return res.status(503).json({ error: 'Open banking is temporarily unavailable', code: 'OPEN_BANKING_UNAVAILABLE' })
  }
}
