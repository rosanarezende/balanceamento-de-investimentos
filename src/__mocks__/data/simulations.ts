/**
 * Dados mock de simulações
 */
import { Simulation } from "@/core/schemas/stock"

export const mockSimulations: Simulation[] = [
  {
    id: 'sim-1',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    investmentAmount: 10000,
    portfolioValueBefore: 44000,
    portfolioValueAfter: 45000,
    allocations: [
      {
        investmentAmount: 7500,
        ticker: 'AAPL',
        currentValue: 7000,
        currentPercentage: 16,
        targetPercentage: 30,
        currentQuantity: 5,
        newQuantity: 10,
        quantityToAcquire: 5,
        currentPrice: 150.00,
        isEligibleForInvestment: true,
        userRecommendation: 'Comprar'
      },
      {
        investmentAmount: 2500,
        ticker: 'GOOGL',
        currentValue: 12500,
        currentPercentage: 28,
        targetPercentage: 25,
        currentQuantity: 2,
        newQuantity: 1,
        quantityToAcquire: -1,
        currentPrice: 2500.00,
        isEligibleForInvestment: false,
        userRecommendation: 'Vender'
      }
    ]
  },
  {
    id: 'sim-2',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    investmentAmount: 5000,
    portfolioValueBefore: 42000,
    portfolioValueAfter: 43000,
    allocations: [
      {
        investmentAmount: 5000,
        ticker: 'MSFT',
        currentValue: 2400,
        currentPercentage: 6,
        targetPercentage: 20,
        currentQuantity: 8,
        newQuantity: 8,
        quantityToAcquire: 0,
        currentPrice: 300.00,
        isEligibleForInvestment: true,
        userRecommendation: 'Comprar'
      }
    ]
  },
]
