import { renderHook, act, waitFor } from "@testing-library/react"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAuth } from "@/contexts/auth-context"
import { getUserPortfolio, updateStock, removeStock, updateUserRecommendation } from "@/lib/firestore"
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

    // Mock do getUserPortfolio
    ;(getUserPortfolio as jest.Mock).mockResolvedValue({
      PETR4: {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
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
    expect(result.current.portfolio).toEqual({
      PETR4: {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
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

  it("should add or update a stock", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Adicionar uma nova ação
    await act(async () => {
      await result.current.addOrUpdateStock("ITUB4", 20, 15, "Comprar")
    })

    // Verificar se updateStock foi chamado com os parâmetros corretos
    expect(updateStock).toHaveBeenCalledWith("test-user-id", "ITUB4", {
      quantity: 20,
      targetPercentage: 15,
      userRecommendation: "Comprar",
    })

    // Verificar se o estado local foi atualizado
    expect(result.current.portfolio).toHaveProperty("ITUB4")
    expect(result.current.portfolio.ITUB4).toEqual({
      quantity: 20,
      targetPercentage: 15,
      userRecommendation: "Comprar",
    })
  })

  it("should remove a stock", async () => {
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
    expect(result.current.portfolio).not.toHaveProperty("PETR4")
  })

  it("should update recommendation", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Atualizar a recomendação
    await act(async () => {
      await result.current.updateRecommendation("VALE3", "Vender")
    })

    // Verificar se updateUserRecommendation foi chamado com os parâmetros corretos
    expect(updateUserRecommendation).toHaveBeenCalledWith("test-user-id", "VALE3", "Vender")

    // Verificar se o estado local foi atualizado
    expect(result.current.portfolio.VALE3.userRecommendation).toBe("Vender")
  })

  it("should calculate toBuy and excess correctly", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se toBuy e excess foram calculados corretamente
    const totalValue = 255.0 + 1031.25 // PETR4 + VALE3

    // PETR4: targetPercentage = 20%, currentValue = 255.00
    // targetValue = totalValue * 20% = 1286.25 * 0.2 = 257.25
    // toBuy = max(0, targetValue - currentValue) = max(0, 257.25 - 255.00) = 2.25
    // excess = max(0, currentValue - targetValue) = max(0, 255.00 - 257.25) = 0
    const petr4 = result.current.stocksWithDetails.find((stock) => stock.ticker === "PETR4")
    expect(petr4?.toBuy).toBeCloseTo(2.25, 2)
    expect(petr4?.excess).toBe(0)

    // VALE3: targetPercentage = 30%, currentValue = 1031.25
    // targetValue = totalValue * 30% = 1286.25 * 0.3 = 385.88
    // toBuy = max(0, targetValue - currentValue) = max(0, 385.88 - 1031.25) = 0
    // excess = max(0, currentValue - targetValue) = max(0, 1031.25 - 385.88) = 645.37
    const vale3 = result.current.stocksWithDetails.find((stock) => stock.ticker === "VALE3")
    expect(vale3?.toBuy).toBe(0)
    expect(vale3?.excess).toBeCloseTo(645.37, 2)
  })

  it("should handle error when loading portfolio", async () => {
    // Configurar getUserPortfolio para lançar um erro
    ;(getUserPortfolio as jest.Mock).mockRejectedValueOnce(new Error("Failed to load portfolio"))

    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Verificar se o erro foi definido
    expect(result.current.error).toBe("Não foi possível carregar sua carteira. Por favor, tente novamente.")

    // Verificar se o portfólio está vazio
    expect(result.current.portfolio).toEqual({})
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

    // Configurar getUserPortfolio para retornar dados atualizados
    ;(getUserPortfolio as jest.Mock).mockResolvedValueOnce({
      PETR4: {
        quantity: 15, // Quantidade atualizada
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Manter",
      },
    })

    // Atualizar o portfólio
    await act(async () => {
      await result.current.refreshPortfolio()
    })

    // Verificar se getUserPortfolio foi chamado novamente
    expect(getUserPortfolio).toHaveBeenCalledTimes(2)

    // Verificar se o portfólio foi atualizado
    expect(result.current.portfolio.PETR4.quantity).toBe(15)
  })

  it("should get eligible stocks for investment", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Obter ações elegíveis para investimento
    const eligibleStocks = result.current.getEligibleStocks()

    // Verificar se a ação PETR4 é elegível
    expect(eligibleStocks).toHaveLength(1)
    expect(eligibleStocks[0].ticker).toBe("PETR4")
  })

  it("should get underweight stocks", async () => {
    const { result } = renderHook(() => usePortfolio())

    // Aguardar o carregamento dos dados
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Obter ações abaixo do peso
    const underweightStocks = result.current.getUnderweightStocks()

    // Verificar se a ação PETR4 está abaixo do peso
    expect(underweightStocks).toHaveLength(1)
    expect(underweightStocks[0].ticker).toBe("PETR4")
  })
})
