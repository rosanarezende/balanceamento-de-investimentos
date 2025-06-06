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

import { ListaAtivos } from '@/app/carteira/components'
import { AddStockForm } from '@/components/add-stock-form'
import { TestWrapper } from './helpers/test-wrapper'
import {
  mockAuth,
  mockAuthenticatedUser,
  resetAuthMocks,
  mockPortfolioData,
  mockFirestoreService,
  mockFirebaseAuth,
  setupStockPricesMock,
  setupFirestoreMocks
} from '@/__mocks__'
import {
  expectErrorToast,
  expectSuccessToast
} from './helpers/test-utils'



describe.skip('Testes de Gestão de Portfólio', () => {

  beforeEach(() => {
    resetAuthMocks()

    // Setup usuário autenticado
    mockAuthenticatedUser()
    Object.assign(mockFirebaseAuth, mockAuth)

    // Setup mocks do Firestore
    setupFirestoreMocks()

    // Setup mocks da API de preços
    setupStockPricesMock()
  })

  describe.skip('Listagem de Ativos', () => {
    it('deve exibir lista de ativos do portfólio', async () => {
      render(
        <TestWrapper>
          <ListaAtivos />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText('AAPL')).toBeInTheDocument()
        expect(screen.getByText('GOOGL')).toBeInTheDocument()
      })
    })

    it('deve exibir mensagem quando portfólio estiver vazio', async () => {
      mockFirestoreService.getUserPortfolio.mockResolvedValue({})

      render(
        <TestWrapper>
          <ListaAtivos />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/0 ativos em sua carteira/i)).toBeInTheDocument()
      })
    })

    it('deve exibir loading enquanto carrega ativos', async () => {
      // Simular delay no carregamento
      mockFirestoreService.getUserPortfolio.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockPortfolioData), 100))
      )

      render(
        <TestWrapper>
          <ListaAtivos />
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
          <ListaAtivos />
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
            quantity: 15,
            targetPercentage: 20,
            userRecommendation: 'Comprar'
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

      await waitFor(() => {
        expect(screen.getByLabelText(/código.*ativo|ticker/i)).toBeInTheDocument()
      })

      // não preencher o nome da ação, mas preencher os outros campos
      const quantityInput = screen.getByLabelText(/quantidade/i)
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)

      await userEvent.type(quantityInput, '10')
      await userEvent.type(targetInput, '50')

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })

      // o botão deve estar disabled
      expect(saveButton).toBeDisabled()
    })

    // TODO: implementar validação, de formato e também se é um nome de ação válido
    it.skip('deve validar formato do ticker', async () => {
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

      const tickerInput = screen.getByLabelText(/código.*ativo|ticker/i)
      const quantityInput = screen.getByLabelText(/quantidade/i)
      const targetInput = screen.getByLabelText(/meta|target|alocação.*desejada/i)

      await userEvent.type(tickerInput, 'AAPL')

      // Valores inválidos
      await userEvent.type(quantityInput, '-5') // negativo
      await userEvent.type(targetInput, '150') // maior que 100%

      const saveButton = screen.getByRole('button', { name: /salvar|adicionar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/número positivo|número entre 0 e 100/i)).toBeInTheDocument()
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

  describe.skip('Remoção de Ativos', () => {
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
          <ListaAtivos />
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
          <ListaAtivos />
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
          <ListaAtivos />
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

  describe.skip('Edição de Ativos', () => {
    it('deve permitir editar quantidade de ativo existente', async () => {
      render(
        <TestWrapper>
          <ListaAtivos />
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
          <ListaAtivos />
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

  describe.skip('Busca e Filtros', () => {
    it('deve permitir buscar ativo por ticker', async () => {
      render(
        <TestWrapper>
          <ListaAtivos />
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
          <ListaAtivos />
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
          <ListaAtivos />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/buscar|pesquisar/i)
      await userEvent.type(searchInput, 'INEXISTENTE')

      await waitFor(() => {
        expect(screen.getByText(/nenhum.*resultado|não.*encontrado/i)).toBeInTheDocument()
      })
    })
  })

  describe.skip('Validação de Alocações', () => {
    it('deve alertar quando soma das alocações exceder 100%', async () => {
      // Mock com portfólio que soma mais de 100%
      const invalidPortfolio = {
        'AAPL': { ...mockPortfolioData.AAPL, targetPercentage: 60 },
        'GOOGL': { ...mockPortfolioData.GOOGL, targetPercentage: 50 }
      }

      mockFirestoreService.getUserPortfolio.mockResolvedValue(invalidPortfolio)

      render(
        <TestWrapper>
          <ListaAtivos />
        </TestWrapper>
      )

      await waitFor(() => {
        expect(screen.getByText(/soma.*alocações.*excede|total.*maior.*100/i)).toBeInTheDocument()
      })
    })

    it('deve mostrar total de alocações atual', async () => {
      render(
        <TestWrapper>
          <ListaAtivos />
        </TestWrapper>
      )

      await waitFor(() => {
        // 30% + 25% = 55%
        expect(screen.getByText(/total.*55%|55%.*total/i)).toBeInTheDocument()
      })
    })
  })
})
