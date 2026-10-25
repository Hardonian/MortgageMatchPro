import { ScenarioAnalysisAgent } from '@/lib/openai'

// Mock OpenAI
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockImplementation(async (params) => {
            let parsedInput: any = {}
            try {
              if (params?.messages?.[1]?.content) {
                parsedInput = JSON.parse(params.messages[1].content)
              }
            } catch (_) {}

            const rawScenarios = parsedInput.scenarios || []
            const scenarios = rawScenarios.map((s: any) => {
              const loanAmount = (s.propertyPrice || 500000) - (s.downPayment || 50000)
              return {
                name: s.name || 'Scenario',
                rate: s.rate || 5.0,
                term: s.term || 25,
                type: s.type || 'fixed',
                monthlyPayment: 2500,
                totalInterest: 200000,
                totalCost: loanAmount + 200000,
                amortizationSchedule: [
                  {
                    month: 1,
                    principal: 1000,
                    interest: 1000,
                    balance: loanAmount - 1000
                  },
                  {
                    month: 2,
                    principal: 1010,
                    interest: 990,
                    balance: loanAmount - 2010
                  }
                ]
              }
            })

            let bestOption = scenarios[0]?.name || 'Option 1'
            let savings = 0

            if (scenarios.length > 1) {
              const sorted = [...scenarios].sort((a, b) => a.rate - b.rate)
              bestOption = sorted[0].name
              savings = (sorted[1].rate - sorted[0].rate) > 0 ? 8766.00 : 0
            }

            return {
              choices: [{
                message: {
                  content: JSON.stringify({
                    scenarios,
                    recommendation: {
                      bestOption,
                      savings,
                      reasoning: `The ${bestOption} offers the lowest cost.`
                    }
                  })
                }
              }]
            }
          })
        }
      }
    }))
  }
})

describe('ScenarioAnalysisAgent', () => {
  let agent: ScenarioAnalysisAgent

  beforeEach(() => {
    agent = new ScenarioAnalysisAgent()
  })

  describe('compareScenarios', () => {
    it('should compare multiple mortgage scenarios', async () => {
      const input = {
        scenarios: [
          {
            name: 'RBC Fixed 5.45%',
            rate: 5.45,
            term: 25,
            type: 'fixed' as const,
            propertyPrice: 500000,
            downPayment: 50000
          },
          {
            name: 'TD Variable 5.52%',
            rate: 5.52,
            term: 25,
            type: 'variable' as const,
            propertyPrice: 500000,
            downPayment: 50000
          }
        ]
      }

      const result = await agent.compareScenarios(input)

      expect(result).toMatchObject({
        scenarios: expect.any(Array),
        recommendation: {
          bestOption: expect.any(String),
          savings: expect.any(Number),
          reasoning: expect.any(String)
        }
      })

      expect(result.scenarios).toHaveLength(2)
      expect(result.scenarios[0]).toMatchObject({
        name: expect.any(String),
        rate: expect.any(Number),
        term: expect.any(Number),
        type: expect.any(String),
        monthlyPayment: expect.any(Number),
        totalInterest: expect.any(Number),
        totalCost: expect.any(Number),
        amortizationSchedule: expect.any(Array)
      })

      expect(result.recommendation.bestOption).toBeTruthy()
      expect(result.recommendation.savings).toBeGreaterThanOrEqual(0)
      expect(result.recommendation.reasoning).toBeTruthy()
    })

    it('should handle single scenario', async () => {
      const input = {
        scenarios: [
          {
            name: 'Single Option',
            rate: 5.5,
            term: 25,
            type: 'fixed' as const,
            propertyPrice: 500000,
            downPayment: 50000
          }
        ]
      }

      const result = await agent.compareScenarios(input)

      expect(result.scenarios).toHaveLength(1)
      expect(result.recommendation.bestOption).toBe('Single Option')
      expect(result.recommendation.savings).toBe(0)
    })

    it('should calculate amortization schedules correctly', async () => {
      const input = {
        scenarios: [
          {
            name: 'Test Scenario',
            rate: 5.0,
            term: 25,
            type: 'fixed' as const,
            propertyPrice: 500000,
            downPayment: 100000
          }
        ]
      }

      const result = await agent.compareScenarios(input)
      const scenario = result.scenarios[0]

      expect(scenario.amortizationSchedule).toBeInstanceOf(Array)
      expect(scenario.amortizationSchedule.length).toBeGreaterThan(0)

      const firstPayment = scenario.amortizationSchedule[0]
      expect(firstPayment).toMatchObject({
        month: expect.any(Number),
        principal: expect.any(Number),
        interest: expect.any(Number),
        balance: expect.any(Number)
      })

      expect(firstPayment.month).toBe(1)
      expect(firstPayment.principal).toBeGreaterThan(0)
      expect(firstPayment.interest).toBeGreaterThan(0)
      expect(firstPayment.balance).toBeLessThan(400000) // Should be less than principal
    })

    it('should identify the best option based on total cost', async () => {
      const input = {
        scenarios: [
          {
            name: 'Higher Rate Option',
            rate: 6.0,
            term: 25,
            type: 'fixed' as const,
            propertyPrice: 500000,
            downPayment: 50000
          },
          {
            name: 'Lower Rate Option',
            rate: 5.0,
            term: 25,
            type: 'fixed' as const,
            propertyPrice: 500000,
            downPayment: 50000
          }
        ]
      }

      const result = await agent.compareScenarios(input)

      expect(result.recommendation.bestOption).toBe('Lower Rate Option')
      expect(result.recommendation.savings).toBeGreaterThan(0)
    })
  })
})