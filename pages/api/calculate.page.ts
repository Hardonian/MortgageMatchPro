import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { buildPlan } from '../../lib/server/mortgage-math'

const inputSchema = z.object({
  annualIncome: z.coerce.number().positive().max(5_000_000),
  monthlyDebt: z.coerce.number().min(0).max(100_000).default(0),
  propertyPrice: z.coerce.number().positive().max(20_000_000),
  downPayment: z.coerce.number().min(0).max(20_000_000),
  interestRate: z.coerce.number().min(0.1).max(25),
  amortizationYears: z.coerce.number().int().min(5).max(35).default(25),
  annualPropertyTax: z.coerce.number().min(0).max(250_000).default(0),
  monthlyHeating: z.coerce.number().min(0).max(5_000).default(150),
  country: z.enum(['CA', 'US']).default('CA'),
}).refine((value) => value.downPayment < value.propertyPrice, {
  message: 'Down payment must be less than the property price',
  path: ['downPayment'],
})

const round1 = (value: number) => Number(value.toFixed(1))

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const parsed = inputSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid calculation inputs',
      details: parsed.error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
    })
  }

  const input = parsed.data
  // This is a planning estimate, not an underwriting or lending decision.
  const plan = buildPlan(input)

  return res.status(200).json({
    calculationVersion: '2026.2',
    currency: input.country === 'CA' ? 'CAD' : 'USD',
    monthlyPayment: Math.round(plan.monthlyPayment),
    principal: Math.round(plan.principal),
    totalMortgage: Math.round(plan.totalMortgage),
    mortgageInsurance: {
      required: plan.insurancePremiumRate > 0,
      eligible: plan.isEligibleForDefaultInsurance,
      premiumRate: plan.insurancePremiumRate,
      premium: Math.round(plan.insurancePremium),
    },
    minimumDownPayment: plan.minimumDownPayment === null ? null : Math.ceil(plan.minimumDownPayment),
    hasMinimumDownPayment: plan.hasMinimumDownPayment,
    gdsRatio: round1(plan.gdsRatio),
    tdsRatio: round1(plan.tdsRatio),
    stressTestGdsRatio: round1(plan.stressTestGdsRatio),
    stressTestTdsRatio: round1(plan.stressTestTdsRatio),
    frontEndLimit: plan.frontEndLimit,
    backEndLimit: plan.backEndLimit,
    qualifyingRate: Number(plan.qualifyingRate.toFixed(2)),
    maxAffordable: Math.round(plan.maxAffordable),
    isWithinPlanningRange: plan.isWithinPlanningRange,
    warnings: plan.warnings,
    assumptions: {
      compounding: input.country === 'CA' ? 'semi-annual (Interest Act)' : 'monthly',
      amortizationYears: input.amortizationYears,
      annualPropertyTax: input.annualPropertyTax,
      monthlyHeating: input.monthlyHeating,
      qualificationRule: input.country === 'CA'
        ? 'Stress-tested at the greater of contract + 2% or 5.25% (GDS ≤ 39%, TDS ≤ 44%)'
        : 'Standard conforming debt-to-income planning thresholds (Front-end ≤ 28%, Back-end ≤ 36%)',
    },
    disclaimer: 'Illustrative planning estimate only. Rates, qualification rules, property taxes, fees, income treatment, and lender policies vary. Speak with a licensed mortgage professional before making decisions.',
  })
}
