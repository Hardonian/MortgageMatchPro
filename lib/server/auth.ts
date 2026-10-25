import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient, type User } from '@supabase/supabase-js'

type OrganizationRole = 'OWNER' | 'ADMIN' | 'ANALYST' | 'VIEWER'

export interface AuthenticatedPrincipal {
  user: User
  organizationId: string
  role: OrganizationRole
}

function env(name: string, fallback?: string): string {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined)
  if (!value) throw new Error(`Missing required server environment variable: ${name}`)
  return value
}

function bearerToken(req: NextApiRequest): string | null {
  const authorization = req.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return null
  return authorization.slice('Bearer '.length).trim() || null
}

export async function requireAuthenticatedUser(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<User | null> {
  const token = bearerToken(req)
  if (!token) {
    res.status(401).json({ error: 'Authentication required' })
    return null
  }

  try {
    const client = createClient(
      env('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
      env('SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data, error } = await client.auth.getUser()

    if (error || !data.user) {
      res.status(401).json({ error: 'Invalid or expired session' })
      return null
    }

    return data.user
  } catch {
    res.status(503).json({ error: 'Authentication service unavailable' })
    return null
  }
}

export async function requireOrganizationRole(
  req: NextApiRequest,
  res: NextApiResponse,
  organizationId: string,
  allowedRoles: OrganizationRole[]
): Promise<AuthenticatedPrincipal | null> {
  const user = await requireAuthenticatedUser(req, res)
  if (!user) return null

  try {
    const admin = createClient(
      env('SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL'),
      env('SUPABASE_SERVICE_KEY'),
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data, error } = await admin
      .from('memberships')
      .select('organization_id, role, status')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    const role = data?.role as OrganizationRole | undefined
    if (error || !role || !allowedRoles.includes(role)) {
      res.status(403).json({ error: 'Insufficient organization permissions' })
      return null
    }

    return { user, organizationId, role }
  } catch {
    res.status(503).json({ error: 'Authorization service unavailable' })
    return null
  }
}
