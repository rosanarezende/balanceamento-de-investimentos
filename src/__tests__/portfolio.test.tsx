/**
 * Testes de Gestão de Portfólio
 * 
 * Testa funcionalidades relacionadas ao gerenciamento do portfólio:
 * - Adição de ativos
 * - Remoção de ativos
 * - Edição de ativos
 * - Listagem de ativos
 * - Validações
 * - Persistência
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StockList } from '@/components/stocks/stock-list'
import { AddStockForm } from '@/components/add-stock-form'
import { TestWrapper } from './helpers/test-wrapper'
import {
  mockAuth,
  mockAuthenticatedUser,
  resetAllMocks
} from './mocks/firebase'
import {
  expectErrorToast,
  expectSuccessToast
} from './helpers/test-utils'

// Mocks dos serviços
jest.mock('@/services/firebase/firestore')
jest.mock('@/services/api/stock-price')
jest.mock('firebase/auth')
jest.mock('firebase/firestore')

describe.skip('Testes de Gestão de Portfólio', () => {
  const mockFirestoreService = jest.requireMock('@/services/firebase/firestore')
  const mockStockPriceService = jest.requireMock('@/services/api/stock-price')

  // Mock de dados de exemplo
  const mockPortfolioData = {
    'AAPL': {
      ticker: 'AAPL',
      quantity: 10,
      targetPercentage: 30,
      userRecommendation: 'Comprar' as const,
      name: 'Apple Inc.'
    },
    'GOOGL': {
      ticker: 'GOOGL',
      quantity: 5,
      targetPercentage: 25,
      userRecommendation: 'Manter' as const,
      name: 'Alphabet Inc.'
    }
  }

  beforeEach(() => {
    resetAllMocks()

    // Setup usuário autenticado
    mockAuthenticatedUser()
    Object.assign(jest.requireMock('firebase/auth'), mockAuth)

    // Setup mocks do Firestore
    mockFirestoreService.getUserPortfolio.mockResolvedValue(mockPortfolioData)
    mockFirestoreService.updateStock.mockResolvedValue(true)
    mockFirestoreService.removeStock.mockResolvedValue(true)
    mockFirestoreService.validateUserInput.mockReturnValue(true)

    // Setup mocks da API de preços
    mockStockPriceService.getCurrentPrice.mockResolvedValue(150.00)
    mockStockPriceService.getPriceHistory.mockResolvedValue([
      { date: '2024-01-01', price: 145.00 },
      { date: '2024-01-02', price: 150.00 }
    ])
  })

  describe('Listagem de Ativos', () => {
    it('deve exibir lista de ativos do portfólio', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('GOOGL')).toBeInTheDocument()
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
        expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagem quando portfólio estiver vazio', async () => {
      mockFirestoreService.getUserPortfolio.mockResolvedValue({})

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/portfólio.*vazio|nenhum.*ativo/i)).toBeInTheDocument()
      })
    })

    it('deve exibir loading enquanto carrega ativos', async () => {
      // Simular delay no carregamento
      mockFirestoreService.getUserPortfolio.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPortfolioData), 100))
      )

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      // Deve mostrar loading
      expect(screen.getByText(/carregando|loading/i)).toBeInTheDocument()

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.queryByText(/carregando|loading/i)).not.toBeInTheDocument()
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('deve tratar erro ao carregar portfólio', async () => {
      mockFirestoreService.getUserPortfolio.mockRejectedValue(
        new Error('Erro ao carregar portfólio')
      )

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await expectErrorToast('erro.*carregar')
    })
  })

  describe('Adição de Ativos', () => {
    it('deve adicionar novo ativo ao portfólio', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/código.*ativo|ticker/i)).toBeInTheDocument()
      })

      // Preencher formulário
      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const quantityInput = screen.getByLabelText(/quantidade/i)
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)

      await userEvent.type(tickerInput, 'MSFT')
      await userEvent.type(quantityInput, '15')
      await userEvent.type(targetInput, '20')

      // Submeter formulário
      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      // Verificar chamada ao serviço
      await waitFor(() => {
        expect(mockFirestoreService.updateStock).toHaveBeenCalledWith(
          expect.any(String), // userId
          'MSFT',
          expect.objectContaining({
            ticker: 'MSFT',
            quantity: 15,
            targetPercentage: 20
          })
        )
      })

      await expectSuccessToast()
    })

    it('deve validar campos obrigatórios', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Tentar salvar sem preencher campos
      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/campo.*obrigatório|preencha.*campo/i)).toBeInTheDocument()
      })
    })

    it('deve validar formato do ticker', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)

      // Ticker inválido (muito longo)
      await userEvent.type(tickerInput, 'TICKER_MUITO_LONGO')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/ticker.*inválido|código.*inválido/i)).toBeInTheDocument()
      })
    })

    it('deve validar valores numéricos', async () => {
      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      const quantityInput = screen.getByLabelText(/quantidade/i)
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)

      // Valores inválidos
      await userEvent.type(quantityInput, '-5') // negativo
      await userEvent.type(targetInput, '150') // maior que 100%

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/valor.*inválido|quantidade.*positiva/i)).toBeInTheDocument()
      })
    })

    it('deve tratar erro ao adicionar ativo', async () => {
      mockFirestoreService.updateStock.mockRejectedValue(
        new Error('Erro ao salvar ativo')
      )

      render(
        <TestWrapper>
          <AddStockForm isOpen={true} onClose={jest.fn()} />
        </TestWrapper>
      )

      // Preencher formulário válido
      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const quantityInput = screen.getByLabelText(/quantidade/i)
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)

      await userEvent.type(tickerInput, 'MSFT')
      await userEvent.type(quantityInput, '15')
      await userEvent.type(targetInput, '20')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await expectErrorToast('erro.*salvar|erro.*adicionar')
    })
  })

  describe('Remoção de Ativos', () => {
    beforeEach(() => {
      // Mock do window.confirm
      window.confirm = jest.fn(() => true)
    })

    afterEach(() => {
      // Restaurar window.confirm
      if (window.confirm && jest.isMockFunction(window.confirm)) {
        (window.confirm as jest.Mock).mockRestore()
      }
    })

    it('deve remover ativo do portfólio', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })

      // Encontrar e clicar no botão de remover
      const removeButton = screen.getByRole('button', {
        name: /remover.*aapl|excluir.*aapl|deletar.*aapl/i
      })
      await userEvent.click(removeButton)

      // Verificar confirmação
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringMatching(/remover.*aapl|excluir.*aapl/i)
      )

      // Verificar chamada ao serviço
      await waitFor(() => {
        expect(mockFirestoreService.removeStock).toHaveBeenCalledWith(
          expect.any(String), // userId
          'AAPL'
        )
      })

      await expectSuccessToast()
    })

    it('deve cancelar remoção se usuário negar confirmação', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', {
        name: /remover.*aapl|excluir.*aapl|deletar.*aapl/i
      })
      await userEvent.click(removeButton)

      // Não deve chamar o serviço
      expect(mockFirestoreService.removeStock).not.toHaveBeenCalled()
    })

    it('deve tratar erro ao remover ativo', async () => {
      mockFirestoreService.removeStock.mockRejectedValue(
        new Error('Erro ao remover ativo')
      )

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })

      const removeButton = screen.getByRole('button', {
        name: /remover.*aapl|excluir.*aapl|deletar.*aapl/i
      })
      await userEvent.click(removeButton)

      await expectErrorToast('erro.*remover|erro.*excluir')
    })
  })

  describe('Edição de Ativos', () => {
    it('deve permitir editar quantidade de ativo existente', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })

      // Encontrar botão de editar
      const editButton = screen.getByRole('button', {
        name: /editar.*aapl|alterar.*aapl/i
      })
      await userEvent.click(editButton)

      // Deve abrir modal/formulário de edição
      await waitFor(() => {
        expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument()
      })

      // Alterar quantidade
      const quantityInput = screen.getByLabelText(/quantidade/i)
      await userEvent.clear(quantityInput)
      await userEvent.type(quantityInput, '20')

      const saveButton = screen.getByRole('button', { name: /salvar|confirmar/i })
      await userEvent.click(saveButton)

      // Verificar chamada ao serviço
      await waitFor(() => {
        expect(mockFirestoreService.updateStock).toHaveBeenCalledWith(
          expect.any(String), // userId
          'AAPL',
          expect.objectContaining({
            quantity: 20
          })
        )
      })
    })

    it('deve permitir editar alocação alvo', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', {
        name: /editar.*aapl|alterar.*aapl/i
      })
      await userEvent.click(editButton)

      await waitFor(() => {
        expect(screen.getByLabelText(/meta|target|alocação.*desejada/i)).toBeInTheDocument()
      })

      // Alterar alocação alvo
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)
      await userEvent.clear(targetInput)
      await userEvent.type(targetInput, '35')

      const saveButton = screen.getByRole('button', { name: /salvar|confirmar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(mockFirestoreService.updateStock).toHaveBeenCalledWith(
          expect.any(String), // userId
          'AAPL',
          expect.objectContaining({
            targetPercentage: 35
          })
        )
      })
    })
  })

  describe('Busca e Filtros', () => {
    it('deve permitir buscar ativo por ticker', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('GOOGL')).toBeInTheDocument()
      })

      // Buscar por AAPL
      const searchInput = screen.getByPlaceholderText(/buscar|pesquisar/i)
      await userEvent.type(searchInput, 'AAPL')

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.queryByText('GOOGL')).not.toBeInTheDocument()
      })
    })

    it('deve permitir buscar ativo por nome', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
        expect(screen.getByText('Alphabet Inc.')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/buscar|pesquisar/i)
      await userEvent.type(searchInput, 'Apple')

      await waitFor(() => {
        expect(screen.getByText('Apple Inc.')).toBeInTheDocument()
        expect(screen.queryByText('Alphabet Inc.')).not.toBeInTheDocument()
      })
    })

    it('deve exibir mensagem quando busca não retornar resultados', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/buscar|pesquisar/i)
      await userEvent.type(searchInput, 'INEXISTENTE')

      await waitFor(() => {
        expect(screen.getByText(/nenhum.*resultado|não.*encontrado/i)).toBeInTheDocument()
      })
    })
  })

  describe('Validação de Alocações', () => {
    it('deve alertar quando soma das alocações exceder 100%', async () => {
      // Mock com portfólio que soma mais de 100%
      const invalidPortfolio = {
        'AAPL': { ...mockPortfolioData.AAPL, targetPercentage: 60 },
        'GOOGL': { ...mockPortfolioData.GOOGL, targetPercentage: 50 }
      }

      mockFirestoreService.getUserPortfolio.mockResolvedValue(invalidPortfolio)

      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/soma.*alocações.*excede|total.*maior.*100/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar total de alocações atual', async () => {
      render(
        <TestWrapper>
          <StockList />
        </TestWrapper>
      )

      await waitFor(() => {
        // 30% + 25% = 55%
        expect(screen.getByText(/total.*55%|55%.*total/i)).toBeInTheDocument()
      })
    })
  })
})
