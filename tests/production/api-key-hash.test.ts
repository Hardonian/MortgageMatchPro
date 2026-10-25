describe('API key hashing', () => {
  const originalSecret = process.env.API_KEY_HASH_SECRET

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.API_KEY_HASH_SECRET
    else process.env.API_KEY_HASH_SECRET = originalSecret
    jest.resetModules()
  })

  it('requires a server-only pepper', () => {
    delete process.env.API_KEY_HASH_SECRET
    const { hashApiKey } = require('../../lib/server/api-key-hash')

    expect(() => hashApiKey('mmp_live_example')).toThrow('not configured')
  })

  it('uses a stable keyed digest without exposing the token', () => {
    process.env.API_KEY_HASH_SECRET = 'test-pepper'
    const { hashApiKey } = require('../../lib/server/api-key-hash')
    const hash = hashApiKey('mmp_live_example')

    expect(hash).toMatch(/^[a-f0-9]{128}$/)
    expect(hash).toBe(hashApiKey('mmp_live_example'))
    expect(hash).not.toBe(hashApiKey('mmp_live_other'))
  })
})
