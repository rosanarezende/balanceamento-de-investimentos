/**
 * Dados mock de portfólio
 */
import { Portfolio } from "@/core/schemas/stock"

export const mockPortfolioData: Portfolio = {
  'AAPL': {
    quantity: 10,
    targetPercentage: 30,
    userRecommendation: 'Comprar' as const,
  },
  'GOOGL': {
    quantity: 5,
    targetPercentage: 25,
    userRecommendation: 'Aguardar' as const,
  },
  'MSFT': {
    quantity: 8,
    targetPercentage: 20,
    userRecommendation: 'Comprar' as const,
  },
  'AMZN': {
    quantity: 3,
    targetPercentage: 15,
    userRecommendation: 'Aguardar' as const,
  },
  'TSLA': {
    quantity: 4,
    targetPercentage: 10,
    userRecommendation: 'Vender' as const,
  },
}

// Dados adicionais para testes específicos
export const mockPortfolioDataForTests = {
  'AAPL': {
    ticker: 'AAPL',
    quantity: 10,
    targetPercentage: 30,
    userRecommendation: 'Comprar' as const,
    name: 'Apple Inc.'
  },
  'GOOGL': {
    ticker: 'GOOGL',
    quantity: 5,
    targetPercentage: 25,
    userRecommendation: 'Manter' as const,
    name: 'Alphabet Inc.'
  }
}
