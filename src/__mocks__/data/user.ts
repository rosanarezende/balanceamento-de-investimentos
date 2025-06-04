/**
 * Dados mock de usuário
 */
import { UserData, WatchlistItem } from "@/core/types"
import { mockPortfolioData } from '../'

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
} as any

// Dados adicionais para testes (mantendo compatibilidade)
export const testUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
}

// Watchlist mock
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

export const getMockUserData = (): UserData => {
  // Convert watchlist array to Record<string, WatchlistItem>
  const watchlistRecord: Record<string, WatchlistItem> = mockWatchlistData.reduce((acc, item) => {
    acc[item.ticker] = item
    return acc
  }, {} as Record<string, WatchlistItem>)

  return {
    email: mockUser.email,
    displayName: mockUser.displayName,
    portfolio: mockPortfolioData,
    watchlist: watchlistRecord,
    preferences: {
      theme: "dark" as const,
    },
  } as UserData
}
