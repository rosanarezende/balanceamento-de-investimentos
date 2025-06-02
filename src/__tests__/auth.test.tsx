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
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginPage from '@/app/login/page'
import { TestWrapper } from '@/src/__tests__/helpers/test-wrapper'
import { 
  mockAuth, 
  mockUser, 
  mockAuthenticatedUser, 
  mockUnauthenticatedUser,
  resetAllMocks 
} from '@/src/__tests__/mocks/firebase'
import { 
  fillLoginForm, 
  expectErrorToast, 
  expectSuccessToast,
  waitForElement 
} from '@/src/__tests__/helpers/test-utils'

// Mocks dos serviços
jest.mock('firebase/auth')
jest.mock('firebase/firestore')
jest.mock('next/navigation')

describe('Testes de Autenticação', () => {
  // Mock do Next.js navigation
  const mockRouter = { push: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }
  const mockPush = jest.fn()
  
  beforeEach(() => {
    resetAllMocks()
    
    // Setup mocks básicos
    jest.requireMock('next/navigation').useRouter.mockReturnValue(mockRouter)
    jest.requireMock('next/navigation').usePathname.mockReturnValue('/login')
    jest.requireMock('next/navigation').useSearchParams.mockReturnValue(new URLSearchParams())
    
    // Mock do Firebase Auth
    Object.assign(jest.requireMock('firebase/auth'), mockAuth)
    
    // Mock do Firestore
    const mockFirestore = jest.requireMock('firebase/firestore')
    mockFirestore.getFirestore.mockReturnValue({})
    mockFirestore.doc.mockImplementation((db, path) => ({ id: path, path }))
    mockFirestore.getDoc.mockResolvedValue({ exists: () => false, data: () => undefined })
    mockFirestore.setDoc.mockResolvedValue(undefined)
    mockFirestore.serverTimestamp.mockReturnValue(new Date())
    
    // Estado inicial - usuário não autenticado
    mockUnauthenticatedUser()
  })

  describe('Login com Email e Senha', () => {
    it('deve permitir login com credenciais válidas', async () => {
      // Arrange
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('test@example.com', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert
      await waitFor(() => {
        expect(mockAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.any(Object),
          'test@example.com',
          'password123'
        )
      })
    })

    it('deve exibir erro para credenciais inválidas', async () => {
      // Arrange
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(
        new Error('auth/invalid-credential')
      )

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('invalid@example.com', 'wrongpassword')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert
      await expectErrorToast()
    })

    it('deve validar campos obrigatórios', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Tentar fazer login sem preencher campos
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Deve exibir erros de validação
      await waitFor(() => {
        expect(screen.getByText(/email.*obrigatório|campo.*obrigatório/i)).toBeInTheDocument()
      })
    })

    it('deve validar formato de email', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Preencher com email inválido
      await fillLoginForm('email-invalido', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Deve exibir erro de formato
      await waitFor(() => {
        expect(screen.getByText(/email.*inválido|formato.*inválido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Login com Google', () => {
    it('deve permitir login com Google', async () => {
      // Arrange
      mockAuth.signInWithPopup.mockResolvedValue({
        user: mockUser
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      const googleLoginButton = screen.getByText(/login.*google|entrar.*google/i)
      await userEvent.click(googleLoginButton)

      // Assert
      await waitFor(() => {
        expect(mockAuth.signInWithPopup).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(Object) // GoogleAuthProvider instance
        )
      })
    })

    it('deve tratar erro no login com Google', async () => {
      // Arrange
      mockAuth.signInWithPopup.mockRejectedValue(
        new Error('auth/popup-closed-by-user')
      )

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      const googleLoginButton = screen.getByText(/login.*google|entrar.*google/i)
      await userEvent.click(googleLoginButton)

      // Assert
      await expectErrorToast()
    })

    it('deve lidar com popup bloqueado', async () => {
      // Arrange
      mockAuth.signInWithPopup.mockRejectedValue(
        new Error('auth/popup-blocked')
      )

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      const googleLoginButton = screen.getByText(/login.*google|entrar.*google/i)
      await userEvent.click(googleLoginButton)

      // Assert
      await expectErrorToast('popup.*bloqueado|bloqueio.*popup')
    })
  })

  describe('Estados de Loading', () => {
    it('deve exibir loading durante o login', async () => {
      // Arrange - simular delay no login
      mockAuth.signInWithEmailAndPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ user: mockUser }), 100))
      )

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('test@example.com', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert - deve mostrar loading
      expect(screen.getByText(/carregando|loading/i)).toBeInTheDocument()

      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.queryByText(/carregando|loading/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('deve desabilitar botão durante loading', async () => {
      // Arrange
      mockAuth.signInWithEmailAndPassword.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ user: mockUser }), 100))
      )

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('test@example.com', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert
      expect(loginButton).toBeDisabled()
    })
  })

  describe('Redirecionamento após Login', () => {
    it('deve redirecionar para dashboard após login bem-sucedido', async () => {
      // Arrange
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('test@example.com', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('deve redirecionar para página específica se especificada na URL', async () => {
      // Arrange
      jest.requireMock('next/navigation').useSearchParams.mockReturnValue(
        new URLSearchParams('?redirect=/calculadora-balanceamento')
      )
      
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('test@example.com', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/calculadora-balanceamento')
      })
    })
  })

  describe('Persistência de Estado', () => {
    it('deve persistir estado de autenticação no localStorage', async () => {
      // Arrange
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: mockUser
      })

      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Act
      await fillLoginForm('test@example.com', 'password123')
      
      const loginButton = screen.getByRole('button', { 
        name: (name) => name === 'Login' && !name.toLowerCase().includes('google')
      })
      await userEvent.click(loginButton)

      // Assert
      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith(
          expect.stringMatching(/user|auth/),
          expect.any(String)
        )
      })

      setItemSpy.mockRestore()
    })

    it('deve recuperar estado de autenticação do localStorage', async () => {
      // Arrange - simular dados no localStorage
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
      getItemSpy.mockReturnValue(JSON.stringify(mockUser))

      mockAuthenticatedUser()

      // Act
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Assert - usuário já autenticado deve ser redirecionado
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
      })

      getItemSpy.mockRestore()
    })
  })
})
