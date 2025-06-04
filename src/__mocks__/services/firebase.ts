/**
 * Mocks dos serviços Firebase para testes e desenvolvimento
 */

import { mockUser } from "../"

// Criar mocks Jest para as funções de autenticação
export const createMockAuth = () => ({
  currentUser: null,
  app: { name: '[DEFAULT]' },
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
})

export const createMockDb = () => ({})

export const createMockGoogleProvider = () => ({})

// Obter os mocks globais
const mockFirebaseConfig = jest.requireMock('@/services/firebase/config');

// Exportar o mock auth para uso nos testes
export const mockAuth = mockFirebaseConfig.auth;

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
