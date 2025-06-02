/**
 * Mocks do Firebase Auth e outras funcionalidades para testes
 */

// Mock do Firebase Auth
export const mockAuth = {
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  getAuth: jest.fn(() => ({ currentUser: null, app: {} })),
  GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  updateProfile: jest.fn(),
}

// Mock do usuário autenticado
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
}

// Helper para configurar mock de usuário logado
export const mockAuthenticatedUser = () => {
  mockAuth.getAuth.mockReturnValue({
    currentUser: mockUser,
    app: {},
  })
  
  mockAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(mockUser)
    return jest.fn() // unsubscribe function
  })
}

// Helper para configurar mock de usuário não logado
export const mockUnauthenticatedUser = () => {
  mockAuth.getAuth.mockReturnValue({
    currentUser: null,
    app: {},
  })
  
  mockAuth.onAuthStateChanged.mockImplementation((callback) => {
    callback(null)
    return jest.fn() // unsubscribe function
  })
}

// Helper para resetar todos os mocks
export const resetAllMocks = () => {
  Object.values(mockAuth).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset()
    }
  })
}
