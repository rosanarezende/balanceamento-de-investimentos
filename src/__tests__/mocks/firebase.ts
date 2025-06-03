/**
 * Mocks do Firebase Auth e outras funcionalidades para testes
 *
 * Este arquivo complementa os mocks globais definidos no jest.setup.js
 * fornecendo helpers específicos e configurações personalizadas
 */

// Obter os mocks globais
const mockFirebaseConfig = jest.requireMock('@/services/firebase/config');

// Exportar o mock auth para uso nos testes
export const mockAuth = mockFirebaseConfig.auth;

// Mock do usuário autenticado
export const mockUser = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
};

// Helper para configurar mock de usuário logado
export const mockAuthenticatedUser = () => {
  mockAuth.currentUser = mockUser;

  // Configurar o onAuthStateChanged para chamar imediatamente com o usuário
  mockAuth.onAuthStateChanged.mockImplementation((callback: (user: any) => void) => {
    if (typeof callback === 'function') {
      setTimeout(() => callback(mockUser), 0);
    }
    return jest.fn(); // unsubscribe function
  });
};

// Helper para configurar mock de usuário não logado
export const mockUnauthenticatedUser = () => {
  mockAuth.currentUser = null;

  // Configurar o onAuthStateChanged para chamar imediatamente com null
  mockAuth.onAuthStateChanged.mockImplementation((callback: (user: any) => void) => {
    if (typeof callback === 'function') {
      setTimeout(() => callback(null), 0);
    }
    return jest.fn(); // unsubscribe function
  });
};

// Helper para resetar todos os mocks do Firebase Auth
export const resetAllMocks = () => {
  // Resetar mocks das funções
  mockAuth.signInWithPopup.mockReset();
  mockAuth.signOut.mockReset();
  mockAuth.onAuthStateChanged.mockReset();

  // Resetar estado do usuário
  mockAuth.currentUser = null;
};

// Helper para configurar respostas de sucesso padrão
export const setupSuccessfulAuth = () => {
  mockAuth.signInWithPopup.mockResolvedValue({
    user: mockUser
  });

  mockAuth.signOut.mockResolvedValue(undefined);
};

// Helper para configurar erros de autenticação
export const setupAuthErrors = () => {
  mockAuth.signInWithPopup.mockRejectedValue(new Error('Popup closed'));
};
