/**
 * Dados mock de usuário para testes
 * Re-exporta dados do development.ts com extensões específicas para testes
 */
import { UserData, WatchlistItem } from "@/core/types"
import { 
  mockUser as baseMockUser, 
  mockPortfolioData, 
  mockWatchlistData
} from '@/core/utils/development';

// Re-exporta o usuario base com extensões para testes
export const mockUser = {
  ...baseMockUser,
  emailVerified: true,
  isAnonymous: false,
  metadata: {
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  providerData: [{
    providerId: 'google.com',
    uid: baseMockUser.uid,
    displayName: baseMockUser.displayName,
    email: baseMockUser.email,
    photoURL: baseMockUser.photoURL,
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
  }
}

// Re-exportar dados básicos do development.ts
export {
  mockWatchlistData,
  mockPortfolioData,
} from '@/core/utils/development';
