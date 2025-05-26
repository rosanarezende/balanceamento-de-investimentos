import { getCachedStockPrice, setCachedStockPrice, clearStockPriceCache } from "@/lib/cache"
import { clearAllStockPriceCache } from "@/lib/client-utils/stock-price-cache"

// Mock do localStorage
const mockLocalStorage = (() => {
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
    }),
  }
})()

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
})

describe("Cache", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()

    // Mock da data atual
    jest.spyOn(Date, "now").mockImplementation(() => 1609459200000) // 2021-01-01T00:00:00.000Z
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe("getCachedStockPrice", () => {
    it("should return null if no cached price exists", async () => {
      const price = await getCachedStockPrice("PETR4")

      expect(price).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("stock_price_PETR4")
    })

    it("should return null if cached price is expired", async () => {
      // Configurar um preço expirado (timestamp de 1 hora atrás)
      const expiredTimestamp = Date.now() - 3600000
      mockLocalStorage.setItem(
        "stock_price_PETR4",
        JSON.stringify({
          price: 42.5,
          timestamp: expiredTimestamp,
        }),
      )

      const price = await getCachedStockPrice("PETR4")

      expect(price).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("stock_price_PETR4")
    })

    it("should return cached price if not expired", async () => {
      // Configurar um preço válido (timestamp atual)
      mockLocalStorage.setItem(
        "stock_price_PETR4",
        JSON.stringify({
          value: 42.5,
          timestamp: Date.now(),
        }),
      )

      const price = await getCachedStockPrice("PETR4")

      expect(price).toBe(42.5)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("stock_price_PETR4")
    })

    it("should handle invalid JSON in cache", async () => {
      // Configurar um valor inválido no cache
      mockLocalStorage.setItem("stock_price_PETR4", "invalid-json")

      const price = await getCachedStockPrice("PETR4")

      expect(price).toBeNull()
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("stock_price_PETR4")
    })

    it("should throw an error if ticker is not a string", async () => {
      await expect(getCachedStockPrice(123 as any)).rejects.toThrow("Ticker deve ser uma string")
    })

    it("should throw an error if ticker is an empty string", async () => {
      await expect(getCachedStockPrice("")).rejects.toThrow("Ticker não pode estar vazio")
    })
  })

  describe("setCachedStockPrice", () => {
    it("should store price in cache with current timestamp", async () => {
      await setCachedStockPrice("PETR4", 42.5)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "stock_price_PETR4",
        JSON.stringify({
          value: 42.5,
          timestamp: Date.now(),
        }),
      )
    })

    it("should handle localStorage errors", async () => {
      // Configurar localStorage.setItem para lançar um erro
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error("localStorage error")
      })

      // Não deve lançar erro
      await expect(setCachedStockPrice("PETR4", 42.5)).resolves.not.toThrow()
    })

    it("should throw an error if ticker is not a string", async () => {
      await expect(setCachedStockPrice(123 as any, 42.5)).rejects.toThrow("Ticker deve ser uma string")
    })

    it("should throw an error if ticker is an empty string", async () => {
      await expect(setCachedStockPrice("", 42.5)).rejects.toThrow("Ticker não pode estar vazio")
    })
  })

  describe("clearStockPriceCache", () => {
    it("should remove cached price for specific ticker", async () => {
      await clearStockPriceCache("PETR4")

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("stock_price_PETR4")
    })

    it("should handle localStorage errors", async () => {
      // Configurar localStorage.removeItem para lançar um erro
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error("localStorage error")
      })

      // Não deve lançar erro
      await expect(clearStockPriceCache("PETR4")).resolves.not.toThrow()
    })

    it("should throw an error if ticker is not a string", async () => {
      await expect(clearStockPriceCache(123 as any)).rejects.toThrow("Ticker deve ser uma string")
    })

    it("should throw an error if ticker is an empty string", async () => {
      await expect(clearStockPriceCache("")).rejects.toThrow("Ticker não pode estar vazio")
    })
  })

  describe("clearAllStockPriceCache", () => {
    it("should clear all stock price cache", async () => {
      // Configurar alguns valores no cache
      mockLocalStorage.setItem("stock_price_PETR4", JSON.stringify({ value: 42.5, timestamp: Date.now() }))
      mockLocalStorage.setItem("stock_price_VALE3", JSON.stringify({ value: 55.0, timestamp: Date.now() }))

      await clearAllStockPriceCache()

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("stock_price_PETR4")
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("stock_price_VALE3")
    })

    it("should handle localStorage errors", async () => {
      // Configurar localStorage.removeItem para lançar um erro
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error("localStorage error")
      })

      // Não deve lançar erro
      await expect(clearAllStockPriceCache()).resolves.not.toThrow()
    })
  })
})
