import { createHmac } from 'crypto'

/**
 * Produces a deterministic, keyed digest for an API token.
 *
 * API keys are high-entropy credentials rather than user passwords, so they
 * must remain queryable by their digest. The server-only pepper prevents a
 * copied database row from being used to test tokens offline.
 */
export function hashApiKey(apiKey: string): string {
  const pepper = process.env.API_KEY_HASH_SECRET
  if (!pepper) throw new Error('API key hashing is not configured')

  return createHmac('sha512', pepper).update(apiKey, 'utf8').digest('hex')
}
