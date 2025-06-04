/**
 * Testes da Calculadora de Balanceamento
 *
 * Testa funcionalidades específicas da calculadora:
 * - Cálculo de balanceamento
 * - Recomendações de compra/venda
 * - Simulações
 * - Validações de entrada
 * - Persistência de simulações
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import CalculadoraBalanceamento from '@/app/calculadora-balanceamento/page'
import { TestWrapper } from './helpers/test-wrapper'
import {
  mockAuth,
  mockAuthenticatedUser,
  resetAuthMocks
} from '@/__mocks__'
import {
  expectErrorToast,
  expectSuccessToast,
} from './helpers/test-utils'

// Mocks dos serviços
jest.mock('@/services/firebase/firestore')
jest.mock('@/services/api/stock-price')
jest.mock('firebase/auth')
jest.mock('firebase/firestore')
jest.mock('next/navigation')

describe.skip('Testes da Calculadora de Balanceamento', () => {
  const mockFirestoreService = jest.requireMock('@/services/firebase/firestore')
  const mockStockPriceService = jest.requireMock('@/services/api/stock-price')

  // Mock de dados de exemplo
  const mockPortfolioData = {
    'AAPL': {
      ticker: 'AAPL',
      quantity: 10,
      targetPercentage: 50,
      userRecommendation: 'Comprar' as const,
      name: 'Apple Inc.',
      currentPrice: 150.00
    },
    'GOOGL': {
      ticker: 'GOOGL',
      quantity: 2,
      targetPercentage: 50,
      userRecommendation: 'Comprar' as const,
      name: 'Alphabet Inc.',
      currentPrice: 2500.00
    }
  }

  beforeEach(() => {
    resetAuthMocks()

    // Setup usuário autenticado
    mockAuthenticatedUser()
    Object.assign(jest.requireMock('firebase/auth'), mockAuth)

    // Setup navigation
    const mockRouter = { push: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() }
    jest.requireMock('next/navigation').useRouter.mockReturnValue(mockRouter)
    jest.requireMock('next/navigation').usePathname.mockReturnValue('/calculadora-balanceamento')

    // Setup mocks do Firestore
    mockFirestoreService.getUserPortfolio.mockResolvedValue(mockPortfolioData)
    mockFirestoreService.saveSimulation.mockResolvedValue('simulation-id-123')

    // Setup mocks da API de preços
    interface PriceMap {
      [ticker: string]: number;
    }

    interface MockGetCurrentPrice {
      (ticker: string): Promise<number>;
    }

    const mockGetCurrentPrice: MockGetCurrentPrice = (ticker) => {
      const prices: PriceMap = { 'AAPL': 150.00, 'GOOGL': 2500.00 };
      return Promise.resolve(prices[ticker] || 100.00);
    }
    mockStockPriceService.getCurrentPrice.mockImplementation(mockGetCurrentPrice)
  })

  describe('Renderização Inicial', () => {
    it('deve renderizar calculadora para usuário autenticado', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/calculadora.*balanceamento/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar portfólio atual', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('GOOGL')).toBeInTheDocument()
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
        expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument()
      })
    })

    it('deve exibir alocações atuais vs desejadas', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        // Verificar percentuais de alocação
        expect(screen.getByText(/50%/)).toBeInTheDocument() // target para ambos
      })
    })

    it('deve mostrar valor total do portfólio', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        // AAPL: 10 * 150 = 1500
        // GOOGL: 2 * 2500 = 5000
        // Total: 6500
        expect(screen.getByText(/6\.?500|6,500/)).toBeInTheDocument()
      })
    })
  })

  describe('Cálculo de Balanceamento', () => {
    it('deve calcular balanceamento com valor de investimento', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/calculadora.*balanceamento/i)).toBeInTheDocument()
      })

      // Inserir valor para investir
      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '10000')

      // Calcular
      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      // Verificar resultados
      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar recomendações de compra/venda', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '5000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        // Deve mostrar ações de compra/venda
        expect(screen.getByText(/comprar|vender|manter/i)).toBeInTheDocument()
      })
    })

    it('deve validar valor de investimento', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      // Tentar calcular sem valor
      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/valor.*obrigatório|preencha.*valor/i)).toBeInTheDocument()
      })
    })

    it('deve validar valor mínimo de investimento', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '-100') // valor negativo

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/valor.*positivo|valor.*inválido/i)).toBeInTheDocument()
      })
    })

    it('deve recalcular quando portfólio mudar', async () => {
      const { rerender } = render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      // Primeiro cálculo
      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      })

      // Alterar portfólio
      const newPortfolio = {
        ...mockPortfolioData,
        'MSFT': {
          ticker: 'MSFT',
          quantity: 5,
          targetPercentage: 25,
          userRecommendation: 'Comprar' as const,
          name: 'Microsoft Corp.',
          currentPrice: 300.00
        }
      }
      mockFirestoreService.getUserPortfolio.mockResolvedValue(newPortfolio)

      // Re-renderizar
      rerender(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      // Deve atualizar com novo ativo
      await waitFor(() => {
        expect(screen.getByText('MSFT')).toBeInTheDocument()
        expect(screen.getByText('Microsoft Corp.')).toBeInTheDocument()
      })
    })
  })

  describe('Simulações', () => {
    it('deve permitir salvar simulação', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '5000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      })

      // Salvar simulação
      const saveButton = screen.getByRole('button', { name: /salvar.*simulação|gravar/i })
      await userEvent.click(saveButton)

      // Verificar chamada ao serviço
      await waitFor(() => {
        expect(mockFirestoreService.saveSimulation).toHaveBeenCalledWith(
          expect.any(String), // userId
          expect.objectContaining({
            investmentAmount: 5000,
            portfolioData: expect.any(Object),
            recommendations: expect.any(Object)
          })
        )
      })

      await expectSuccessToast('simulação.*salva')
    })

    it('deve permitir nomear simulação', async () => {
      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '3000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        expect(screen.getByText(/recomendação|resultado/i)).toBeInTheDocument()
      })

      // Adicionar nome à simulação
      const nameInput = screen.getByLabelText(/nome.*simulação|título/i)
      await userEvent.type(nameInput, 'Simulação de Janeiro 2024')

      const saveButton = screen.getByRole('button', { name: /salvar.*simulação|gravar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(mockFirestoreService.saveSimulation).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            name: 'Simulação de Janeiro 2024'
          })
        )
      })
    })

    it('deve tratar erro ao salvar simulação', async () => {
      mockFirestoreService.saveSimulation.mockRejectedValue(
        new Error('Erro ao salvar simulação')
      )

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '2000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      const saveButton = screen.getByRole('button', { name: /salvar.*simulação|gravar/i })
      await userEvent.click(saveButton)

      await expectErrorToast('erro.*salvar.*simulação')
    })
  })

  describe('Performance e Loading', () => {
    it('deve mostrar loading durante cálculo', async () => {
      // Simular delay na API de preços
      mockStockPriceService.getCurrentPrice.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(150.00), 100))
      )

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      // Deve mostrar loading
      expect(screen.getByText(/calculando|carregando/i)).toBeInTheDocument()

      // Aguardar conclusão
      await waitFor(() => {
        expect(screen.queryByText(/calculando|carregando/i)).not.toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('deve desabilitar botão durante cálculo', async () => {
      mockStockPriceService.getCurrentPrice.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(150.00), 100))
      )

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      // Botão deve estar desabilitado
      expect(calculateButton).toBeDisabled()
    })

    it('deve lidar com falha na API de preços', async () => {
      mockStockPriceService.getCurrentPrice.mockRejectedValue(
        new Error('API de preços indisponível')
      )

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '1000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await expectErrorToast('erro.*preço|preços.*indisponível')
    })
  })

  describe('Cenários Específicos de Balanceamento', () => {
    it('deve recomendar compra quando ativo está sub-alocado', async () => {
      // Portfolio com AAPL sub-alocado (15% atual vs 50% target)
      const unbalancedPortfolio = {
        'AAPL': {
          ticker: 'AAPL',
          quantity: 5, // menor quantidade
          targetPercentage: 50,
          userRecommendation: 'Comprar' as const,
          name: 'Apple Inc.',
          currentPrice: 150.00
        },
        'GOOGL': {
          ticker: 'GOOGL',
          quantity: 10, // maior quantidade
          targetPercentage: 50,
          userRecommendation: 'Vender' as const,
          name: 'Alphabet Inc.',
          currentPrice: 2500.00
        }
      }

      mockFirestoreService.getUserPortfolio.mockResolvedValue(unbalancedPortfolio)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '10000')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        // Deve recomendar compra de AAPL
        expect(screen.getByText(/comprar.*aapl|aapl.*comprar/i)).toBeInTheDocument()
      })
    })

    it('deve recomendar venda quando ativo está sobre-alocado', async () => {
      const overAllocatedPortfolio = {
        'AAPL': {
          ticker: 'AAPL',
          quantity: 50, // muito alta
          targetPercentage: 30,
          userRecommendation: 'Vender' as const,
          name: 'Apple Inc.',
          currentPrice: 150.00
        },
        'GOOGL': {
          ticker: 'GOOGL',
          quantity: 1, // muito baixa
          targetPercentage: 70,
          userRecommendation: 'Comprar' as const,
          name: 'Alphabet Inc.',
          currentPrice: 2500.00
        }
      }

      mockFirestoreService.getUserPortfolio.mockResolvedValue(overAllocatedPortfolio)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '0') // sem novo investimento

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        // Deve recomendar venda de AAPL
        expect(screen.getByText(/vender.*aapl|aapl.*vender/i)).toBeInTheDocument()
        // E compra de GOOGL
        expect(screen.getByText(/comprar.*googl|googl.*comprar/i)).toBeInTheDocument()
      })
    })

    it('deve recomendar manter quando ativo está balanceado', async () => {
      const balancedPortfolio = {
        'AAPL': {
          ticker: 'AAPL',
          quantity: 10,
          targetPercentage: 50,
          userRecommendation: 'Manter' as const,
          name: 'Apple Inc.',
          currentPrice: 150.00
        },
        'GOOGL': {
          ticker: 'GOOGL',
          quantity: 3,
          targetPercentage: 50,
          userRecommendation: 'Manter' as const,
          name: 'Alphabet Inc.',
          currentPrice: 2500.00
        }
      }

      mockFirestoreService.getUserPortfolio.mockResolvedValue(balancedPortfolio)

      render(
        <TestWrapper>
          <CalculadoraBalanceamento />
        </TestWrapper>
      )

      const investmentInput = screen.getByLabelText(/valor.*investir|investimento/i)
      await userEvent.type(investmentInput, '0')

      const calculateButton = screen.getByRole('button', { name: /calcular/i })
      await userEvent.click(calculateButton)

      await waitFor(() => {
        // Deve recomendar manter ambos
        expect(screen.getByText(/manter.*aapl|aapl.*manter/i)).toBeInTheDocument()
        expect(screen.getByText(/manter.*googl|googl.*manter/i)).toBeInTheDocument()
      })
    })
  })
})
