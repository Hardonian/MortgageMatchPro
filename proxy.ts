import { NextRequest, NextResponse } from 'next/server'

const productionApiAllowlist = [
  '/api/calculate',
  '/api/affordability',
  '/api/health',
  '/api/healthz',
  '/api/v2/api-keys/generate',
  '/api/v2/payments/create-intent',
  '/api/v2/open-banking/connect',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Legacy endpoints remain available locally for migration work, but are
  // deliberately fail-closed in production until each has a reviewed auth,
  // authorization, consent, and provider-integrity implementation.
  if (process.env.NODE_ENV === 'production' && !productionApiAllowlist.includes(pathname)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
