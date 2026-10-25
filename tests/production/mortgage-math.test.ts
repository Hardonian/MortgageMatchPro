import {
  buildPlan,
  insurancePremiumRate,
  minimumDownPayment,
  monthlyPayment,
  presentValue,
  qualifyingRate,
  type PlanInput,
} from '../../lib/server/mortgage-math'

const base: PlanInput = {
  annualIncome: 150_000,
  monthlyDebt: 0,
  propertyPrice: 625_000,
  downPayment: 125_000,
  interestRate: 5,
  amortizationYears: 25,
  annualPropertyTax: 0,
  monthlyHeating: 0,
  country: 'CA',
}

describe('mortgage math', () => {
  it('uses semi-annual compounding for Canadian payments', () => {
    // Industry reference: $500k, 5%, 25y => $2,908.02 (CA) vs $2,922.95 (US monthly).
    expect(monthlyPayment(500_000, 5, 300, 'CA')).toBeCloseTo(2908.02, 1)
    expect(monthlyPayment(500_000, 5, 300, 'US')).toBeCloseTo(2922.95, 1)
  })

  it('presentValue inverts monthlyPayment', () => {
    const pmt = monthlyPayment(400_000, 4.79, 300, 'CA')
    expect(presentValue(pmt, 4.79, 300, 'CA')).toBeCloseTo(400_000, 4)
    expect(monthlyPayment(120_000, 0, 120, 'CA')).toBe(1000)
  })

  it('applies the stress test floor and buffer', () => {
    expect(qualifyingRate(2.5, 'CA')).toBe(5.25)
    expect(qualifyingRate(4.79, 'CA')).toBeCloseTo(6.79)
    expect(qualifyingRate(4.79, 'US')).toBe(4.79)
  })

  it('computes the tiered Canadian minimum down payment', () => {
    expect(minimumDownPayment(400_000)).toBe(20_000)
    expect(minimumDownPayment(800_000)).toBe(55_000)
    expect(minimumDownPayment(1_500_000)).toBe(300_000)
  })

  it('prices default insurance by LTV with a >25y surcharge', () => {
    expect(insurancePremiumRate(0.8, 25)).toBe(0)
    expect(insurancePremiumRate(0.85, 25)).toBe(0.028)
    expect(insurancePremiumRate(0.9, 25)).toBe(0.031)
    expect(insurancePremiumRate(0.95, 25)).toBe(0.04)
    expect(insurancePremiumRate(0.95, 30)).toBeCloseTo(0.042)
  })

  it('adds the insurance premium to the mortgage for <20% down', () => {
    const plan = buildPlan({ ...base, propertyPrice: 500_000, downPayment: 25_000 })
    expect(plan.insurancePremium).toBeCloseTo(475_000 * 0.04)
    expect(plan.totalMortgage).toBeCloseTo(494_000)
    expect(plan.warnings).toHaveLength(0)
  })

  it('flags insufficient down payment and insured $1.5M+ purchases', () => {
    expect(buildPlan({ ...base, propertyPrice: 800_000, downPayment: 40_000 }).warnings[0])
      .toMatch(/Minimum down payment/)
    const jumbo = buildPlan({ ...base, annualIncome: 900_000, propertyPrice: 1_600_000, downPayment: 160_000 })
    expect(jumbo.isWithinPlanningRange).toBe(false)
    expect(jumbo.isEligibleForDefaultInsurance).toBe(false)
    expect(jumbo.insurancePremium).toBe(0)
    expect(jumbo.warnings.join(' ')).toMatch(/20% down/)
  })

  it('judges qualification on stress-tested ratios, not the contract rate', () => {
    // Find an income that passes at contract rate but fails at the qualifying rate.
    const plan = buildPlan({ ...base, annualIncome: 95_000 })
    expect(plan.gdsRatio).toBeLessThan(39)
    expect(plan.stressTestGdsRatio).toBeGreaterThan(39)
    expect(plan.isWithinPlanningRange).toBe(false)
  })

  it('treats GDS and TDS as independent caps for max affordability', () => {
    // With modest debt, GDS binds; debt must not reduce the GDS-limited amount.
    const noDebt = buildPlan(base).maxAffordable
    const smallDebt = buildPlan({ ...base, monthlyDebt: 300 }).maxAffordable
    expect(smallDebt).toBeCloseTo(noDebt, 0)
    // With heavy debt, TDS binds and the ceiling drops.
    expect(buildPlan({ ...base, monthlyDebt: 1_500 }).maxAffordable).toBeLessThan(noDebt)
  })

  it('max affordable price passes the stress test at its own limit', () => {
    const input = { ...base, downPayment: 300_000 } // keeps LTV < 80% (uninsured)
    const plan = buildPlan(input)
    const atMax = buildPlan({ ...input, propertyPrice: plan.maxAffordable - 1 })
    expect(atMax.insurancePremium).toBe(0)
    expect(atMax.stressTestGdsRatio).toBeLessThanOrEqual(39.01)
    expect(atMax.stressTestGdsRatio).toBeGreaterThan(38.9)
  })

  it('applies US conforming 28/36 DTI limits and monthly compounding', () => {
    const usPlan = buildPlan({ ...base, country: 'US', downPayment: 300_000 })
    expect(usPlan.frontEndLimit).toBe(28)
    expect(usPlan.backEndLimit).toBe(36)
    expect(usPlan.qualifyingRate).toBe(5) // No Canadian stress-test buffer
    expect(usPlan.minimumDownPayment).toBeNull()

    // High debt scenario where back-end 36% binds for US
    const usHighDebt = buildPlan({ ...base, country: 'US', monthlyDebt: 1200 })
    expect(usHighDebt.tdsRatio).toBeGreaterThan(36)
    expect(usHighDebt.isWithinPlanningRange).toBe(false)
  })
})
