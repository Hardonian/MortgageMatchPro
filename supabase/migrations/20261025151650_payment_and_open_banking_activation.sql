-- Payment and open-banking activation
--
-- These records are written only by trusted server code. In particular, bank
-- provider access tokens are encrypted before they reach this database and
-- are never exposed through the PostgREST API.

CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL CHECK (char_length(idempotency_key) BETWEEN 16 AND 255),
  request_fingerprint TEXT NOT NULL CHECK (char_length(request_fingerprint) = 64),
  product_code TEXT NOT NULL CHECK (product_code IN ('rate_check')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL CHECK (currency IN ('cad', 'usd')),
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'processing', 'succeeded', 'failed', 'canceled')),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  stripe_event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  error_code TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS bank_connection_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('plaid')),
  consent_version TEXT NOT NULL CHECK (char_length(consent_version) BETWEEN 1 AND 100),
  consented_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  link_token_digest TEXT NOT NULL CHECK (char_length(link_token_digest) = 64),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'exchanged', 'expired', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bank_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('plaid')),
  provider_item_id TEXT NOT NULL,
  encrypted_access_token TEXT NOT NULL,
  access_token_iv TEXT NOT NULL,
  access_token_tag TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider, provider_item_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_requests_user_created_at
  ON payment_requests (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_requests_stripe_payment_intent_id
  ON payment_requests (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_bank_connection_sessions_user_status
  ON bank_connection_sessions (user_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_bank_connections_user_active
  ON bank_connections (user_id, revoked_at) WHERE revoked_at IS NULL;

CREATE OR REPLACE FUNCTION set_payment_and_banking_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_requests_updated_at ON payment_requests;
CREATE TRIGGER payment_requests_updated_at
  BEFORE UPDATE ON payment_requests
  FOR EACH ROW EXECUTE FUNCTION set_payment_and_banking_updated_at();

DROP TRIGGER IF EXISTS bank_connection_sessions_updated_at ON bank_connection_sessions;
CREATE TRIGGER bank_connection_sessions_updated_at
  BEFORE UPDATE ON bank_connection_sessions
  FOR EACH ROW EXECUTE FUNCTION set_payment_and_banking_updated_at();

DROP TRIGGER IF EXISTS bank_connections_updated_at ON bank_connections;
CREATE TRIGGER bank_connections_updated_at
  BEFORE UPDATE ON bank_connections
  FOR EACH ROW EXECUTE FUNCTION set_payment_and_banking_updated_at();

ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connection_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_connections ENABLE ROW LEVEL SECURITY;

-- There is no browser-side use case for these records. The service-role key
-- bypasses RLS for the authenticated server routes; explicit revocation keeps
-- provider tokens and payment state out of the exposed API.
REVOKE ALL ON payment_requests, stripe_webhook_events, bank_connection_sessions, bank_connections FROM anon, authenticated;
