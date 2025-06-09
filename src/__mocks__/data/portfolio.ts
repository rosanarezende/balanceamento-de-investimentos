/**
 * Dados mock de portfólio
 * 
 * Este arquivo re-exporta dados do development.ts e adiciona
 * dados específicos para testes, incluindo os novos campos:
 * precoTetoUsuario, precoMedioCompra e notasFundamentos
 */

import { Portfolio } from '@/core/types/portfolio';

// Re-exportar dados básicos do development.ts
export {
  mockPortfolioData
} from '@/core/utils/development';

// Dados adicionais específicos para testes com novos campos
export const mockPortfolioDataForTests: Portfolio = {
  'AAPL': {
    ticker: 'AAPL',
    quantity: 10,
    targetPercentage: 30,
    userRecommendation: 'Comprar',
    name: 'Apple Inc.',
    precoTetoUsuario: 18.50,
    precoMedioCompra: 12.75,
    notasFundamentos: 'Forte geração de caixa, dividendos crescentes. P/L: 28, ROE: 35%'
  },
  'GOOGL': {
    ticker: 'GOOGL',
    quantity: 5,
    targetPercentage: 25,
    userRecommendation: 'Aguardar',
    name: 'Alphabet Inc.',
    precoTetoUsuario: 30.00,
    precoMedioCompra: 22.50,
    notasFundamentos: 'Dominância em buscas, crescimento em cloud. Margem: 25%, Dívida/EBITDA: 0.3'
  },
  'MSFT': {
    ticker: 'MSFT',
    quantity: 8,
    targetPercentage: 20,
    userRecommendation: 'Comprar',
    name: 'Microsoft Corporation',
    precoTetoUsuario: 35.00,
    precoMedioCompra: 28.20,
    notasFundamentos: 'Crescimento em nuvem e IA. Dividend Yield: 1.2%, Crescimento 5 anos: 15%'
  },
  'AMZN': {
    ticker: 'AMZN',
    quantity: 3,
    targetPercentage: 15,
    userRecommendation: 'Aguardar',
    name: 'Amazon.com Inc.',
    precoTetoUsuario: 40.00,
    precoMedioCompra: 30.50,
    notasFundamentos: 'E-commerce e AWS. Margem operacional: 7%, Crescimento receita: 22%'
  },
  'TSLA': {
    ticker: 'TSLA',
    quantity: 4,
    targetPercentage: 10,
    userRecommendation: 'Vender',
    name: 'Tesla, Inc.',
    precoTetoUsuario: 60.00,
    precoMedioCompra: 75.30,
    notasFundamentos: 'Alta volatilidade, concorrência crescente. P/L: 60, Margem: 15%'
  }
};
