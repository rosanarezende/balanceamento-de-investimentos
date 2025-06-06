/**
 * Dados mock de portfólio
 * 
 * Este arquivo agora re-exporta dados do development.ts e adiciona
 * apenas dados específicos para testes.
 */

// Re-exportar dados básicos do development.ts
export {
  mockPortfolioData
} from '@/core/utils/development';

// Dados adicionais específicos para testes
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
};
