jest.mock('../../lib/server/auth', () => ({
  requireAuthenticatedUser: jest.fn(),
}))

jest.mock('../../lib/server/payments', () => ({
  createPaymentIntent: jest.fn(),
  IdempotencyConflictError: class IdempotencyConflictError extends Error {},
  PaymentsUnavailableError: class PaymentsUnavailableError extends Error {},
}))

jest.mock('../../lib/server/open-banking', () => ({
  createBankConnectionSession: jest.fn(),
  exchangePublicToken: jest.fn(),
  OpenBankingProviderError: class OpenBankingProviderError extends Error {},
  OpenBankingUnavailableError: class OpenBankingUnavailableError extends Error {},
}))

import createIntent from '../../pages/api/v2/payments/create-intent.page'
import connectBank from '../../pages/api/v2/open-banking/connect.page'
import exchangeBank from '../../pages/api/v2/open-banking/exchange.page'
import { requireAuthenticatedUser } from '../../lib/server/auth'
import { createPaymentIntent } from '../../lib/server/payments'
import { createBankConnectionSession, exchangePublicToken } from '../../lib/server/open-banking'

function response() {
  const result = { setHeader: jest.fn(), status: jest.fn(), json: jest.fn() }
  result.status.mockReturnValue(result)
  return result
}

describe('financial integration API guards', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireAuthenticatedUser as jest.Mock).mockResolvedValue({ id: '0d4a1f67-52af-4219-9d05-5c6d2bd3d6ed' })
  })

  it('requires a well-formed idempotency key before creating a payment', async () => {
    const res = response()
    await createIntent({ method: 'POST', headers: {}, body: { product: 'rate_check' } } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(createPaymentIntent).not.toHaveBeenCalled()
  })

  it('creates only the fixed catalog payment after authentication', async () => {
    ;(createPaymentIntent as jest.Mock).mockResolvedValue({
      paymentIntentId: 'pi_123', clientSecret: 'pi_123_secret_456', status: 'requires_payment_method',
    })
    const res = response()
    await createIntent({
      method: 'POST',
      headers: { 'idempotency-key': 'e6b167c7-aa85-4a5d-bf4e-44c252e3a8f5' },
      body: { product: 'rate_check' },
    } as any, res as any)

    expect(createPaymentIntent).toHaveBeenCalledWith(expect.objectContaining({ product: 'rate_check' }))
    expect(res.status).toHaveBeenCalledWith(201)
  })

  it('requires explicit versioned consent before issuing a bank link token', async () => {
    const res = response()
    await connectBank({ method: 'POST', body: {} } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(createBankConnectionSession).not.toHaveBeenCalled()
  })

  it('exchanges a bank token only with a user-bound connection session', async () => {
    ;(exchangePublicToken as jest.Mock).mockResolvedValue({ provider: 'plaid', itemId: 'item_123' })
    const res = response()
    await exchangeBank({
      method: 'POST',
      body: { sessionId: '87756519-c47e-443b-9d40-8b3115c89ec9', publicToken: 'public-sandbox-token' },
    } as any, res as any)

    expect(exchangePublicToken).toHaveBeenCalledWith(expect.objectContaining({
      userId: '0d4a1f67-52af-4219-9d05-5c6d2bd3d6ed',
      sessionId: '87756519-c47e-443b-9d40-8b3115c89ec9',
    }))
    expect(res.status).toHaveBeenCalledWith(201)
  })
})
