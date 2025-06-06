/**
 * Utilitários para modo de desenvolvimento
 * 
 * Este arquivo contém funções utilitárias que podem ser usadas tanto
 * em produção quanto em desenvolvimento, sem referências ao Jest.
 */

import type { User } from "firebase/auth";
import type { UserData, Portfolio, WatchlistItem } from "@/core/types";
import type { Simulation } from "@/core/schemas/stock";

// Estado interno para override em testes
let mockAuthOverride: boolean | null = null;
let developmentModeOverride: boolean | null = null;

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

// Helper para verificar se devemos usar dados mock
export const shouldUseMockData = (): boolean => {
  return isDevelopmentMode() && 
         process.env.NEXT_PUBLIC_MOCK_DATA === 'true';
};

// Helper para verificar se devemos usar auth mock (com override para testes)
export const shouldMockAuth = (): boolean => {
  if (mockAuthOverride !== null) {
    return mockAuthOverride;
  }
  return isDevelopmentMode() && 
         process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
};

// Verificar se estamos em modo de desenvolvimento (com override para testes)
export const isDevelopmentMode = (): boolean => {
  if (developmentModeOverride !== null) {
    return developmentModeOverride;
  }
  return process.env.NEXT_PUBLIC_DEVELOPMENT_MODE === 'true';
};

// Funções para override em testes
export const setMockAuthOverride = (value: boolean | null): void => {
  mockAuthOverride = value;
};

export const setDevelopmentModeOverride = (value: boolean | null): void => {
  developmentModeOverride = value;
};

// Resetar overrides
export const resetOverrides = (): void => {
  mockAuthOverride = null;
  developmentModeOverride = null;
};

export const isMockAuth = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_AUTH === 'true';
};

export const isMockData = (): boolean => {
  return process.env.NEXT_PUBLIC_MOCK_DATA === 'true';
};

// Dados mock para desenvolvimento
export const mockUser: Partial<User> = {
  uid: 'dev-user-123',
  email: 'dev@example.com',
  displayName: 'Usuário de Desenvolvimento',
  photoURL: null,
};

export const getMockUserData = (): UserData => ({
  email: mockUser.email || null,
  displayName: mockUser.displayName || null,
  portfolio: mockPortfolioData,
  watchlist: {},
  preferences: {
    theme: "dark",
  },
});

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
}

export const simulateStockPrices = (tickers: string[]): Record<string, number> => {
  return tickers.reduce((acc, ticker) => {
    acc[ticker] = simulateStockPrice(ticker);
    return acc;
  }, {} as Record<string, number>);
}

export const simulateStockPrice = (ticker: string): number => {
  // Usar preço mock se disponível, senão gerar preço entre R$10 e R$100
  return mockStockPrices[ticker] || (Math.random() * 90 + 10)
}

// Dados mock adicionais para desenvolvimento
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
]

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
