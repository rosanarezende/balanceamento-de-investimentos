/**
 * Mocks dos serviços Firebase para testes e desenvolvimento
 * 
 * Este arquivo centraliza todos os mocks relacionados ao Firebase,
 * incluindo Auth, Firestore e configurações globais
 */

import { mockUser, mockPortfolioData, setMockAuthOverride } from "../"

// Obter os mocks globais definidos no jest.setup.js
export const mockFirebaseConfig = jest.requireMock('@/services/firebase/config');
export const mockFirestoreService = jest.requireMock('@/services/firebase/firestore')
export const mockFirebaseAuth = jest.requireMock('firebase/auth')
const mockFirebaseFirestoreLib = jest.requireMock('firebase/firestore')

// Exportar o mock auth para uso nos testes
export const mockAuth = mockFirebaseConfig.auth;

/**
 * Mock centralizado do Firebase Auth
 * Deve ser chamado nos testes que precisam testar autenticação real
 */
export const setupFirebaseAuthMocks = () => {
  // Mock do firebase/auth diretamente para garantir que as funções sejam mockadas
  jest.doMock('firebase/auth', () => ({
    ...jest.requireActual('firebase/auth'),
    signInWithPopup: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChanged: jest.fn(() => jest.fn()), // Retorna uma função unsubscribe
    GoogleAuthProvider: jest.fn(),
    getAuth: jest.fn(),
  }))

  return jest.requireMock('firebase/auth')
}

/**
 * Obter o mock do signInWithPopup para configuração em testes
 */
export const getMockSignInWithPopup = () => {
  const firebaseAuth = jest.requireMock('firebase/auth')
  return firebaseAuth.signInWithPopup
}

/**
 * Helper para configurar modo de teste real (desabilita mock auth)
 */
export const setupRealAuthMode = () => {
  // Usar função de override em vez de mudar variável de ambiente
  setMockAuthOverride(false)

  return () => {
    setMockAuthOverride(null) // Restaurar comportamento original
  }
}

/**
 * Helper para configurar modo mock (habilita mock auth)
 */
export const setupMockAuthMode = () => {
  setMockAuthOverride(true)

  return () => {
    setMockAuthOverride(null) // Restaurar comportamento original
  }
}

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
