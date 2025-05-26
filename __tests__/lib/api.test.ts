import { fetchStockPrice, RECOMMENDATION_TYPES, RECOMMENDATION_DESCRIPTIONS, saveManualRecommendation, getStockPrice, getMultipleStockPrices, simulateStockPrices, isDevelopment } from "@/lib/api"
import { getCachedStockPrice, setCachedStockPrice } from "@/lib/cache"

// Mock do fetch
global.fetch = jest.fn()

// Mock do cache
jest.mock("@/lib/cache", () => ({
  getCachedStockPrice: jest.fn(),
  setCachedStockPrice: jest.fn(),
}))

describe("API", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("fetchStockPrice", () => {
    it("should return cached price if available", async () => {
      // Configurar o mock do cache para retornar um preço
      ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(42.5)

      const price = await fetchStockPrice("PETR4")

      // Verificar se getCachedStockPrice foi chamado com o ticker correto
      expect(getCachedStockPrice).toHaveBeenCalledWith("PETR4")

      // Verificar se o preço foi retornado corretamente
      expect(price).toBe(42.5)

      // Verificar se fetch não foi chamado
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it("should fetch stock price successfully if not cached", async () => {
      // Configurar o mock do cache para retornar null (não encontrado)
      ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

      // Configurar o mock para simular resposta bem-sucedida
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: 42.5 }),
      })

      const price = await fetchStockPrice("PETR4")

      // Verificar se fetch foi chamado com a URL correta
      expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=PETR4")

      // Verificar se o preço foi retornado corretamente
      expect(price).toBe(42.5)

      // Verificar se o preço foi armazenado no cache
      expect(setCachedStockPrice).toHaveBeenCalledWith("PETR4", 42.5)
    })

    it("should throw error when fetch fails", async () => {
      // Configurar o mock do cache para retornar null (não encontrado)
      ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

      // Configurar o mock para simular resposta com erro
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      // Verificar se a função lança um erro
      await expect(fetchStockPrice("INVALID")).rejects.toThrow("Erro ao buscar preço: 404")
    })

    it("should throw error when network fails", async () => {
      // Configurar o mock do cache para retornar null (não encontrado)
      ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

      // Configurar o mock para simular erro de rede
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

      // Verificar se a função lança um erro
      await expect(fetchStockPrice("PETR4")).rejects.toThrow("Network error")
    })
  })

  describe("RECOMMENDATION_TYPES", () => {
    it("should contain valid recommendation types", () => {
      expect(RECOMMENDATION_TYPES).toEqual(["Comprar", "Vender", "Aguardar"])
    })
  })

  describe("RECOMMENDATION_DESCRIPTIONS", () => {
    it("should contain descriptions for all recommendation types", () => {
      expect(Object.keys(RECOMMENDATION_DESCRIPTIONS)).toEqual(["Comprar", "Vender", "Aguardar"])

      // Verificar se cada tipo tem uma descrição não vazia
      for (const type of RECOMMENDATION_TYPES) {
        expect(RECOMMENDATION_DESCRIPTIONS[type as keyof typeof RECOMMENDATION_DESCRIPTIONS]).toBeTruthy()
      }
    })
  })

  describe("saveManualRecommendation", () => {
    it("should resolve without error", async () => {
      // Espionar o console.log
      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      await expect(saveManualRecommendation("PETR4", "Comprar")).resolves.not.toThrow()

      // Verificar se console.log foi chamado
      expect(consoleSpy).toHaveBeenCalledWith("Salvando recomendação manual para PETR4: Comprar")

      // Restaurar o console.log
      consoleSpy.mockRestore()
    })
  })

  describe("getStockPrice", () => {
    it("should return stock price successfully", async () => {
      // Configurar o mock para simular resposta bem-sucedida
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ price: 42.5 }),
      })

      const price = await getStockPrice("PETR4")

      // Verificar se fetch foi chamado com a URL correta
      expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=PETR4")

      // Verificar se o preço foi retornado corretamente
      expect(price).toBe(42.5)
    })

    it("should return null when fetch fails", async () => {
      // Configurar o mock para simular resposta com erro
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      const price = await getStockPrice("INVALID")

      // Verificar se o preço retornado é null
      expect(price).toBeNull()
    })

    it("should return null when network fails", async () => {
      // Configurar o mock para simular erro de rede
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"))

      const price = await getStockPrice("PETR4")

      // Verificar se o preço retornado é null
      expect(price).toBeNull()
    })
  })

  describe("getMultipleStockPrices", () => {
    it("should return multiple stock prices successfully", async () => {
      // Configurar o mock para simular resposta bem-sucedida
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ price: 42.5 }),
      })

      const tickers = ["PETR4", "VALE3"]
      const prices = await getMultipleStockPrices(tickers)

      // Verificar se fetch foi chamado com as URLs corretas
      expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=PETR4")
      expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=VALE3")

      // Verificar se os preços foram retornados corretamente
      expect(prices).toEqual({
        PETR4: 42.5,
        VALE3: 42.5,
      })
    })

    it("should handle failed fetches and return partial results", async () => {
      // Configurar o mock para simular resposta bem-sucedida e falha
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ price: 42.5 }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
        })

      const tickers = ["PETR4", "INVALID"]
      const prices = await getMultipleStockPrices(tickers)

      // Verificar se fetch foi chamado com as URLs corretas
      expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=PETR4")
      expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=INVALID")

      // Verificar se os preços foram retornados corretamente
      expect(prices).toEqual({
        PETR4: 42.5,
      })
    })
  })

  describe("simulateStockPrices", () => {
    it("should return simulated stock prices", () => {
      const tickers = ["PETR4", "VALE3"]
      const prices = simulateStockPrices(tickers)

      // Verificar se os preços simulados estão no intervalo esperado
      for (const ticker of tickers) {
        expect(prices[ticker]).toBeGreaterThanOrEqual(10)
        expect(prices[ticker]).toBeLessThanOrEqual(100)
      }
    })
  })

  describe("isDevelopment", () => {
    it("should return true in development environment", () => {
      process.env.NODE_ENV = "development"
      expect(isDevelopment()).toBe(true)
    })

    it("should return false in production environment", () => {
      process.env.NODE_ENV = "production"
      expect(isDevelopment()).toBe(false)
    })
  })
})
