/**
 * Pure mortgage planning math. No I/O, so every rule here is unit-tested.
 *
 * Canadian rules modelled (planning estimates, not underwriting):
 *  - Interest Act: fixed-rate mortgages compound semi-annually, not in advance.
 *  - Minimum down payment: 5% of the first $500k, 10% of the portion up to
 *    $1.5M; 20% at or above $1.5M (insured price cap raised Dec 15, 2024).
 *  - Default insurance (CMHC-style premium schedule) when down payment < 20%,
 *    with the premium added to the mortgage balance.
 *  - Qualification uses the stress-test rate for both GDS (39%) and TDS (44%).
 */

export type Country = 'CA' | 'US'

export const CA_GDS_LIMIT = 39
export const CA_TDS_LIMIT = 44
export const US_FRONT_END_LIMIT = 28
export const US_BACK_END_LIMIT = 36

export const INSURED_PRICE_CAP = 1_500_000
export const STRESS_TEST_FLOOR = 5.25
export const STRESS_TEST_BUFFER = 2

/** Allowable front-end housing expense ratio by country (GDS for CA, Front-end DTI for US). */
export function frontEndLimit(country: Country): number {
  return country === 'CA' ? CA_GDS_LIMIT : US_FRONT_END_LIMIT
}

/** Allowable back-end total debt-to-income ratio by country (TDS for CA, Back-end DTI for US). */
export function backEndLimit(country: Country): number {
  return country === 'CA' ? CA_TDS_LIMIT : US_BACK_END_LIMIT
}

/** Effective monthly rate from a nominal annual percentage rate. */
export function monthlyRate(annualRatePct: number, country: Country): number {
  const nominal = annualRatePct / 100
  if (nominal === 0) return 0
  return country === 'CA' ? Math.pow(1 + nominal / 2, 1 / 6) - 1 : nominal / 12
}

export function monthlyPayment(principal: number, annualRatePct: number, months: number, country: Country): number {
  const rate = monthlyRate(annualRatePct, country)
  if (rate === 0) return principal / months
  return (principal * rate) / (1 - Math.pow(1 + rate, -months))
}

export function presentValue(payment: number, annualRatePct: number, months: number, country: Country): number {
  const rate = monthlyRate(annualRatePct, country)
  if (rate === 0) return payment * months
  return (payment * (1 - Math.pow(1 + rate, -months))) / rate
}

export function qualifyingRate(contractRatePct: number, country: Country): number {
  return country === 'CA' ? Math.max(contractRatePct + STRESS_TEST_BUFFER, STRESS_TEST_FLOOR) : contractRatePct
}

/** Canadian minimum down payment for a given purchase price. */
export function minimumDownPayment(price: number): number {
  if (price >= INSURED_PRICE_CAP) return price * 0.2
  if (price <= 500_000) return price * 0.05
  return 25_000 + (price - 500_000) * 0.1
}

/** Insurance premium rate (fraction of the loan) by loan-to-value; 0 when uninsured. */
export function insurancePremiumRate(ltv: number, amortizationYears: number): number {
  if (ltv <= 0.8) return 0
  let rate: number
  if (ltv <= 0.85) rate = 0.028
  else if (ltv <= 0.9) rate = 0.031
  else rate = 0.04
  // Surcharge for insured amortizations beyond 25 years.
  return amortizationYears > 25 ? rate + 0.002 : rate
}

export interface PlanInput {
  annualIncome: number
  monthlyDebt: number
  propertyPrice: number
  downPayment: number
  interestRate: number
  amortizationYears: number
  annualPropertyTax: number
  monthlyHeating: number
  country: Country
}

export interface MortgagePlan {
  principal: number
  insurancePremium: number
  insurancePremiumRate: number
  isEligibleForDefaultInsurance: boolean
  hasMinimumDownPayment: boolean
  totalMortgage: number
  monthlyPayment: number
  qualifyingRate: number
  gdsRatio: number
  tdsRatio: number
  stressTestGdsRatio: number
  stressTestTdsRatio: number
  frontEndLimit: number
  backEndLimit: number
  minimumDownPayment: number | null
  maxAffordable: number
  isWithinPlanningRange: boolean
  warnings: string[]
}

export function buildPlan(input: PlanInput): MortgagePlan {
  const { country } = input
  const months = input.amortizationYears * 12
  const principal = input.propertyPrice - input.downPayment
  const ltv = principal / input.propertyPrice
  const warnings: string[] = []

  let premiumRate = 0
  let minDown: number | null = null
  let eligibleForDefaultInsurance = false
  if (country === 'CA') {
    minDown = minimumDownPayment(input.propertyPrice)
    if (input.downPayment + 0.005 < minDown) {
      warnings.push(`Minimum down payment for this price is ${Math.ceil(minDown).toLocaleString('en-CA')}.`)
    }
    eligibleForDefaultInsurance = input.propertyPrice < INSURED_PRICE_CAP
    if (!eligibleForDefaultInsurance && ltv > 0.8) {
      warnings.push('Homes priced at $1.5M or more require at least 20% down and are not modelled with default insurance.')
    }
    premiumRate = eligibleForDefaultInsurance ? insurancePremiumRate(ltv, input.amortizationYears) : 0
    if (premiumRate > 0) {
      if (input.amortizationYears > 30) {
        warnings.push('Insured mortgages are limited to a 30-year amortization.')
      } else if (input.amortizationYears > 25) {
        warnings.push('Insured amortizations over 25 years are limited to first-time buyers and new builds.')
      }
    }
  }

  const insurancePremium = principal * premiumRate
  const totalMortgage = principal + insurancePremium
  const qRate = qualifyingRate(input.interestRate, country)

  const income = input.annualIncome / 12
  const fixedCosts = input.annualPropertyTax / 12 + input.monthlyHeating
  const ratios = (payment: number) => ({
    gds: income ? ((payment + fixedCosts) / income) * 100 : 0,
    tds: income ? ((payment + fixedCosts + input.monthlyDebt) / income) * 100 : 0,
  })

  const payment = monthlyPayment(totalMortgage, input.interestRate, months, country)
  const contract = ratios(payment)
  const stressed = ratios(monthlyPayment(totalMortgage, qRate, months, country))

  const feLimit = frontEndLimit(country)
  const beLimit = backEndLimit(country)

  // Front-end (GDS in CA) and Back-end (TDS in CA) are independent caps; the binding one sets the max payment.
  const maxPayment = Math.max(
    Math.min(income * (feLimit / 100) - fixedCosts, income * (beLimit / 100) - fixedCosts - input.monthlyDebt),
    0
  )
  const maxAffordable = presentValue(maxPayment, qRate, months, country) + input.downPayment

  return {
    principal,
    insurancePremium,
    insurancePremiumRate: premiumRate,
    isEligibleForDefaultInsurance: country !== 'CA' || eligibleForDefaultInsurance,
    hasMinimumDownPayment: minDown === null || input.downPayment + 0.005 >= minDown,
    totalMortgage,
    monthlyPayment: payment,
    qualifyingRate: qRate,
    gdsRatio: contract.gds,
    tdsRatio: contract.tds,
    stressTestGdsRatio: stressed.gds,
    stressTestTdsRatio: stressed.tds,
    frontEndLimit: feLimit,
    backEndLimit: beLimit,
    minimumDownPayment: minDown,
    maxAffordable,
    isWithinPlanningRange: stressed.gds <= feLimit && stressed.tds <= beLimit && warnings.length === 0,
    warnings,
  }
}
