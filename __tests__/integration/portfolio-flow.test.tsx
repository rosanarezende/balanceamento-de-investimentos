import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter } from "next/navigation"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { StockList } from "@/components/stocks/stock-list"
import { usePortfolio } from "@/hooks/use-portfolio"

// Mock do useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

// Mock do usePortfolio
jest.mock("@/hooks/use-portfolio")

// Mock do useAuth
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "test-user-id" },
    loading: false,
  })),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock do useTheme
jest.mock("@/contexts/theme-context", () => ({
  useTheme: jest.fn(() => ({
    theme: "dark",
    toggleTheme: jest.fn(),
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

describe("Portfolio Flow Integration", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  const mockStocksWithDetails = [
    {
      ticker: "PETR4",
      quantity: 10,
      targetPercentage: 20,
      currentPrice: 25.5,
      currentValue: 255.0,
      currentPercentage: 19.83,
      toBuy: 2.25,
      excess: 0,
      userRecommendation: "Comprar",
    },
    {
      ticker: "VALE3",
      quantity: 15,
      targetPercentage: 30,
      currentPrice: 68.75,
      currentValue: 1031.25,
      currentPercentage: 80.17,
      toBuy: 0,
      excess: 645.37,
      userRecommendation: "Aguardar",
    },
  ]

  const mockPortfolioHook = {
    portfolio: {
      PETR4: {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Aguardar",
      },
    },
    stocksWithDetails: mockStocksWithDetails,
    loading: false,
    error: null,
    addOrUpdateStock: jest.fn(),
    removeStockFromPortfolio: jest.fn(),
    updateRecommendation: jest.fn(),
    refreshPortfolio: jest.fn(),
    getEligibleStocks: jest.fn(() => mockStocksWithDetails.filter(stock => stock.userRecommendation === "Comprar")),
    getUnderweightStocks: jest.fn(() => mockStocksWithDetails.filter(stock => stock.currentPercentage < stock.targetPercentage)),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(usePortfolio as jest.Mock).mockReturnValue(mockPortfolioHook)
  })

  it("should render stock list and handle stock operations", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Verificar se o título da seção é exibido
    expect(screen.getByText("Meus Ativos")).toBeInTheDocument()

    // Verificar se o subtítulo com a contagem de ativos é exibido
    expect(screen.getByText("2 ativos em sua carteira")).toBeInTheDocument()

    // Verificar se os cards das ações são exibidos
    expect(screen.getByText("PETR4")).toBeInTheDocument()
    expect(screen.getByText("VALE3")).toBeInTheDocument()

    // Verificar se os valores são exibidos corretamente
    expect(screen.getByText("10")).toBeInTheDocument() // Quantidade de PETR4
    expect(screen.getByText("15")).toBeInTheDocument() // Quantidade de VALE3

    // Clicar no botão de adicionar ativo
    fireEvent.click(screen.getByText("Adicionar Ativo"))

    // Verificar se o modal de edição é exibido
    await waitFor(() => {
      expect(screen.getByText("Adicionar Ativo")).toBeInTheDocument()
    })

    // Fechar o modal (simulando cancelamento)
    fireEvent.click(screen.getByText("Cancelar"))

    // Clicar no botão de editar de uma ação
    const editButtons = screen.getAllByLabelText(/editar/i)
    fireEvent.click(editButtons[0]) // Editar PETR4

    // Verificar se o modal de edição é exibido com os dados corretos
    await waitFor(() => {
      expect(screen.getByText("Editar Ativo")).toBeInTheDocument()
    })

    // Fechar o modal (simulando cancelamento)
    fireEvent.click(screen.getByText("Cancelar"))

    // Clicar no botão de excluir de uma ação
    const deleteButtons = screen.getAllByLabelText(/excluir/i)
    fireEvent.click(deleteButtons[0]) // Excluir PETR4

    // Verificar se o modal de confirmação é exibido
    await waitFor(() => {
      expect(screen.getByText("Excluir Ativo")).toBeInTheDocument()
      expect(screen.getByText(/Tem certeza que deseja excluir PETR4/i)).toBeInTheDocument()
    })

    // Confirmar a exclusão
    fireEvent.click(screen.getByText("Excluir"))

    // Verificar se removeStockFromPortfolio foi chamado
    expect(mockPortfolioHook.removeStockFromPortfolio).toHaveBeenCalledWith("PETR4")
  })

  it("should handle empty portfolio state", async () => {
    // Configurar usePortfolio para retornar portfólio vazio
    ;(usePortfolio as jest.Mock).mockReturnValue({
      ...mockPortfolioHook,
      portfolio: {},
      stocksWithDetails: [],
    })

    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Verificar se a mensagem de portfólio vazio é exibida
    expect(screen.getByText("Você ainda não possui ações na sua carteira.")).toBeInTheDocument()

    // Verificar se o botão de adicionar ativo é exibido
    expect(screen.getByText("Adicionar Ativo")).toBeInTheDocument()
  })

  it("should handle loading state", async () => {
    // Configurar usePortfolio para retornar estado de carregamento
    ;(usePortfolio as jest.Mock).mockReturnValue({
      ...mockPortfolioHook,
      loading: true,
    })

    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Verificar se o indicador de carregamento é exibido
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("should handle error state", async () => {
    // Configurar usePortfolio para retornar estado de erro
    ;(usePortfolio as jest.Mock).mockReturnValue({
      ...mockPortfolioHook,
      error: "Erro ao carregar carteira",
    })

    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Verificar se a mensagem de erro é exibida
    expect(screen.getByText("Erro ao carregar carteira")).toBeInTheDocument()

    // Verificar se o botão de tentar novamente é exibido
    expect(screen.getByText("Tentar Novamente")).toBeInTheDocument()
  })

  it("should refresh portfolio data", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Verificar se o botão de atualizar carteira é exibido
    const refreshButton = screen.getByTitle("Atualizar carteira")
    expect(refreshButton).toBeInTheDocument()

    // Clicar no botão de atualizar carteira
    fireEvent.click(refreshButton)

    // Verificar se a função refreshPortfolio foi chamada
    expect(mockPortfolioHook.refreshPortfolio).toHaveBeenCalled()
  })

  it("should show message if no eligible stocks for investment", async () => {
    // Configurar usePortfolio para retornar portfólio sem ações elegíveis
    ;(usePortfolio as jest.Mock).mockReturnValue({
      ...mockPortfolioHook,
      stocksWithDetails: mockStocksWithDetails.map(stock => ({
        ...stock,
        userRecommendation: "Aguardar",
      })),
    })

    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Verificar se a mensagem de "sem ativos para compra" é exibida
    expect(screen.getByText("Não há ativos marcados como 'Comprar' na sua carteira. Adicione recomendações aos seus ativos.")).toBeInTheDocument()
  })

  it("should handle adding a new stock", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Clicar no botão de adicionar ativo
    fireEvent.click(screen.getByText("Adicionar Ativo"))

    // Verificar se o modal de adição é exibido
    await waitFor(() => {
      expect(screen.getByText("Adicionar Ativo")).toBeInTheDocument()
    })

    // Preencher o formulário de adição
    fireEvent.change(screen.getByLabelText("Ticker"), { target: { value: "ITUB4" } })
    fireEvent.change(screen.getByLabelText("Quantidade"), { target: { value: "20" } })
    fireEvent.change(screen.getByLabelText("Percentual Meta"), { target: { value: "15" } })
    fireEvent.change(screen.getByLabelText("Recomendação"), { target: { value: "Comprar" } })

    // Submeter o formulário
    fireEvent.click(screen.getByText("Adicionar"))

    // Verificar se addOrUpdateStock foi chamado com os parâmetros corretos
    await waitFor(() => {
      expect(mockPortfolioHook.addOrUpdateStock).toHaveBeenCalledWith("ITUB4", {
        quantity: 20,
        targetPercentage: 15,
        userRecommendation: "Comprar",
      })
    })
  })

  it("should handle updating an existing stock", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Clicar no botão de editar de uma ação
    const editButtons = screen.getAllByLabelText(/editar/i)
    fireEvent.click(editButtons[0]) // Editar PETR4

    // Verificar se o modal de edição é exibido com os dados corretos
    await waitFor(() => {
      expect(screen.getByText("Editar Ativo")).toBeInTheDocument()
    })

    // Atualizar o formulário de edição
    fireEvent.change(screen.getByLabelText("Quantidade"), { target: { value: "15" } })
    fireEvent.change(screen.getByLabelText("Percentual Meta"), { target: { value: "25" } })

    // Submeter o formulário
    fireEvent.click(screen.getByText("Salvar"))

    // Verificar se addOrUpdateStock foi chamado com os parâmetros corretos
    await waitFor(() => {
      expect(mockPortfolioHook.addOrUpdateStock).toHaveBeenCalledWith("PETR4", {
        quantity: 15,
        targetPercentage: 25,
        userRecommendation: "Comprar",
      })
    })
  })

  it("should handle deleting a stock", async () => {
    render(
      <AuthProvider>
        <ThemeProvider>
          <StockList />
        </ThemeProvider>
      </AuthProvider>,
    )

    // Clicar no botão de excluir de uma ação
    const deleteButtons = screen.getAllByLabelText(/excluir/i)
    fireEvent.click(deleteButtons[0]) // Excluir PETR4

    // Verificar se o modal de confirmação é exibido
    await waitFor(() => {
      expect(screen.getByText("Excluir Ativo")).toBeInTheDocument()
      expect(screen.getByText(/Tem certeza que deseja excluir PETR4/i)).toBeInTheDocument()
    })

    // Confirmar a exclusão
    fireEvent.click(screen.getByText("Excluir"))

    // Verificar se removeStockFromPortfolio foi chamado
    await waitFor(() => {
      expect(mockPortfolioHook.removeStockFromPortfolio).toHaveBeenCalledWith("PETR4")
    })
  })
})
