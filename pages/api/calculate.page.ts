import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

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

function monthlyPayment(principal: number, annualRate: number, months: number) {
  const rate = annualRate / 100 / 12
  if (rate === 0) return principal / months
  return principal * (rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
}

function presentValue(payment: number, annualRate: number, months: number) {
  const rate = annualRate / 100 / 12
  if (rate === 0) return payment * months
  return payment * (1 - Math.pow(1 + rate, -months)) / rate
}

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
  const months = input.amortizationYears * 12
  const principal = input.propertyPrice - input.downPayment
  const payment = monthlyPayment(principal, input.interestRate, months)
  const monthlyTax = input.annualPropertyTax / 12
  const grossMonthlyIncome = input.annualIncome / 12
  const housingCost = payment + monthlyTax + input.monthlyHeating
  const gdsRatio = grossMonthlyIncome ? (housingCost / grossMonthlyIncome) * 100 : 0
  const tdsRatio = grossMonthlyIncome ? ((housingCost + input.monthlyDebt) / grossMonthlyIncome) * 100 : 0

  // This is a planning estimate, not an underwriting or lending decision.
  const qualifyingRate = input.country === 'CA' ? Math.max(input.interestRate + 2, 5.25) : input.interestRate
  const maxHousingCost = Math.max(grossMonthlyIncome * 0.39 - input.monthlyDebt, 0)
  const maxMortgagePayment = Math.max(maxHousingCost - monthlyTax - input.monthlyHeating, 0)
  const maxAffordable = Math.max(
    presentValue(maxMortgagePayment, qualifyingRate, months) + input.downPayment,
    0
  )

  return res.status(200).json({
    calculationVersion: '2026.1',
    currency: input.country === 'CA' ? 'CAD' : 'USD',
    monthlyPayment: Math.round(payment),
    principal: Math.round(principal),
    gdsRatio: Number(gdsRatio.toFixed(1)),
    tdsRatio: Number(tdsRatio.toFixed(1)),
    qualifyingRate: Number(qualifyingRate.toFixed(2)),
    maxAffordable: Math.round(maxAffordable),
    isWithinPlanningRange: gdsRatio <= 39 && tdsRatio <= 44,
    assumptions: {
      amortizationYears: input.amortizationYears,
      annualPropertyTax: input.annualPropertyTax,
      monthlyHeating: input.monthlyHeating,
      qualificationRule: input.country === 'CA' ? 'Stress-tested at the greater of contract + 2% or 5.25%' : 'Illustrative debt-to-income planning threshold',
    },
    disclaimer: 'Illustrative planning estimate only. Rates, qualification rules, property taxes, fees, income treatment, and lender policies vary. Speak with a licensed mortgage professional before making decisions.',
  })
}
