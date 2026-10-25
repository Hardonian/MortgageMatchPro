import calculate from '../../pages/api/calculate.page'

function response() {
  const result = {
    setHeader: jest.fn(),
    status: jest.fn(),
    json: jest.fn(),
  }
  result.status.mockReturnValue(result)
  return result
}

describe('planning calculator', () => {
  it('returns a transparent deterministic plan for valid inputs', () => {
    const res = response()
    calculate({
      method: 'POST',
      body: {
        annualIncome: 125000,
        monthlyDebt: 450,
        propertyPrice: 750000,
        downPayment: 150000,
        interestRate: 4.79,
        amortizationYears: 25,
        annualPropertyTax: 5200,
        country: 'CA',
      },
    } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      calculationVersion: '2026.1',
      currency: 'CAD',
      monthlyPayment: expect.any(Number),
      maxAffordable: expect.any(Number),
      qualifyingRate: expect.any(Number),
      disclaimer: expect.stringContaining('Illustrative planning estimate'),
    }))
  })

  it('rejects a down payment greater than the purchase price', () => {
    const res = response()
    calculate({
      method: 'POST',
      body: {
        annualIncome: 125000,
        monthlyDebt: 0,
        propertyPrice: 500000,
        downPayment: 500000,
        interestRate: 4.79,
      },
    } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
  })
})
