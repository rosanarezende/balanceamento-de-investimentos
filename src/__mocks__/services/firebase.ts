/**
 * Mocks dos serviços Firebase para testes e desenvolvimento
 */

import { mockUser, mockPortfolioData } from "../"

// Obter os mocks globais definidos no jest.setup.js
export const mockFirebaseConfig = jest.requireMock('@/services/firebase/config');
export const mockFirestoreService = jest.requireMock('@/services/firebase/firestore')
export const mockFirebaseAuth = jest.requireMock('firebase/auth')
const mockFirebaseFirestoreLib = jest.requireMock('firebase/firestore')

// Exportar o mock auth para uso nos testes
export const mockAuth = mockFirebaseConfig.auth;

// Setup mocks do Firestore - configurar os valores de retorno
export const setupFirestoreMocks = () => {
  // Garantir que os mocks estão definidos corretamente
  if (mockFirestoreService.getUserPortfolio) {
    mockFirestoreService.getUserPortfolio.mockResolvedValue(mockPortfolioData)
  }
  if (mockFirestoreService.updateStock) {
    mockFirestoreService.updateStock.mockResolvedValue(true)
  }
  if (mockFirestoreService.removeStock) {
    mockFirestoreService.removeStock.mockResolvedValue(true)
  }
  if (mockFirestoreService.validateUserInput) {
    mockFirestoreService.validateUserInput.mockReturnValue(true)
  }
  if (mockFirestoreService.addStock) {
    mockFirestoreService.addStock.mockResolvedValue(true)
  }
  if (mockFirestoreService.createUserPortfolio) {
    mockFirestoreService.createUserPortfolio.mockResolvedValue(true)
  }
  if (mockFirestoreService.deleteUserPortfolio) {
    mockFirestoreService.deleteUserPortfolio.mockResolvedValue(true)
  }
  if (mockFirestoreService.getUserRecommendation) {
    mockFirestoreService.getUserRecommendation.mockResolvedValue(null)
  }
  if (mockFirestoreService.saveUserRecommendation) {
    mockFirestoreService.saveUserRecommendation.mockResolvedValue(true)
  }
  if (mockFirestoreService.deleteUserRecommendation) {
    mockFirestoreService.deleteUserRecommendation.mockResolvedValue(true)
  }
  if (mockFirestoreService.updateUserProfile) {
    mockFirestoreService.updateUserProfile.mockResolvedValue(true)
  }
  if (mockFirestoreService.getUserProfile) {
    mockFirestoreService.getUserProfile.mockResolvedValue(null)
  }
  if (mockFirestoreService.createUserProfile) {
    mockFirestoreService.createUserProfile.mockResolvedValue(true)
  }
  if (mockFirestoreService.saveManualRecommendation) {
    mockFirestoreService.saveManualRecommendation.mockResolvedValue(true)
  }
  if (mockFirestoreService.saveSimulation) {
    mockFirestoreService.saveSimulation.mockResolvedValue(true)
  }
  if (mockFirestoreService.getSimulations) {
    mockFirestoreService.getSimulations.mockResolvedValue([])
  }
  if (mockFirestoreService.getSimulation) {
    mockFirestoreService.getSimulation.mockResolvedValue(null)
  }
  if (mockFirestoreService.getUserWatchlist) {
    mockFirestoreService.getUserWatchlist.mockResolvedValue({})
  }
  if (mockFirestoreService.addToWatchlist) {
    mockFirestoreService.addToWatchlist.mockResolvedValue(true)
  }
  if (mockFirestoreService.updateWatchlistItem) {
    mockFirestoreService.updateWatchlistItem.mockResolvedValue(true)
  }
  if (mockFirestoreService.removeFromWatchlist) {
    mockFirestoreService.removeFromWatchlist.mockResolvedValue(true)
  }
  if (mockFirestoreService.saveUserPreferences) {
    mockFirestoreService.saveUserPreferences.mockResolvedValue(true)
  }
  if (mockFirestoreService.getUserPreferences) {
    mockFirestoreService.getUserPreferences.mockResolvedValue(null)
  }
}

export const setupFirebaseFirestoreMocks = () => {
  // Garantir que os mocks estão definidos corretamente
  if (mockFirebaseFirestoreLib.getFirestore) {
    mockFirebaseFirestoreLib.getFirestore.mockReturnValue({})
  }

  if (mockFirebaseFirestoreLib.doc) {
    mockFirebaseFirestoreLib.doc.mockImplementation(jest.fn((db, path, ...pathSegments) => {
      return { id: pathSegments.join('/') || path, path: `${path}/${pathSegments.join('/')}` }
    }))
  }

  if (mockFirebaseFirestoreLib.getDoc) {
    mockFirebaseFirestoreLib.getDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
      id: mockUser.uid
    })
  }

  if (mockFirebaseFirestoreLib.setDoc) {
    mockFirebaseFirestoreLib.setDoc.mockResolvedValue(undefined)
  }

  if (mockFirebaseFirestoreLib.serverTimestamp) {
    mockFirebaseFirestoreLib.serverTimestamp.mockReturnValue(new Date())
  }
}

// Helpers para configurar estados de autenticação
export const mockAuthenticatedUser = () => {
  mockAuth.currentUser = mockUser

  mockAuth.onAuthStateChanged.mockImplementation((callback: (user: any) => void) => {
    if (typeof callback === 'function') {
      setTimeout(() => callback(mockUser), 0)
    }
    return jest.fn() // unsubscribe function
  })
}

// Helper para configurar mock de usuário não logado
export const mockUnauthenticatedUser = () => {
  mockAuth.currentUser = null

  mockAuth.onAuthStateChanged.mockImplementation((callback: (user: any) => void) => {
    if (typeof callback === 'function') {
      setTimeout(() => callback(null), 0)
    }
    return jest.fn() // unsubscribe function
  })
}

// Helper para resetar todos os mocks do Firebase Auth
export const resetAuthMocks = () => {
  mockAuth.signInWithPopup.mockReset()
  mockAuth.signOut.mockReset()
  mockAuth.onAuthStateChanged.mockReset()
  mockAuth.currentUser = null
}

// Helper para configurar respostas de sucesso padrão
export const setupSuccessfulAuth = () => {
  mockAuth.signInWithPopup.mockResolvedValue({ user: mockUser })
  mockAuth.signOut.mockResolvedValue(undefined)
}

// Helper para configurar erros de autenticação
export const setupAuthErrors = () => {
  mockAuth.signInWithPopup.mockRejectedValue(new Error('Popup closed'))
}
