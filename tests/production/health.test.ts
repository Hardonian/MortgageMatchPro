import health from '../../pages/api/health.page'
import readiness from '../../pages/api/healthz.page'

function response() {
  const result = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() }
  result.status.mockReturnValue(result)
  return result
}

describe('production health endpoints', () => {
  it.each([
    ['health', health],
    ['readiness', readiness],
  ])('returns a minimal no-store response from %s', (_name, handler) => {
    const res = response()
    handler({ method: 'GET' } as any, res as any)

    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: 'ok' }))
  })

  it('rejects non-GET requests', () => {
    const res = response()
    health({ method: 'POST' } as any, res as any)
    expect(res.status).toHaveBeenCalledWith(405)
  })
})
