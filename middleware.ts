import { NextRequest, NextResponse } from 'next/server'

const disabledInProduction = [
  '/api/admin/',
  '/api/broker/',
  '/api/cost-optimization-test',
  '/api/optimization-test',
  '/api/performance-test',
  '/api/rate-limit-test',
  '/api/resource-test',
  '/api/selftest',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    process.env.NODE_ENV === 'production' &&
    disabledInProduction.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*'],
}
