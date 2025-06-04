/**
 * Configurações e utilitários para desenvolvimento local
 * 
 * Este arquivo permite executar a aplicação localmente sem dependências externas
 * quando as variáveis de desenvolvimento estão habilitadas.
 * 
 * Os dados mock são importados de src/__mocks__ para centralizar e evitar duplicação.
 * 
 * NOTA: Este arquivo serve como camada de compatibilidade para código legado.
 * Novos desenvolvimentos devem importar diretamente de @/__mocks__
 */

// Importar dados mock centralizados
export {
  mockUser,
  getMockUserData,
  mockWatchlistData,
  testUser,
} from '@/__mocks__/data/user'

export {
  mockPortfolioData,
  mockPortfolioDataForTests,
} from '@/__mocks__/data/portfolio'

export {
  mockStockPrices,
  simulateStockPrices,
  simulateStockPrice,
} from '@/__mocks__/data/stocks'

export {
  mockSimulations,
} from '@/__mocks__/data/simulations'

export {
  mockDelay,
  devLog,
  shouldUseMockData,
  shouldMockAuth,
  isDevelopmentMode,
  isMockAuth,
  isMockData,
} from '@/__mocks__/utils/helpers'

export {
  createMockAuth,
  createMockDb,
  createMockGoogleProvider,
} from '@/__mocks__/services/firebase'

// Re-importar para usar no export default
import {
  mockUser,
  getMockUserData,
  mockWatchlistData,
  mockPortfolioData,
  mockStockPrices,
  mockSimulations,
  simulateStockPrices,
  simulateStockPrice,
  shouldUseMockData,
  shouldMockAuth,
  isDevelopmentMode,
  isMockAuth,
  isMockData,
  mockDelay,
  devLog,
} from '@/__mocks__'

// Função específica para compatibilidade
export const getMockUser = () => {
  return mockUser
}

// Exportar tudo como default para compatibilidade com código legado
export default {
  // Funções de verificação
  isDevelopmentMode,
  isMockAuth,
  isMockData,
  shouldUseMockData,
  shouldMockAuth,
  
  // Dados mock
  mockUser,
  mockPortfolioData,
  mockWatchlistData,
  mockStockPrices,
  mockSimulations,
  
  // Funções utilitárias
  getMockUser,
  getMockUserData,
  mockDelay,
  devLog,
  simulateStockPrices,
  simulateStockPrice,
}
