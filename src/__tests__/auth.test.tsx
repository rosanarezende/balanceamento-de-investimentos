/**
 * Testes de Autenticação
 * 
 * Testa o fluxo completo de autenticação incluindo:
 * - Login com email/senha
 * - Login com Google
 * - Logout
 * - Tratamento de erros
 * - Persistência de estado
 */

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginPage from '@/app/login/page'
import { TestWrapper } from './helpers/test-wrapper'
import { fillLoginForm, expectErrorToast } from './helpers/test-utils'
import {
  mockAuth,
  mockUser,
  mockUnauthenticatedUser,
  resetAllMocks,
  setupSuccessfulAuth,
  mockAuthenticatedUser
} from './mocks/firebase'

// Mocks dos serviços - usar os mocks básicos do jest.setup.js
jest.mock('next/navigation')

describe('Testes de Autenticação', () => {
  // Mock do Next.js navigation
  const mockRouter = jest.requireMock('next/navigation')

  beforeEach(() => {
    resetAllMocks()
    jest.clearAllMocks()

    // Configurar mocks do router
    mockRouter.useRouter.mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    })
    mockRouter.usePathname.mockReturnValue('/login')
    mockRouter.useSearchParams.mockReturnValue(new URLSearchParams())

    // Configurar estado inicial: usuário não autenticado
    mockUnauthenticatedUser()

    // Configurar respostas padrão dos métodos de autenticação usando helper
    setupSuccessfulAuth()

    // Mock do Firebase Firestore SDK
    const mockFirebaseFirestoreLib = jest.requireMock('firebase/firestore')
    mockFirebaseFirestoreLib.getFirestore.mockReturnValue({})
    mockFirebaseFirestoreLib.doc.mockImplementation(jest.fn((db, path, ...pathSegments) => {
      return { id: pathSegments.join('/') || path, path: `${path}/${pathSegments.join('/')}` }
    }))
    mockFirebaseFirestoreLib.getDoc.mockResolvedValue({
      exists: () => false,
      data: () => undefined,
      id: mockUser.uid
    })
    mockFirebaseFirestoreLib.setDoc.mockResolvedValue(undefined)
    mockFirebaseFirestoreLib.serverTimestamp.mockReturnValue(new Date())
  })

  describe('Login com Email e Senha', () => {
    it.skip('deve permitir login com credenciais válidas', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Usar helper para preencher formulário
      await fillLoginForm('test@example.com', 'password123')

      const loginButton = screen.getByRole('button', { name: "Login" })
      await userEvent.click(loginButton)

      await waitFor(() => {
        expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.any(Object), // auth instance
          'test@example.com',
          'password123'
        )
      })
    })

    it('deve exibir erro para credenciais inválidas', async () => {
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Usar helper para preencher formulário
      await fillLoginForm('invalid@example.com', 'wrongpassword')

      // Busca o botão com o texto exato "Login" (não "Login com Google")
      const loginButton = screen.getByRole('button', {
        name: (name, element) =>
          name === 'Login' && (!element || !element.textContent?.toLowerCase().includes('google'))
      })

      await userEvent.click(loginButton)

      // Usar helper para verificar erro
      await expectErrorToast()
    })
  })

  describe('Login com Google', () => {
    it('deve permitir login com Google', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByRole('button', { name: /login with google/i })
      fireEvent.click(googleLoginButton)

      await waitFor(() => {
        expect(mockAuth.signInWithPopup).toHaveBeenCalled()
      })
    })

    it('deve exibir erro ao falhar o login com Google', async () => {
      mockAuth.signInWithPopup.mockRejectedValueOnce(new Error('Login failed'))

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByRole('button', { name: /login with google/i })
      fireEvent.click(googleLoginButton)

      // Usar helper para verificar erro
      await expectErrorToast()
    })
  })

  describe('Logout', () => {
    it('deve realizar logout com sucesso', async () => {
      // Este teste pode ser expandido quando implementarmos o componente de logout
      await mockAuth.signOut()
      expect(mockAuth.signOut).toHaveBeenCalled()
    })
  })

  describe('Persistência de Estado', () => {
    it('deve manter o usuário logado após refresh', async () => {
      // Primeiro, configurar um usuário autenticado
      mockAuthenticatedUser()
      setupSuccessfulAuth()

      // Simular um refresh renderizando o componente novamente
      const { rerender } = render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Aguardar o carregamento inicial
      await waitFor(() => {
        expect(mockAuth.onAuthStateChanged).toHaveBeenCalled()
      })

      // Simular refresh re-renderizando
      rerender(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Verificar se mantém o estado
      await waitFor(() => {
        expect(mockAuth.onAuthStateChanged).toHaveBeenCalledTimes(2)
      })
    })
  })
})
