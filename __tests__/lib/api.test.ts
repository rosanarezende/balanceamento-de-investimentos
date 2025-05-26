import {
  getStockPrice,
  getMultipleStockPrices,
  simulateStockPrices,
  isDevelopment,
} from "@/lib/api"

describe("getStockPrice", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it("retorna o preço quando a resposta é válida", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ price: 42 }),
    })
    const price = await getStockPrice("ITUB4")
    expect(price).toBe(42)
    expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=ITUB4.SA")
  })

  it("retorna null quando a resposta não tem preço", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ price: null }),
    })
    const price = await getStockPrice("ITUB4")
    expect(price).toBeNull()
  })

  it("retorna null quando fetch falha", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))
    const price = await getStockPrice("ITUB4")
    expect(price).toBeNull()
  })

  it("adiciona .SA ao ticker se não houver ponto", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ price: 10 }),
    })
    await getStockPrice("PETR4")
    expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=PETR4.SA")
  })

  it("não adiciona .SA se já houver ponto", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ price: 10 }),
    })
    await getStockPrice("PETR4.SA")
    expect(global.fetch).toHaveBeenCalledWith("/api/stock-price?ticker=PETR4.SA")
  })
})

describe("getMultipleStockPrices", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it("retorna preços para múltiplos tickers", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ price: 10 }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ price: 20 }) })

    const result = await getMultipleStockPrices(["ITUB4", "PETR4"])
    expect(result).toEqual({ ITUB4: 10, PETR4: 20 })
  })

  it("contabiliza falhas e retorna apenas os preços válidos", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ price: 10 }) })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    const result = await getMultipleStockPrices(["ITUB4", "PETR4"])
    expect(result).toEqual({ ITUB4: 10 })
  })
})

describe("simulateStockPrices", () => {
  it("gera preços simulados para cada ticker", () => {
    const tickers = ["ITUB4", "PETR4", "VALE3"]
    const result = simulateStockPrices(tickers)
    expect(Object.keys(result)).toEqual(tickers)
    tickers.forEach(ticker => {
      expect(result[ticker]).toBeGreaterThanOrEqual(10)
      expect(result[ticker]).toBeLessThanOrEqual(100)
    })
  })
})

describe("isDevelopment", () => {
  it("retorna true se NODE_ENV for development", () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "development",
      configurable: true,
    })
    expect(isDevelopment()).toBe(true)
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    })
  })

  it("retorna false se NODE_ENV não for development", () => {
    const originalEnv = process.env.NODE_ENV
    Object.defineProperty(process.env, "NODE_ENV", {
      value: "production",
      configurable: true,
    })
    expect(isDevelopment()).toBe(false)
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalEnv,
      configurable: true,
    })
  })
})
