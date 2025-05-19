import { renderHook, act } from "@testing-library/react"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAuth } from "@/contexts/auth-context"
import { getUserPortfolio, updateStock, removeStock } from "@/lib/firestore"

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
  })

  it("should load portfolio data on mount", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePortfolio())

    // Inicialmente, o estado de loading deve ser true
    expect(result.current.loading).toBe(true)

    await waitForNextUpdate()

    // Após carregar, o estado de loading deve ser false
    expect(result.current.loading).toBe(false)
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
  })

  it("should add or update a stock", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePortfolio())

    await waitForNextUpdate()

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
    const { result, waitForNextUpdate } = renderHook(() => usePortfolio())

    await waitForNextUpdate()

    await act(async () => {
      await result.current.removeStockFromPortfolio("PETR4")
    })

    // Verificar se removeStock foi chamado com os parâmetros corretos
    expect(removeStock).toHaveBeenCalledWith("test-user-id", "PETR4")

    // Verificar se o estado local foi atualizado
    expect(result.current.portfolio).not.toHaveProperty("PETR4")
  })

  it("should update recommendation", async () => {
    const { result, waitForNextUpdate } = renderHook(() => usePortfolio())

    await waitForNextUpdate()

    await act(async () => {
      await result.current.updateRecommendation("VALE3", "Evitar Aporte")
    })

    // Verificar se o estado local foi atualizado
    expect(result.current.portfolio.VALE3.userRecommendation).toBe("Evitar Aporte")
  })
})
