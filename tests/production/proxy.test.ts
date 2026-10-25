import { NextRequest } from 'next/server'
import { proxy, resetRateLimitForTests } from '../../proxy'

function request(pathname: string, ip = '203.0.113.10') {
  return new NextRequest(`https://mortgagematch.pro${pathname}`, {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('production API proxy', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    process.env.NODE_ENV = 'production'
    resetRateLimitForTests()
  })

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('fails closed for APIs outside the production allowlist', async () => {
    const response = proxy(request('/api/legacy-endpoint'))

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({ error: 'Not found' })
  })

  it('adds transparent rate-limit headers to allowed API responses', () => {
    const response = proxy(request('/api/calculate'))

    expect(response.status).toBe(200)
    expect(response.headers.get('X-RateLimit-Limit')).toBe('30')
    expect(response.headers.get('X-RateLimit-Remaining')).toBe('29')
  })

  it('throttles the calculator after its per-minute limit', async () => {
    const first = request('/api/calculate', '198.51.100.23')
    for (let count = 0; count < 30; count += 1) proxy(first)

    const response = proxy(first)

    expect(response.status).toBe(429)
    expect(response.headers.get('Retry-After')).toBeTruthy()
    await expect(response.json()).resolves.toEqual({
      error: 'Too many requests. Please try again shortly.',
    })
  })
})
