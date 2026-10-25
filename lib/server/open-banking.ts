import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export class OpenBankingUnavailableError extends Error {}
export class OpenBankingProviderError extends Error {}

type PlaidConfig = {
  clientId: string
  secret: string
  baseUrl: string
  countryCodes: string[]
  products: string[]
  clientName: string
  webhook?: string
  redirectUri?: string
}

type BankConnectionSession = {
  id: string
  user_id: string
  provider: 'plaid'
  consent_version: string
  consented_at: string
  expires_at: string
  status: 'created' | 'exchanged' | 'expired' | 'failed'
}

function serviceClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new OpenBankingUnavailableError('Open-banking storage is not configured')
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

function listEnvironment(name: string, fallback: string[]): string[] {
  return (process.env[name] || fallback.join(','))
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function plaidConfig(): PlaidConfig {
  if (process.env.OPEN_BANKING_PROVIDER !== 'plaid') {
    throw new OpenBankingUnavailableError('Plaid is not enabled')
  }

  const clientId = process.env.PLAID_CLIENT_ID
  const secret = process.env.PLAID_CLIENT_SECRET
  const environment = process.env.PLAID_ENVIRONMENT || 'sandbox'
  const baseUrls: Record<string, string> = {
    sandbox: 'https://sandbox.plaid.com',
    development: 'https://development.plaid.com',
    production: 'https://production.plaid.com',
  }

  if (!clientId || !secret || !baseUrls[environment]) {
    throw new OpenBankingUnavailableError('Plaid credentials are not configured')
  }

  return {
    clientId,
    secret,
    baseUrl: baseUrls[environment],
    countryCodes: listEnvironment('PLAID_COUNTRY_CODES', ['CA']),
    products: listEnvironment('PLAID_PRODUCTS', ['transactions']),
    clientName: (process.env.OPEN_BANKING_CLIENT_NAME || 'MortgageMatch Pro').slice(0, 30),
    webhook: process.env.PLAID_WEBHOOK_URL,
    redirectUri: process.env.PLAID_REDIRECT_URI,
  }
}

function encryptionKey(): Buffer {
  const value = process.env.OPEN_BANKING_TOKEN_ENCRYPTION_KEY
  if (!value) throw new OpenBankingUnavailableError('Open-banking token encryption is not configured')

  const key = /^[0-9a-f]{64}$/i.test(value)
    ? Buffer.from(value, 'hex')
    : Buffer.from(value, 'base64')
  if (key.length !== 32) throw new OpenBankingUnavailableError('Open-banking token encryption key is invalid')
  return key
}

function encryptAccessToken(accessToken: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(accessToken, 'utf8'), cipher.final()])
  return {
    encryptedAccessToken: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
  }
}

async function plaidRequest<T>(config: PlaidConfig, endpoint: string, body: Record<string, unknown>): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${config.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': config.clientId,
        'PLAID-SECRET': config.secret,
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new OpenBankingProviderError('Plaid could not be reached')
  }

  const payload = await response.json().catch(() => ({})) as T & { error_code?: string }
  if (!response.ok) throw new OpenBankingProviderError(payload.error_code || 'Plaid rejected the request')
  return payload
}

function tokenDigest(linkToken: string): string {
  return crypto.createHash('sha256').update(linkToken).digest('hex')
}

export async function createBankConnectionSession({ userId, consentVersion }: { userId: string; consentVersion: string }) {
  const config = plaidConfig()
  encryptionKey()
  const response = await plaidRequest<{ link_token: string; expiration: string }>(config, '/link/token/create', {
    client_name: config.clientName,
    language: 'en',
    country_codes: config.countryCodes,
    products: config.products,
    user: { client_user_id: userId },
    ...(config.webhook ? { webhook: config.webhook } : {}),
    ...(config.redirectUri ? { redirect_uri: config.redirectUri } : {}),
  })

  const { data, error } = await serviceClient().from('bank_connection_sessions').insert({
    user_id: userId,
    provider: 'plaid',
    consent_version: consentVersion,
    link_token_digest: tokenDigest(response.link_token),
    expires_at: response.expiration,
  }).select('id, expires_at').single()

  if (error || !data) throw new OpenBankingUnavailableError('Open-banking storage is unavailable')
  return { sessionId: data.id as string, linkToken: response.link_token, expiration: data.expires_at as string }
}

export async function exchangePublicToken({ userId, sessionId, publicToken }: { userId: string; sessionId: string; publicToken: string }) {
  const storage = serviceClient()
  const { data, error } = await storage.from('bank_connection_sessions').select(
    'id, user_id, provider, consent_version, consented_at, expires_at, status'
  ).eq('id', sessionId).eq('user_id', userId).maybeSingle<BankConnectionSession>()

  if (error) throw new OpenBankingUnavailableError('Open-banking storage is unavailable')
  if (!data || data.status !== 'created' || new Date(data.expires_at).getTime() <= Date.now()) {
    throw new OpenBankingProviderError('The bank connection session is invalid or expired')
  }

  const config = plaidConfig()
  const token = await plaidRequest<{ access_token: string; item_id: string }>(config, '/item/public_token/exchange', {
    public_token: publicToken,
  })
  const encrypted = encryptAccessToken(token.access_token)

  const { error: connectionError } = await storage.from('bank_connections').upsert({
    user_id: userId,
    provider: 'plaid',
    provider_item_id: token.item_id,
    encrypted_access_token: encrypted.encryptedAccessToken,
    access_token_iv: encrypted.iv,
    access_token_tag: encrypted.tag,
    consent_version: data.consent_version,
    consented_at: data.consented_at,
    revoked_at: null,
  }, { onConflict: 'user_id,provider,provider_item_id' })
  if (connectionError) throw new OpenBankingUnavailableError('Open-banking storage is unavailable')

  const { error: sessionError } = await storage.from('bank_connection_sessions').update({ status: 'exchanged' }).eq('id', sessionId)
  if (sessionError) throw new OpenBankingUnavailableError('Open-banking storage is unavailable')

  return { provider: 'plaid' as const, itemId: token.item_id }
}
