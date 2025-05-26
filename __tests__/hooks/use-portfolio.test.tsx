import { renderHook, act, waitFor } from "@testing-library/react"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAuth } from "@/contexts/auth-context"
import { getPortfolio, addStock, removeStock, updateStock } from "@/lib/firestore"
import { fetchStockPrice } from "@/lib/api"

// Mock dos hooks e funções
jest.mock("@/contexts/auth-context")
jest.mock("@/lib/firestore")
jest.mock("@/lib/api")

describe("usePortfolio hook", () => {
  beforeEach(() => {
    jest.resetAllMocks()

    // Mock do useAuth
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "test-user-id" },
    })

    // Mock do getPortfolio
    ;(getPortfolio as jest.Mock).mockResolvedValue({
      PETR4: {
        ticker: "PETR4",
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        ticker: "VALE3",
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Manter",
      },
    })

    // Mock do fetchStockPrice
    ;(fetchStockPrice as jest.Mock).mockImplementation((ticker) => {
      const prices: Record<string, number> = {
        PETR4: 25.5,
        VALE3: 68.75,
        ITUB4: 32.4,
      }
      return Promise.resolve(prices[ticker] || 50.0)
    })
  })

  it("should load portfolio data on mount", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Inicialmente, o estado de loading deve ser true
    expect(result.current.loading).toBe(true)

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se o portfólio foi carregado corretamente
    expect(result.current.stocks).toEqual({
      PETR4: {
        ticker: "PETR4",
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        ticker: "VALE3",
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Manter",
      },
    })

    // Verificar se os detalhes das ações foram calculados corretamente
    expect(result.current.stocksWithDetails).toHaveLength(2)

    // Verificar PETR4
    const petr4 = result.current.stocksWithDetails.find((stock) => stock.ticker === "PETR4")
    expect(petr4).toBeDefined()
    expect(petr4?.currentPrice).toBe(25.5)
    expect(petr4?.currentValue).toBe(255.0) // 10 * 25.50

    // Verificar VALE3
    const vale3 = result.current.stocksWithDetails.find((stock) => stock.ticker === "VALE3")
    expect(vale3).toBeDefined()
    expect(vale3?.currentPrice).toBe(68.75)
    expect(vale3?.currentValue).toBe(1031.25) // 15 * 68.75
  })

  it("should add a stock to the portfolio", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Adicionar uma nova ação
    await act(async () => {
      await result.current.addStockToPortfolio("ITUB4", {
        quantity: 20,
        targetPercentage: 15,
        userRecommendation: "Comprar",
      })
    })

    // Verificar se addStock foi chamado com os parâmetros corretos
    expect(addStock).toHaveBeenCalledWith("test-user-id", "ITUB4", {
      quantity: 20,
      targetPercentage: 15,
      userRecommendation: "Comprar",
    })

    // Verificar se o estado local foi atualizado
    expect(result.current.stocks).toHaveProperty("ITUB4")
    expect(result.current.stocks.ITUB4).toEqual({
      ticker: "ITUB4",
      quantity: 20,
      targetPercentage: 15,
      userRecommendation: "Comprar",
    })
  })

  it("should remove a stock from the portfolio", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Remover uma ação
    await act(async () => {
      await result.current.removeStockFromPortfolio("PETR4")
    })

    // Verificar se removeStock foi chamado com os parâmetros corretos
    expect(removeStock).toHaveBeenCalledWith("test-user-id", "PETR4")

    // Verificar se o estado local foi atualizado
    expect(result.current.stocks).not.toHaveProperty("PETR4")
  })

  it("should update a stock in the portfolio", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Atualizar uma ação
    await act(async () => {
      await result.current.updateStockInPortfolio("VALE3", {
        quantity: 20,
        targetPercentage: 35,
      })
    })

    // Verificar se updateStock foi chamado com os parâmetros corretos
    expect(updateStock).toHaveBeenCalledWith("test-user-id", "VALE3", {
      quantity: 20,
      targetPercentage: 35,
    })

    // Verificar se o estado local foi atualizado
    expect(result.current.stocks.VALE3).toEqual({
      ticker: "VALE3",
      quantity: 20,
      targetPercentage: 35,
      userRecommendation: "Manter",
    })
  })

  it("should handle error when loading portfolio", async () => {
    // Configurar getPortfolio para lançar um erro
    ;(getPortfolio as jest.Mock).mockRejectedValueOnce(new Error("Failed to load portfolio"))

    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se o erro foi definido
    expect(result.current.error).toBe("Não foi possível carregar sua carteira. Tente novamente mais tarde.")

    // Verificar se o portfólio está vazio
    expect(result.current.stocks).toEqual({})
    expect(result.current.stocksWithDetails).toEqual([])
  })

  it("should handle error when fetching stock prices", async () => {
    // Configurar fetchStockPrice para lançar um erro para PETR4
    ;(fetchStockPrice as jest.Mock).mockImplementation((ticker) => {
      if (ticker === "PETR4") {
        return Promise.reject(new Error("Failed to fetch price"))
      }
      return Promise.resolve(68.75) // Preço para VALE3
    })

    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se não há erro geral
    expect(result.current.error).toBeNull()

    // Verificar se os detalhes das ações foram calculados corretamente
    expect(result.current.stocksWithDetails).toHaveLength(2)

    // Verificar PETR4 (deve usar um preço simulado)
    const petr4 = result.current.stocksWithDetails.find((stock) => stock.ticker === "PETR4")
    expect(petr4).toBeDefined()
    expect(petr4?.currentPrice).toBe(0) // Preço zero para ação com erro

    // Verificar VALE3
    const vale3 = result.current.stocksWithDetails.find((stock) => stock.ticker === "VALE3")
    expect(vale3).toBeDefined()
    expect(vale3?.currentPrice).toBe(68.75)
  })

  it("should refresh portfolio data", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Configurar getPortfolio para retornar dados atualizados
    ;(getPortfolio as jest.Mock).mockResolvedValueOnce({
      PETR4: {
        ticker: "PETR4",
        quantity: 15, // Quantidade atualizada
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        ticker: "VALE3",
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Manter",
      },
    })

    // Atualizar o portfólio
    await act(async () => {
      await result.current.refreshPortfolio()
    })

    // Verificar se getPortfolio foi chamado novamente
    expect(getPortfolio).toHaveBeenCalledTimes(2)

    // Verificar se o portfólio foi atualizado
    expect(result.current.stocks.PETR4.quantity).toBe(15)
  })

  it("should calculate total portfolio value correctly", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se o valor total da carteira foi calculado corretamente
    const totalValue = result.current.totalPortfolioValue
    expect(totalValue).toBeCloseTo(1286.25, 2) // 255.0 (PETR4) + 1031.25 (VALE3)
  })

  it("should handle adding a stock with an existing ticker", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Adicionar uma ação com um ticker existente
    await act(async () => {
      await result.current.addStockToPortfolio("PETR4", {
        quantity: 5,
        targetPercentage: 25,
        userRecommendation: "Manter",
      })
    })

    // Verificar se addStock foi chamado com os parâmetros corretos
    expect(addStock).toHaveBeenCalledWith("test-user-id", "PETR4", {
      quantity: 5,
      targetPercentage: 25,
      userRecommendation: "Manter",
    })

    // Verificar se o estado local foi atualizado
    expect(result.current.stocks.PETR4).toEqual({
      ticker: "PETR4",
      quantity: 5,
      targetPercentage: 25,
      userRecommendation: "Manter",
    })
  })

  it("should handle removing a stock that does not exist", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Remover uma ação que não existe
    await act(async () => {
      await result.current.removeStockFromPortfolio("ITUB4")
    })

    // Verificar se removeStock foi chamado com os parâmetros corretos
    expect(removeStock).toHaveBeenCalledWith("test-user-id", "ITUB4")

    // Verificar se o estado local não foi alterado
    expect(result.current.stocks).not.toHaveProperty("ITUB4")
  })

  it("should handle updating a stock that does not exist", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Atualizar uma ação que não existe
    await act(async () => {
      await result.current.updateStockInPortfolio("ITUB4", {
        quantity: 10,
        targetPercentage: 20,
      })
    })

    // Verificar se updateStock não foi chamado
    expect(updateStock).not.toHaveBeenCalled()

    // Verificar se o estado local não foi alterado
    expect(result.current.stocks).not.toHaveProperty("ITUB4")
  })

  // New tests for edge cases and error handling
  it("should handle adding a stock with invalid data", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Tentar adicionar uma ação com dados inválidos
    await act(async () => {
      await result.current.addStockToPortfolio("INVALID", {
        quantity: -10,
        targetPercentage: 150,
        userRecommendation: "Invalid",
      })
    })

    // Verificar se addStock não foi chamado
    expect(addStock).not.toHaveBeenCalled()

    // Verificar se o estado local não foi alterado
    expect(result.current.stocks).not.toHaveProperty("INVALID")
  })

  it("should handle removing a stock with invalid ticker", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Tentar remover uma ação com ticker inválido
    await act(async () => {
      await result.current.removeStockFromPortfolio("")
    })

    // Verificar se removeStock não foi chamado
    expect(removeStock).not.toHaveBeenCalled()

    // Verificar se o estado local não foi alterado
    expect(result.current.stocks).toEqual({
      PETR4: {
        ticker: "PETR4",
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        ticker: "VALE3",
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Manter",
      },
    })
  })

  it("should handle updating a stock with invalid data", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Tentar atualizar uma ação com dados inválidos
    await act(async () => {
      await result.current.updateStockInPortfolio("PETR4", {
        quantity: -5,
        targetPercentage: 200,
      })
    })

    // Verificar se updateStock não foi chamado
    expect(updateStock).not.toHaveBeenCalled()

    // Verificar se o estado local não foi alterado
    expect(result.current.stocks.PETR4).toEqual({
      ticker: "PETR4",
      quantity: 10,
      targetPercentage: 20,
      userRecommendation: "Comprar",
    })
  })

  it("should handle network error when fetching stock prices", async () => {
    // Configurar fetchStockPrice para lançar um erro de rede
    ;(fetchStockPrice as jest.Mock).mockImplementation((ticker) => {
      if (ticker === "PETR4") {
        return Promise.reject(new Error("Network error"))
      }
      return Promise.resolve(68.75) // Preço para VALE3
    })

    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se não há erro geral
    expect(result.current.error).toBeNull()

    // Verificar se os detalhes das ações foram calculados corretamente
    expect(result.current.stocksWithDetails).toHaveLength(2)

    // Verificar PETR4 (deve usar um preço simulado)
    const petr4 = result.current.stocksWithDetails.find((stock) => stock.ticker === "PETR4")
    expect(petr4).toBeDefined()
    expect(petr4?.currentPrice).toBe(0) // Preço zero para ação com erro

    // Verificar VALE3
    const vale3 = result.current.stocksWithDetails.find((stock) => stock.ticker === "VALE3")
    expect(vale3).toBeDefined()
    expect(vale3?.currentPrice).toBe(68.75)
  })

  it("should handle unexpected error when loading portfolio", async () => {
    // Configurar getPortfolio para lançar um erro inesperado
    ;(getPortfolio as jest.Mock).mockRejectedValueOnce(new Error("Unexpected error"))

    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se o erro foi definido
    expect(result.current.error).toBe("Não foi possível carregar sua carteira. Tente novamente mais tarde.")

    // Verificar se o portfólio está vazio
    expect(result.current.stocks).toEqual({})
    expect(result.current.stocksWithDetails).toEqual([])
  })
})
