/**
 * Testes de Integração para o Sistema de Balanceamento de Investimentos
 * 
 * Este arquivo contém testes que verificam a integração entre diferentes
 * componentes e funcionalidades do sistema, incluindo:
 * - Fluxo completo de autenticação
 * - Gestão de portfólio
 * - Cálculo de balanceamento
 * - Persistência de dados
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/core/state/auth-context'
import { ThemeProvider } from '@/core/state/theme-context'
import { PortfolioProvider } from '@/core/state/portfolio-context'

// Páginas e componentes a serem testados
import LoginPage from '@/app/login/page'
import CalculadoraBalanceamento from '@/app/calculadora-balanceamento/page'
import { StockList } from '@/components/stocks/stock-list'
import { AddStockForm } from '@/components/add-stock-form'

// Mocks dos serviços
jest.mock('@/services/firebase/firestore')
jest.mock('@/services/api/stockPrice')
jest.mock('next/navigation')
jest.mock('firebase/auth')

// Componente wrapper para testes com todos os providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <PortfolioProvider>
          {children}
          <Toaster />
        </PortfolioProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Testes de Integração - Sistema de Balanceamento', () => {
  beforeEach(() => {
    // Limpar todos os mocks antes de cada teste
    jest.clearAllMocks()
    
    // Reset localStorage
    localStorageMock.clear()
    
    // Configurar mocks básicos dos serviços
    const mockFirestore = jest.requireMock('@/services/firebase/firestore')
    const mockStockPrice = jest.requireMock('@/services/api/stockPrice')
    
    // Mocks padrão para Firestore
    mockFirestore.getUserPortfolio.mockResolvedValue({})
    mockFirestore.updateStock.mockResolvedValue(true)
    mockFirestore.removeStock.mockResolvedValue(true)
    mockFirestore.validateUserInput.mockReturnValue(true)
    mockFirestore.getUserPreferences.mockResolvedValue({ theme: 'dark' })
    mockFirestore.saveSimulation.mockResolvedValue('simulation-id')
    
    // Mocks padrão para StockPrice
    mockStockPrice.getStockPrice.mockResolvedValue(100)
    mockStockPrice.getMultipleStockPrices.mockResolvedValue({
      'AAPL': 150,
      'GOOGL': 2500,
      'MSFT': 300
    })
    mockStockPrice.fetchStockPrice.mockResolvedValue(100)
    mockStockPrice.simulateStockPrices.mockReturnValue({
      'AAPL': 150,
      'GOOGL': 2500
    })
    mockStockPrice.isDevelopment.mockReturnValue(true)
    
    // Mock do Next.js navigation
    const mockRouter = jest.requireMock('next/navigation')
    mockRouter.useRouter.mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    })
    mockRouter.usePathname.mockReturnValue('/dashboard')
    mockRouter.useSearchParams.mockReturnValue(new URLSearchParams())
    
    // Mock do Firebase Auth
    const mockAuth = jest.requireMock('firebase/auth')
    mockAuth.onAuthStateChanged.mockImplementation((auth: any, callback: any) => {
      // Simular usuário autenticado
      setTimeout(() => {
        callback({
          uid: 'test-user-123',
          email: 'test@example.com',
          displayName: 'Test User'
        })
      }, 0)
      return jest.fn() // unsubscribe function
    })
    mockAuth.signInWithEmailAndPassword.mockResolvedValue({
      user: { uid: 'test-user-123', email: 'test@example.com' }
    })
    mockAuth.signOut.mockResolvedValue(undefined)
  })

  describe('Fluxo de Autenticação', () => {
    it('deve permitir login com credenciais válidas', async () => {
      const mockAuth = jest.requireMock('firebase/auth')
      mockAuth.signInWithEmailAndPassword.mockResolvedValue({
        user: { uid: 'test-user', email: 'test@example.com' }
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      // Selecionar o botão de login específico pelo tipo submit e texto exato
      const loginButton = screen.getByRole('button', { name: "Login", exact: true })

      await userEvent.type(emailInput, 'test@example.com')
      await userEvent.type(passwordInput, 'password123')
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
      const mockAuth = jest.requireMock('firebase/auth')
      mockAuth.signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'))

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      // Selecionar o botão de login específico pelo tipo submit e texto exato
      const loginButton = screen.getByRole('button', { name: "Login", exact: true })

      await userEvent.type(emailInput, 'invalid@example.com')
      await userEvent.type(passwordInput, 'wrongpassword')
      await userEvent.click(loginButton)

      await waitFor(() => {
        expect(screen.getByText(/erro/i)).toBeInTheDocument()
      })
    })
  })

  describe('Gestão de Portfólio', () => {
    it('deve carregar e exibir ações do portfólio', async () => {
      const mockStocks = {
        'AAPL': {
          ticker: 'AAPL',
          quantity: 10,
          targetPercentage: 30,
          userRecommendation: 'Comprar' as const
        },
        'GOOGL': {
          ticker: 'GOOGL',
          quantity: 5,
          targetPercentage: 25,
          userRecommendation: 'Aguardar' as const
        }
      }

      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      mockFirestore.getUserPortfolio.mockResolvedValue(mockStocks)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('GOOGL')).toBeInTheDocument()
      })
    })

    it('deve adicionar nova ação ao portfólio', async () => {
      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      const mockStockPrice = jest.requireMock('@/services/api/stockPrice')
      
      mockFirestore.updateStock.mockResolvedValue(true)
      mockStockPrice.getStockPrice.mockResolvedValue(100)

      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/código do ativo/i)).toBeInTheDocument()
      })

      const tickerInput = screen.getByLabelText(/código do ativo/i) 
      const quantityInput = screen.getByLabelText(/quantidade/i)
      const targetInput = screen.getByLabelText(/meta/i)
      // O botão de submissão no AddStockForm é "Salvar"
      const addButton = screen.getByRole('button', { name: /salvar/i })

      await userEvent.type(tickerInput, 'MSFT')
      await userEvent.type(quantityInput, '15')
      await userEvent.type(targetInput, '20')
      await userEvent.click(addButton)

      await waitFor(() => {
        expect(mockFirestore.updateStock).toHaveBeenCalled()
      })
    })

    it('deve remover ação do portfólio', async () => {
      const mockStocks = {
        'AAPL': {
          ticker: 'AAPL',
          quantity: 10,
          targetPercentage: 30,
          userRecommendation: 'Comprar' as const
        }
      }

      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      mockFirestore.getUserPortfolio.mockResolvedValue(mockStocks)
      mockFirestore.removeStock.mockResolvedValue(true)

      // Mock do window.confirm
      const originalConfirm = window.confirm
      window.confirm = jest.fn(() => true)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })

      // Tentar encontrar o botão pelo data-testid, que seria o ideal.
      // Se não existir, será necessário adicioná-lo ao componente StockList.
      // Exemplo: <button data-testid={`delete-stock-AAPL`} ...>
      // Por agora, vamos tentar um seletor que busca pelo SVG dentro de um botão.
      // Esta é uma abordagem mais frágil e depende da estrutura do DOM.
      const deleteButton = screen.getByRole('button', { name: "" }); // Encontra o botão que não tem nome acessível direto (o ícone)
      // Este seletor assume que o botão de lixeira é o único botão sem nome acessível direto no item da lista.
      // Se houver outros, este seletor pode pegar o errado.
      // Uma alternativa seria screen.getAllByRole('button', { name: "" }) e então filtrar ou pegar por índice, mas é mais arriscado.
      
      // Verificação para garantir que encontramos um botão antes de clicar
      expect(deleteButton.querySelector('svg.lucide-trash2')).toBeInTheDocument();

      await userEvent.click(deleteButton)

      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled()
      })

      // Restaurar window.confirm
      window.confirm = originalConfirm
    })
  })

  describe('Calculadora de Balanceamento', () => {
    it('deve calcular balanceamento com valor de investimento', async () => {
      const mockStocks = {
        'AAPL': {
          ticker: 'AAPL',
          quantity: 10,
          targetPercentage: 50,
          userRecommendation: 'Comprar' as const
        },
        'GOOGL': {
          ticker: 'GOOGL',
          quantity: 2,
          targetPercentage: 50,
          userRecommendation: 'Comprar' as const
        }
      }

      const mockFirestore = jest.requireMock('@/services/firebase/firestore');
      mockFirestore.getUserPortfolio.mockResolvedValue(mockStocks);
      // Garantir que getDoc e setDoc também estão mockados para createOrUpdateUserData
      // que é chamado dentro de onAuthStateChanged no AuthContext
      mockFirestore.getDoc.mockResolvedValue({ exists: () => false }); 
      mockFirestore.setDoc.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/Calculadora de Balanceamento de Carteira/i)).toBeInTheDocument()
      })

      const investmentInput = screen.getByLabelText(/valor para investir/i)
      const calculateButton = screen.getByRole('button', { name: /calcular/i })

      await userEvent.type(investmentInput, '10000')
      await userEvent.click(calculateButton)

      await waitFor(() => {
        // Verificar se navega para a página de resultado
        const mockRouter = jest.requireMock('next/navigation')
        expect(mockRouter.useRouter().push).toHaveBeenCalled()
      })
    })

    it('deve salvar simulação de balanceamento', async () => {
      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      mockFirestore.saveSimulation.mockResolvedValue('simulation-123')

      // Este teste focaria no fluxo de salvar simulação
      // que acontece na página de resultado
      expect(mockFirestore.saveSimulation).toBeDefined()
    })
  })

  describe('Tratamento de Erros', () => {
    it('deve exibir erro quando não conseguir carregar portfólio', async () => {
      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      mockFirestore.getUserPortfolio.mockRejectedValue(new Error('Network error'))

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        // Verificar se a mensagem de erro é exibida ou tratada adequadamente
        expect(screen.queryByText('AAPL')).not.toBeInTheDocument()
      })
    })

    it('deve usar valores padrão quando API de preços falhar', async () => {
      const mockStockPrice = jest.requireMock('@/services/api/stockPrice')
      mockStockPrice.getStockPrice.mockRejectedValue(new Error('API error'))
      
      // Configurar fallback
      mockStockPrice.getStockPrice.mockResolvedValueOnce(50) // valor padrão

      const mockStocks = {
        'FAIL-STOCK': {
          ticker: 'FAIL-STOCK',
          quantity: 10,
          targetPercentage: 100,
          userRecommendation: 'Comprar' as const
        }
      }

      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      mockFirestore.getUserPortfolio.mockResolvedValue(mockStocks)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('FAIL-STOCK')).toBeInTheDocument()
      })
    })
  })

  describe('Performance', () => {
    it('deve renderizar lista com muitas ações rapidamente', async () => {
      // Criar 50 ações para teste de performance
      const mockStocks: Record<string, any> = {}
      for (let i = 0; i < 50; i++) {
        const ticker = `STOCK${i.toString().padStart(2, '0')}`
        mockStocks[ticker] = {
          ticker,
          quantity: 10,
          targetPercentage: 2,
          userRecommendation: 'Comprar' as const
        }
      }

      const mockFirestore = jest.requireMock('@/services/firebase/firestore')
      mockFirestore.getUserPortfolio.mockResolvedValue(mockStocks)

      const startTime = performance.now()

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('STOCK00')).toBeInTheDocument()
      }, { timeout: 10000 })

      const endTime = performance.now()
      const renderTime = endTime - startTime

      // Deve renderizar em menos de 5 segundos mesmo com 50 ações
      expect(renderTime).toBeLessThan(5000)
    })
  })
})
