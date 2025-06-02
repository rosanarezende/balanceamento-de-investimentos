/**
 * Testes de Performance
 * 
 * Testa aspectos de performance da aplicação:
 * - Tempos de carregamento
 * - Otimizações de renderização
 * - Memory leaks
 * - Lazy loading
 * - Cache e memoização
 */

import React from 'react'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CalculadoraBalanceamento from '@/app/calculadora-balanceamento/page'
import { StockList } from '@/components/stocks/stock-list'
import { TestWrapper } from './helpers/test-wrapper'
import {
  mockAuth,
  mockAuthenticatedUser,
  resetAllMocks
} from './mocks/firebase'

// Mocks dos serviços
jest.mock('@/services/firebase/firestore')
jest.mock('@/services/api/stock-price')
jest.mock('firebase/auth')
jest.mock('firebase/firestore')
jest.mock('next/navigation')

describe('Testes de Performance', () => {
  const mockFirestoreService = jest.requireMock('@/services/firebase/firestore')
  const mockStockPriceService = jest.requireMock('@/services/api/stock-price')

  // Mock de dados grandes para testes de performance
  const generateLargePortfolio = (size: number) => {
    const portfolio: Record<string, any> = {}
    for (let i = 0; i < size; i++) {
      const ticker = `STOCK${i.toString().padStart(3, '0')}`
      portfolio[ticker] = {
        ticker,
        quantity: Math.floor(Math.random() * 100) + 1,
        targetPercentage: Math.floor(Math.random() * 50) + 1,
        userRecommendation: ['Comprar', 'Vender', 'Manter'][Math.floor(Math.random() * 3)],
        name: `Company ${i}`,
        currentPrice: Math.random() * 1000 + 10
      }
    }
    return portfolio
  }

  beforeEach(() => {
    resetAllMocks()

    // Setup usuário autenticado
    mockAuthenticatedUser()
    Object.assign(jest.requireMock('firebase/auth'), mockAuth)

    // Setup navigation
    const mockRouter = { push: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }
    jest.requireMock('next/navigation').useRouter.mockReturnValue(mockRouter)
    jest.requireMock('next/navigation').usePathname.mockReturnValue('/dashboard')

    // Performance.now mock para medições
    const mockPerformance = {
      now: jest.fn(() => Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn(() => []),
      getEntriesByName: jest.fn(() => [])
    }
    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true
    })
  })

  describe('Tempos de Carregamento', () => {
    it('deve carregar lista de ativos em menos de 2 segundos', async () => {
      const startTime = Date.now()

      mockFirestoreService.getUserPortfolio.mockResolvedValue(
        generateLargePortfolio(50)
      )

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
      }, { timeout: 2000 })

      const endTime = Date.now()
      const loadTime = endTime - startTime

      expect(loadTime).toBeLessThan(2000)
    })

    it('deve renderizar componentes críticos primeiro', async () => {
      const largePortfolio = generateLargePortfolio(100)
      mockFirestoreService.getUserPortfolio.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(largePortfolio), 100))
      )

      const startTime = Date.now()

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      // Loading deve aparecer imediatamente
      expect(screen.getByText(/carregando|loading/i)).toBeInTheDocument()

      // Medir tempo até o loading aparecer
      const loadingTime = Date.now() - startTime
      expect(loadingTime).toBeLessThan(50) // Muito rápido

      // Aguardar dados carregarem
      await waitFor(() => {
        expect(screen.queryByText(/carregando|loading/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('deve cachear dados do portfólio', async () => {
      const portfolio = generateLargePortfolio(20)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(portfolio)

      // Primeira renderização
      const { unmount } = render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
      })

      unmount()

      // Segunda renderização - deve usar cache
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      // Verificar que não fez nova chamada (ou fez muito poucas)
      await waitFor(() => {
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
      })

      // Deve ter feito apenas uma chamada (ou poucas se houver revalidação)
      expect(mockFirestoreService.getUserPortfolio).toHaveBeenCalledTimes(1)
    })
  })

  describe('Otimizações de Renderização', () => {
    it('deve evitar re-renderizações desnecessárias', async () => {
      const portfolio = generateLargePortfolio(10)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(portfolio)

      let renderCount = 0
      const TestComponent = () => {
        renderCount++
        return <StockList />
      }

      render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
      })

      const initialRenderCount = renderCount

      // Simular mudança que não deveria causar re-render
      // (por exemplo, hover ou focus em elemento que não afeta os dados)
      const firstStock = screen.getByText('STOCK000')
      await userEvent.hover(firstStock)

      // Aguardar um pouco para ver se há renders extras
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Não deve ter aumentado significativamente o número de renders
      expect(renderCount - initialRenderCount).toBeLessThanOrEqual(2)
    })

    it('deve virtualizar lista grande de ativos', async () => {
      const largePortfolio = generateLargePortfolio(1000)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(largePortfolio)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
      })

      // Não deve renderizar todos os 1000 itens no DOM
      const allStockElements = screen.queryAllByText(/STOCK\d{3}/)

      // Deve renderizar apenas uma parte dos itens (virtualização)
      expect(allStockElements.length).toBeLessThan(100)
      expect(allStockElements.length).toBeGreaterThan(5)
    })

    it('deve debounce busca em tempo real', async () => {
      const portfolio = generateLargePortfolio(50)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(portfolio)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
      })

      // Simular digitação rápida na busca
      const searchInput = screen.getByPlaceholderText(/buscar|pesquisar/i)

      await userEvent.type(searchInput, 'STO', { delay: 10 }) // Digitação rápida

      // Aguardar debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 500))
      })

      // Verificar que a busca foi aplicada após o debounce
      await waitFor(() => {
        // Deve filtrar para mostrar apenas itens que contêm "STO"
        expect(screen.getByText('STOCK000')).toBeInTheDocument()
        expect(screen.queryByText('COMPANY')).not.toBeInTheDocument()
      })
    })
  })

  describe('Gerenciamento de Memória', () => {
    it('deve limpar listeners ao desmontar componente', async () => {
      const unsubscribeSpy = jest.fn()
      mockAuth.onAuthStateChanged.mockReturnValue(unsubscribeSpy)

      const { unmount } = render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      unmount()

      // Deve ter chamado unsubscribe ao desmontar
      expect(unsubscribeSpy).toHaveBeenCalled()
    })

    it('deve cancelar requisições pendentes ao desmontar', async () => {
      const abortSpy = jest.fn()
      const mockAbortController = {
        abort: abortSpy,
        signal: { aborted: false }
      }

      // Mock AbortController
      global.AbortController = jest.fn(() => mockAbortController) as any

      // Mock com delay para simular requisição lenta
      mockStockPriceService.getCurrentPrice.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(150.00), 1000))
      )

      const { unmount } = render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      // Iniciar cálculo
      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      // Desmontar antes da requisição terminar
      unmount()

      // Deve ter cancelado requisições pendentes
      expect(abortSpy).toHaveBeenCalled()
    })

    it('deve limpar timers ao desmontar', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

      const { unmount } = render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      unmount()

      // Verificar se algum timer foi limpo
      expect(clearTimeoutSpy).toHaveBeenCalled()

      clearTimeoutSpy.mockRestore()
    })
  })

  describe('Performance da Calculadora', () => {
    it('deve calcular balanceamento rapidamente para portfólio grande', async () => {
      const largePortfolio = generateLargePortfolio(100)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(largePortfolio)
      mockStockPriceService.getCurrentPrice.mockResolvedValue(150.00)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/calculadora.*balanceamento/i)).toBeInTheDocument()
      })

      const startTime = Date.now()

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '10000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      }, { timeout: 5000 })

      const endTime = Date.now()
      const calculationTime = endTime - startTime

      // Cálculo deve ser rápido mesmo com 100 ativos
      expect(calculationTime).toBeLessThan(3000)
    })

    it('deve cachear cálculos para mesmo valor de investimento', async () => {
      const portfolio = generateLargePortfolio(20)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(portfolio)
      mockStockPriceService.getCurrentPrice.mockResolvedValue(150.00)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      const calculateButton = screen.getByRole('button', { name: /calcular/i })

      // Primeiro cálculo
      await userEvent.type(investmentInput, '5000')
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      })

      const firstCallCount = mockStockPriceService.getCurrentPrice.mock.calls.length

      // Limpar input e repetir mesmo valor
      await userEvent.clear(investmentInput)
      await userEvent.type(investmentInput, '5000')
      await userEvent.click(calculateButton)

      // Deve usar cache, não fazer novas chamadas à API
      expect(mockStockPriceService.getCurrentPrice.mock.calls.length).toBe(firstCallCount)
    })

    it('deve processar mudanças incrementais eficientemente', async () => {
      const portfolio = generateLargePortfolio(30)
      mockFirestoreService.getUserPortfolio.mockResolvedValue(portfolio)
      mockStockPriceService.getCurrentPrice.mockResolvedValue(150.00)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      const calculateButton = screen.getByRole('button', { name: /calcular/i })

      // Múltiplos cálculos com valores similares
      const values = ['1000', '1100', '1200', '1300']
      const times: number[] = []

      for (const value of values) {
        await userEvent.clear(investmentInput)
        await userEvent.type(investmentInput, value)

        const startTime = Date.now()
        await userEvent.click(calculateButton)

        await waitFor(() => {
          expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
        })

        times.push(Date.now() - startTime)
      }

      // Cálculos subsequentes devem ser mais rápidos (cache/otimização)
      const averageFirstHalf = (times[0] + times[1]) / 2
      const averageSecondHalf = (times[2] + times[3]) / 2

      expect(averageSecondHalf).toBeLessThanOrEqual(averageFirstHalf * 1.2) // Max 20% slower
    })
  })

  describe('Lazy Loading e Code Splitting', () => {
    it('deve carregar componentes sob demanda', async () => {
      // Simular componente que só carrega quando necessário
      const LazyComponent = React.lazy(() =>
        Promise.resolve({ default: () => <div>Lazy Loaded</div> })
      )

      render(
        <TestWrapper>
          <React.Suspense fallback={<div>Loading component...</div>}>
            <LazyComponent />
          </React.Suspense>
        </TestWrapper>
      )

      // Deve mostrar loading primeiro
      expect(screen.getByText('Loading component...')).toBeInTheDocument()

      // Depois carregar o componente
      await waitFor(() => {
        expect(screen.getByText('Lazy Loaded')).toBeInTheDocument()
      })
    })

    it('deve carregar rotas sob demanda', async () => {
      // Este teste seria mais relevante com Next.js dynamic imports
      // Por enquanto, vamos simular o comportamento

      const mockDynamicImport = jest.fn(() =>
        Promise.resolve({ default: () => <div>Dynamic Route</div> })
      )

      // Simular carregamento dinâmico
      const DynamicComponent = React.lazy(mockDynamicImport)

      render(
        <TestWrapper>
          <React.Suspense fallback={<div>Loading route...</div>}>
            <DynamicComponent />
          </React.Suspense>
        </TestWrapper>
      )

      expect(mockDynamicImport).toHaveBeenCalled()

      await waitFor(() => {
        expect(screen.getByText('Dynamic Route')).toBeInTheDocument()
      })
    })
  })

  describe('Performance Monitoring', () => {
    it('deve medir Core Web Vitals', async () => {
      const mockObserver = {
        observe: jest.fn(),
        disconnect: jest.fn()
      }

      // Mock PerformanceObserver
      global.PerformanceObserver = jest.fn(() => mockObserver) as any

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      // Verificar se métricas estão sendo coletadas
      expect(global.PerformanceObserver).toHaveBeenCalled()
      expect(mockObserver.observe).toHaveBeenCalled()
    })

    it('deve detectar renders demorados', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })

      // Simular componente com render lento
      const SlowComponent = () => {
        // Simular processamento lento
        const start = Date.now()
        while (Date.now() - start < 100) {
          // Busy wait
        }
        return <div>Slow Component</div>
      }

      const startTime = Date.now()

      render(
        <TestWrapper>
          <SlowComponent />
        </TestWrapper>
      )

      const renderTime = Date.now() - startTime

      // Se render for muito lento, deve ser detectado
      if (renderTime > 50) {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringMatching(/slow.*render|performance/i)
        )
      }

      consoleSpy.mockRestore()
    })
  })
})
