import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { z } from 'zod'
import { requireOrganizationRole } from '../../../../lib/server/auth'

const schema = z.object({
  organizationId: z.string().uuid(),
  keyName: z.string().trim().min(1).max(100),
  permissions: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  expiresAt: z.string().datetime().optional(),
})

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('API key service is not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'Invalid API key request' })

  const principal = await requireOrganizationRole(req, res, parsed.data.organizationId, ['OWNER', 'ADMIN'])
  if (!principal) return

  try {
    const apiKey = `mmp_live_${crypto.randomBytes(32).toString('base64url')}`
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
    const { data, error } = await serviceClient()
      .from('api_keys')
      .insert({
        organization_id: principal.organizationId,
        name: parsed.data.keyName,
        key_hash: keyHash,
        key_prefix: apiKey.slice(0, 12),
        permissions: parsed.data.permissions,
        expires_at: parsed.data.expiresAt || null,
      })
      .select('id, name, key_prefix, permissions, expires_at, created_at')
      .single()

    if (error) throw error
    return res.status(201).json({ apiKey, key: data })
  } catch {
    return res.status(503).json({ error: 'API key service unavailable' })
  }
}
