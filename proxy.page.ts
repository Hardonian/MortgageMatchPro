import { NextRequest, NextResponse } from 'next/server'

const productionApiAllowlist = [
  '/api/calculate',
  '/api/affordability',
  '/api/health',
  '/api/healthz',
  '/api/v2/api-keys/generate',
  '/api/v2/payments/create-intent',
  '/api/v2/open-banking/connect',
  '/api/v2/open-banking/exchange',
  '/api/webhooks/stripe',
]

type RateLimitPolicy = {
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const defaultPolicy: RateLimitPolicy = { limit: 60, windowMs: 60_000 }
const rateLimitPolicies: Record<string, RateLimitPolicy> = {
  '/api/calculate': { limit: 30, windowMs: 60_000 },
  '/api/affordability': { limit: 30, windowMs: 60_000 },
  '/api/health': { limit: 120, windowMs: 60_000 },
  '/api/healthz': { limit: 120, windowMs: 60_000 },
  '/api/v2/api-keys/generate': { limit: 10, windowMs: 60_000 },
  '/api/v2/payments/create-intent': { limit: 10, windowMs: 60_000 },
  '/api/v2/open-banking/connect': { limit: 10, windowMs: 60_000 },
  '/api/v2/open-banking/exchange': { limit: 10, windowMs: 60_000 },
  '/api/webhooks/stripe': { limit: 60, windowMs: 60_000 },
}

// This is an edge-local safety net. Platform-level rate limiting should also
// be configured at the Vercel Firewall for a shared, cross-region limit.
const requestWindows = new Map<string, RateLimitEntry>()

function clientIdentifier(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

function rateLimit(pathname: string, clientId: string, now = Date.now()) {
  // Bound memory in long-lived development or edge instances without adding
  // work to the normal request path.
  if (requestWindows.size > 5_000) {
    for (const [key, value] of requestWindows) {
      if (value.resetAt <= now) requestWindows.delete(key)
    }
  }

  const policy = rateLimitPolicies[pathname] || defaultPolicy
  const key = `${pathname}:${clientId}`
  const current = requestWindows.get(key)
  const entry = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + policy.windowMs }
    : current

  entry.count += 1
  requestWindows.set(key, entry)

  return {
    allowed: entry.count <= policy.limit,
    limit: policy.limit,
    remaining: Math.max(policy.limit - entry.count, 0),
    resetAt: entry.resetAt,
  }
}

function withRateLimitHeaders(response: NextResponse, result: ReturnType<typeof rateLimit>) {
  response.headers.set('X-RateLimit-Limit', String(result.limit))
  response.headers.set('X-RateLimit-Remaining', String(result.remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)))
  return response
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Legacy endpoints remain available locally for migration work, but are
  // deliberately fail-closed in production until each has a reviewed auth,
  // authorization, consent, and provider-integrity implementation.
  if (process.env.NODE_ENV === 'production' && !productionApiAllowlist.includes(pathname)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const result = rateLimit(pathname, clientIdentifier(request))
  if (!result.allowed) {
    const response = NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 }
    )
    response.headers.set('Cache-Control', 'private, no-store, max-age=0')
    response.headers.set('Retry-After', String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))))
    return withRateLimitHeaders(response, result)
  }

  return withRateLimitHeaders(NextResponse.next(), result)
}

export const config = {
  matcher: ['/api/:path*'],
}

export function resetRateLimitForTests() {
  requestWindows.clear()
}
