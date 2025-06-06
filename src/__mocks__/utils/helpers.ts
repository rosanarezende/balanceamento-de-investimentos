/**
 * Funções utilitárias para mocks
 * 
 * Este arquivo agora re-exporta as funções do development.ts e adiciona
 * apenas funcionalidades específicas para testes (como overrides).
 */

// Re-exportar apenas funções utilitárias do development.ts
export {
  mockDelay,
  devLog,
  shouldUseMockData,
  shouldMockAuth,
  isDevelopmentMode,
  isMockAuth,
  isMockData,
  simulateStockPrice,
  simulateStockPrices,
  setMockAuthOverride,
  setDevelopmentModeOverride,
  resetOverrides
} from '@/core/utils/development';

// Funções adicionais específicas para testes podem ser adicionadas aqui
// export const additionalTestHelper = () => { ... };
