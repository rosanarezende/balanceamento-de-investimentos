/**
 * Configurações e utilitários para desenvolvimento local
 * 
 * Este arquivo permite executar a aplicação localmente sem dependências externas
 * quando as variáveis de desenvolvimento estão habilitadas.
 */
import { UserData, WatchlistItem } from "@/core/types";
import { Portfolio, Simulation } from "@/core/schemas/stock";

// Verificar se estamos em modo de desenvolvimento
export const isDevelopmentMode = (): boolean => {
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true';
};

export const isMockAuth = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
};

export const isMockData = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_DATA === 'true';
};

// Usuário mock para desenvolvimento
export const mockUser = {
  uid: 'dev-user-123',
  email: 'dev@example.com',
  displayName: 'Usuário Desenvolvimento',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  providerData: [{
    providerId: 'google.com',
    uid: 'dev-user-123',
    displayName: 'Usuário Desenvolvimento',
    email: 'dev@example.com',
    photoURL: null,
  }],
  refreshToken: 'mock-refresh-token',
  tenantId: null,
} as any;

// Dados mock de carteira para desenvolvimento
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
};

// Watchlist mock para desenvolvimento (deve ser array para compatibilidade com getMockUserData)
export const mockWatchlistData: WatchlistItem[] = [
  {
    ticker: 'NVDA',
    targetPrice: 500.00,
    notes: 'Esperando queda para comprar',
  },
  {
    ticker: 'META',
    targetPrice: 250.00,
    notes: 'Monitorando para entrada',
  },
];

// Preços mock para APIs de ações
export const mockStockPrices: Record<string, number> = {
  'AAPL': 15.00,
  'GOOGL': 25.00,
  'MSFT': 30.00,
  'AMZN': 32.00,
  'TSLA': 80.00,
  'NVDA': 4.50,
  'META': 28.00,
  'NFLX': 4.20,
  'AMD': 0.85,
  'INTC': 0.45,
};

// Simulações mock para histórico
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
];

// Helper para verificar se devemos usar dados mock
export const shouldUseMockData = (): boolean => {
  return isDevelopmentMode() && isMockData();
};

// Helper para verificar se devemos usar auth mock
export const shouldMockAuth = (): boolean => {
  return isDevelopmentMode() && isMockAuth();
};

// Funções para obter dados mock
export const getMockUser = () => {
  return mockUser;
};

export const getMockUserData = () => {
  // Convert watchlist array to Record<string, WatchlistItem>
  const watchlistRecord: Record<string, WatchlistItem> = mockWatchlistData.reduce((acc, item) => {
    acc[item.ticker] = item;
    return acc;
  }, {} as Record<string, WatchlistItem>);

  const mockUserData = {
    email: mockUser.email,
    displayName: mockUser.displayName,
    portfolio: mockPortfolioData,
    watchlist: watchlistRecord,
    preferences: {
      theme: "dark" as const,
    },
  };
  return mockUserData as UserData;
};

// Delay para simular operações assíncronas
export const mockDelay = (ms = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Logger para desenvolvimento
export const devLog = (message: string, data?: any): void => {
  if (isDevelopmentMode()) {
    console.log(`[DEV MODE] ${message}`, data || '');
  }
};

// ===== FUNÇÕES DE SIMULAÇÃO PARA DESENVOLVIMENTO =====

/**
 * Simula preços de ações (apenas para desenvolvimento)
 * @param tickers Lista de códigos de ações
 * @returns Objeto com preços simulados por ticker
 */
export const simulateStockPrices = (tickers: string[]): Record<string, number> => {
  return tickers.reduce((acc, ticker) => {
    acc[ticker] = simulateStockPrice(ticker);
    return acc;
  }, {} as Record<string, number>);
};

export const simulateStockPrice = (ticker: string): number => {
  // Usar preço mock se disponível, senão gerar preço entre R$10 e R$100
  return mockStockPrices[ticker] || (Math.random() * 90 + 10);
};

export default {
  isDevelopmentMode,
  isMockAuth,
  isMockData,
  mockUser,
  mockPortfolioData,
  mockWatchlistData,
  mockStockPrices,
  mockSimulations,
  shouldUseMockData,
  shouldMockAuth,
  getMockUser,
  getMockUserData,
  mockDelay,
  devLog,
  simulateStockPrices,
  simulateStockPrice,
};
