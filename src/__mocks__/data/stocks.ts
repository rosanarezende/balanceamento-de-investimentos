/**
 * Dados mock de preços de ações
 * 
 * Este arquivo agora re-exporta dados do development.ts e adiciona
 * apenas dados específicos para testes.
 */

// Re-exportar dados básicos do development.ts
export {
  mockStockPrices,
  simulateStockPrices,
  simulateStockPrice
} from '@/core/utils/development';
