import { scryptSync } from 'crypto'

/**
 * Produces a deterministic, memory-hard digest for an API token.
 *
 * API keys must remain queryable by their digest. A server-only pepper is used
 * as the KDF salt so a copied database row cannot be tested offline.
 */
export function hashApiKey(apiKey: string): string {
  const pepper = process.env.API_KEY_HASH_SECRET
  if (!pepper) throw new Error('API key hashing is not configured')

  return scryptSync(apiKey, pepper, 64).toString('hex')
}
