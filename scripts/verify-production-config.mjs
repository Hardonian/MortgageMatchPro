const failures = []

function present(name) {
  return Boolean(process.env[name]?.trim())
}

function requireTogether(label, names) {
  const configured = names.filter(present)
  if (configured.length > 0 && configured.length !== names.length) {
    failures.push(`${label} is partially configured; set all of: ${names.join(', ')}`)
  }
}

requireTogether('Supabase server access', ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY'])
requireTogether('Stripe', ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'])

if (present('OPEN_BANKING_PROVIDER') && process.env.OPEN_BANKING_PROVIDER !== 'plaid') {
  failures.push('OPEN_BANKING_PROVIDER must be omitted or set to "plaid"')
}

if (process.env.OPEN_BANKING_PROVIDER === 'plaid') {
  requireTogether('Plaid', [
    'PLAID_CLIENT_ID',
    'PLAID_CLIENT_SECRET',
    'OPEN_BANKING_TOKEN_ENCRYPTION_KEY',
    'PLAID_WEBHOOK_URL',
    'PLAID_REDIRECT_URI',
  ])
}

if (present('OPEN_BANKING_TOKEN_ENCRYPTION_KEY')) {
  const value = process.env.OPEN_BANKING_TOKEN_ENCRYPTION_KEY
  const isHex = /^[0-9a-f]{64}$/i.test(value)
  const isBase64 = Buffer.from(value, 'base64').length === 32
  if (!isHex && !isBase64) failures.push('OPEN_BANKING_TOKEN_ENCRYPTION_KEY must be 32 bytes encoded as hex or base64')
}

if (failures.length) {
  console.error('Production configuration validation failed:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  const paymentState = present('STRIPE_SECRET_KEY') ? 'configured' : 'intentionally unavailable'
  const bankingState = process.env.OPEN_BANKING_PROVIDER === 'plaid' ? 'configured' : 'intentionally unavailable'
  console.log(`Production configuration shape is valid. Payments: ${paymentState}. Open banking: ${bankingState}.`)
}
