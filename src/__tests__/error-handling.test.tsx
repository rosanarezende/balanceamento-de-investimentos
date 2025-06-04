/**
 * Testes de Tratamento de Erros
 *
 * Testa como o sistema lida com diferentes tipos de erro:
 * - Erros de rede
 * - Erros de autenticação
 * - Erros de validação
 * - Erros da API
 * - Estados de erro e recuperação
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LoginPage from '@/app/login/page'
import CalculadoraBalanceamento from '@/app/calculadora-balanceamento/page'
import { StockList } from '@/components/stocks/stock-list'
import { AddStockForm } from '@/components/add-stock-form'
import { TestWrapper } from './helpers/test-wrapper'
import {
  mockAuth,
  mockAuthenticatedUser,
  mockUnauthenticatedUser,
  resetAllMocks
} from './mocks/firebase'
import {
  expectErrorToast,
} from './helpers/test-utils'

// Mocks dos serviços
jest.mock('@/services/firebase/firestore')
jest.mock('@/services/api/stock-price')
jest.mock('firebase/auth')
jest.mock('firebase/firestore')
jest.mock('next/navigation')

describe('Testes de Tratamento de Erros', () => {
  const mockFirestoreService = jest.requireMock('@/services/firebase/firestore')
  const mockStockPriceService = jest.requireMock('@/services/api/stock-price')

  beforeEach(() => {
    resetAllMocks()

    // Setup navigation
    const mockRouter = { push: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }
    jest.requireMock('next/navigation').useRouter.mockReturnValue(mockRouter)
    jest.requireMock('next/navigation').usePathname.mockReturnValue('/carteira')

    // Setup Firebase Auth
    Object.assign(jest.requireMock('firebase/auth'), mockAuth)

    // Setup Firestore base
    const mockFirestore = jest.requireMock('firebase/firestore')
    mockFirestore.getFirestore.mockReturnValue({})
    mockFirestore.doc.mockImplementation((db: any, path: any) => ({ id: path, path }))
    mockFirestore.getDoc.mockResolvedValue({ exists: () => false, data: () => undefined })
    mockFirestore.setDoc.mockResolvedValue(undefined)
    mockFirestore.serverTimestamp.mockReturnValue(new Date())
  })

  describe.skip('Erros de Autenticação', () => {
    beforeEach(() => {
      mockUnauthenticatedUser()
    })

    it('deve tratar erro de popup bloqueado no Google login', async () => {
      mockAuth.signInWithPopup.mockRejectedValue({
        code: 'auth/popup-blocked',
        message: 'Popup blocked'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByRole('button', { name: /continuar com google/i })
      await userEvent.click(googleLoginButton)

      await expectErrorToast('popup.*bloqueado|habilite.*popup')
    })

    it('deve tratar erro de popup fechado pelo usuário', async () => {
      mockAuth.signInWithPopup.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed by user'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByRole('button', { name: /continuar com google/i })
      await userEvent.click(googleLoginButton)

      // Este erro pode ser silencioso ou mostrar mensagem suave
      await waitFor(() => {
        // Não deve mostrar erro grave, pois foi ação do usuário
        expect(screen.queryByText(/erro.*grave|erro.*crítico/i)).not.toBeInTheDocument()
      })
    })

    it('deve tratar erro de rede na autenticação com Google', async () => {
      mockAuth.signInWithPopup.mockRejectedValue({
        code: 'auth/network-request-failed',
        message: 'Network error'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByRole('button', { name: /continuar com google/i })
      await userEvent.click(googleLoginButton)

      await expectErrorToast('erro.*conexão|verifique.*internet')
    })

    it('deve tratar erro de popup bloqueado no Google login', async () => {
      mockAuth.signInWithPopup.mockRejectedValue({
        code: 'auth/popup-blocked',
        message: 'Popup blocked'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByText(/login.*google|entrar.*google/i)
      await userEvent.click(googleLoginButton)

      await expectErrorToast('popup.*bloqueado|habilite.*popup')
    })

    it('deve tratar erro de popup fechado pelo usuário', async () => {
      mockAuth.signInWithPopup.mockRejectedValue({
        code: 'auth/popup-closed-by-user',
        message: 'Popup closed by user'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByText(/login.*google|entrar.*google/i)
      await userEvent.click(googleLoginButton)

      // Este erro pode ser silencioso ou mostrar mensagem suave
      await waitFor(() => {
        // Não deve mostrar erro grave, pois foi ação do usuário
        expect(screen.queryByText(/erro.*grave|erro.*crítico/i)).not.toBeInTheDocument()
      })
    })

    it('deve tratar erro de conta desabilitada no Google login', async () => {
      mockAuth.signInWithPopup.mockRejectedValue({
        code: 'auth/user-disabled',
        message: 'User account disabled'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const googleLoginButton = screen.getByRole('button', { name: /continuar com google/i })
      await userEvent.click(googleLoginButton)

      await expectErrorToast('conta.*desabilitada|usuário.*bloqueado')
    })
  })

  describe.skip('Erros de Firestore', () => {
    beforeEach(() => {
      mockAuthenticatedUser()
    })

    it('deve tratar erro de permissão no Firestore', async () => {
      mockFirestoreService.getUserPortfolio.mockRejectedValue({
        code: 'permission-denied',
        message: 'Permission denied'
      })

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await expectErrorToast('permissão.*negada|sem.*acesso')
    })

    it('deve tratar erro de cota excedida', async () => {
      mockFirestoreService.updateStock.mockRejectedValue({
        code: 'resource-exhausted',
        message: 'Quota exceeded'
      })

      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Preencher formulário
      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const quantityInput = screen.getByLabelText(/quantidade/i)

      await userEvent.type(tickerInput, 'AAPL')
      await userEvent.type(quantityInput, '10')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await expectErrorToast('limite.*excedido|cota.*esgotada')
    })

    it('deve tratar erro de documento não encontrado', async () => {
      mockFirestoreService.getUserPortfolio.mockRejectedValue({
        code: 'not-found',
        message: 'Document not found'
      })

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await expectErrorToast('dados.*não.*encontrados|documento.*inexistente')
    })

    it('deve tratar timeout no Firestore', async () => {
      mockFirestoreService.getUserPortfolio.mockRejectedValue({
        code: 'deadline-exceeded',
        message: 'Deadline exceeded'
      })

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await expectErrorToast('timeout|tempo.*esgotado|operação.*demorou')
    })
  })

  describe.skip('Erros da API de Preços', () => {
    beforeEach(() => {
      mockAuthenticatedUser()
      mockFirestoreService.getUserPortfolio.mockResolvedValue({
        'AAPL': {
          ticker: 'AAPL',
          quantity: 10,
          targetPercentage: 50,
          userRecommendation: 'Comprar' as const,
          name: 'Apple Inc.'
        }
      })
    })

    it('deve tratar erro 404 da API de preços', async () => {
      mockStockPriceService.getCurrentPrice.mockRejectedValue({
        status: 404,
        message: 'Symbol not found'
      })

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await expectErrorToast('ativo.*não.*encontrado|símbolo.*inválido')
    })

    it('deve tratar erro de rate limit da API', async () => {
      mockStockPriceService.getCurrentPrice.mockRejectedValue({
        status: 429,
        message: 'Rate limit exceeded'
      })

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await expectErrorToast('limite.*requisições|muitas.*consultas')
    })

    it('deve tratar erro de servidor da API', async () => {
      mockStockPriceService.getCurrentPrice.mockRejectedValue({
        status: 500,
        message: 'Internal server error'
      })

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await expectErrorToast('servidor.*indisponível|erro.*interno')
    })

    it('deve usar valores padrão quando API falhar', async () => {
      mockStockPriceService.getCurrentPrice.mockRejectedValue(
        new Error('API indisponível')
      )

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        // Deve mostrar ativos mesmo sem preços atualizados
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        // Pode mostrar preço padrão ou indicação de erro
        expect(screen.getByText(/preço.*indisponível|--/i)).toBeInTheDocument()
      })
    })
  })

  describe.skip('Erros de Validação', () => {
    beforeEach(() => {
      mockAuthenticatedUser()
    })

    it('deve validar ticker inválido', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      await userEvent.type(tickerInput, 'TICKER_MUITO_LONGO_DEMAIS')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/ticker.*inválido|código.*muito.*longo/i)).toBeInTheDocument()
      })
    })

    it('deve validar quantidade negativa', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const quantityInput = screen.getByLabelText(/quantidade/i)

      await userEvent.type(tickerInput, 'AAPL')
      await userEvent.type(quantityInput, '-10')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/quantidade.*positiva|valor.*maior.*zero/i)).toBeInTheDocument()
      })
    })

    it('deve validar percentual de alocação inválido', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)

      await userEvent.type(tickerInput, 'AAPL')
      await userEvent.type(targetInput, '150') // maior que 100%

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/percentual.*inválido|valor.*entre.*0.*100/i)).toBeInTheDocument()
      })
    })

    it('deve validar valor de investimento inválido', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, 'abc') // texto ao invés de número

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/valor.*numérico|digite.*número/i)).toBeInTheDocument()
      })
    })
  })

  describe.skip('Recuperação de Erros', () => {
    beforeEach(() => {
      mockAuthenticatedUser()
    })

    it('deve permitir retry após erro de rede', async () => {
      // Primeiro falha, depois sucesso
      mockStockPriceService.getCurrentPrice
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(150.00)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })

      // Primeira tentativa - falha
      await userEvent.click(calculateButton)
      await expectErrorToast()

      // Botão de retry ou tentar novamente
      const retryButton = screen.getByRole('button', { name: /tentar.*novamente|retry/i })
      await userEvent.click(retryButton)

      // Segunda tentativa - sucesso
      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      })
    })

    it('deve limpar erros quando operação for bem-sucedida', async () => {
      mockFirestoreService.updateStock
        .mockRejectedValueOnce(new Error('Temporary error'))
        .mockResolvedValueOnce(true)

      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Primeira tentativa - erro
      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const quantityInput = screen.getByLabelText(/quantidade/i)

      await userEvent.type(tickerInput, 'AAPL')
      await userEvent.type(quantityInput, '10')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await expectErrorToast()

      // Segunda tentativa - sucesso
      await userEvent.click(saveButton)

      await waitFor(() => {
        // Erro deve ter sido limpo
        expect(screen.queryByText(/erro/i)).not.toBeInTheDocument()
      })
    })

    it('deve manter funcionalidade básica mesmo com erros parciais', async () => {
      // API de preços falha, mas portfólio ainda carrega
      mockStockPriceService.getCurrentPrice.mockRejectedValue(
        new Error('API indisponível')
      )

      mockFirestoreService.getUserPortfolio.mockResolvedValue({
        'AAPL': {
          ticker: 'AAPL',
          quantity: 10,
          targetPercentage: 50,
          userRecommendation: 'Comprar' as const,
          name: 'Apple Inc.'
        }
      })

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        // Deve mostrar dados básicos mesmo sem preços
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
      })
    })
  })

  describe.skip('Estados de Erro Globais', () => {
    it('deve mostrar fallback para erro crítico', async () => {
      // Simular erro crítico no contexto
      mockAuth.onAuthStateChanged.mockImplementation(() => {
        throw new Error('Critical auth error')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
        // Mock console.error to avoid noise in test output
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/algo.*deu.*errado|erro.*inesperado/i)).toBeInTheDocument()
      })

      consoleSpy.mockRestore()
    })

    it('deve permitir recarregar página após erro crítico', async () => {
      const reloadSpy = jest.spyOn(window.location, 'reload').mockImplementation(() => {
        // Mock window.location.reload to avoid actual page reload in tests
      })

      // Simular erro crítico
      mockAuth.onAuthStateChanged.mockImplementation(() => {
        throw new Error('Critical error')
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/algo.*deu.*errado|erro.*inesperado/i)).toBeInTheDocument()
      })

      const reloadButton = screen.getByRole('button', { name: /recarregar|reload/i })
      await userEvent.click(reloadButton)

      expect(reloadSpy).toHaveBeenCalled()

      reloadSpy.mockRestore()
    })
  })
})
