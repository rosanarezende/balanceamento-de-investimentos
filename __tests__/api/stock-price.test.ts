import { GET } from "@/app/api/stock-price/route"
import { NextRequest } from "next/server"
import { getCachedStockPrice, setCachedStockPrice } from "@/lib/cache"
import { jest } from "@jest/globals"

// Mock do fetch
global.fetch = jest.fn()

// Mock do cache
jest.mock("@/lib/cache", () => ({
  getCachedStockPrice: jest.fn(),
  setCachedStockPrice: jest.fn(),
}))

describe("Stock Price API", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    process.env.NODE_ENV = "production" // Definir como produção por padrão
    process.env.ALPHA_VANTAGE_API_KEY = "test-api-key"
  })

  afterEach(() => {
    delete process.env.NODE_ENV
    delete process.env.ALPHA_VANTAGE_API_KEY
  })

  it("should return an error if ticker is not provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty("error")
    expect(data.error).toBe("Ticker não fornecido")
  })

  it("should return simulated price in development environment", async () => {
    // Definir como development para o teste
    process.env.NODE_ENV = "development"

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(typeof data.price).toBe("number")
    expect(data.price).toBeGreaterThan(0)
    expect(data.source).toBe("simulated")
  })

  it("should return cached price if available", async () => {
    // Configurar o mock do cache para retornar um preço
    ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(42.5)

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(data.price).toBe(42.5)
    expect(data.source).toBe("cache")

    // Verificar se getCachedStockPrice foi chamado com o ticker correto
    expect(getCachedStockPrice).toHaveBeenCalledWith("PETR4")

    // Verificar se fetch não foi chamado
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it("should fetch price from API if not cached", async () => {
    // Configurar o mock do cache para retornar null (não encontrado)
    ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

    // Configurar o mock do fetch para retornar um preço
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        "Global Quote": {
          "05. price": "42.50",
        },
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(data.price).toBe(42.5)
    expect(data.source).toBe("api")

    // Verificar se fetch foi chamado com a URL correta
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=PETR4.SA&apikey=test-api-key",
      ),
      expect.any(Object),
    )

    // Verificar se o preço foi armazenado no cache
    expect(setCachedStockPrice).toHaveBeenCalledWith("PETR4", 42.5)
  })

  it("should handle API errors gracefully", async () => {
    // Configurar o mock do cache para retornar null (não encontrado)
    ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

    // Configurar o mock do fetch para lançar um erro
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"))

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(typeof data.price).toBe("number")
    expect(data.price).toBeGreaterThan(0)
    expect(data.source).toBe("simulated")
    expect(data.error).toBe("API Error")
  })

  it("should handle API response without price", async () => {
    // Configurar o mock do cache para retornar null (não encontrado)
    ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

    // Configurar o mock do fetch para retornar uma resposta sem preço
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        "Global Quote": {},
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(typeof data.price).toBe("number")
    expect(data.price).toBeGreaterThan(0)
    expect(data.source).toBe("simulated")
  })

  it("should handle API rate limit exceeded", async () => {
    // Configurar o mock do cache para retornar null (não encontrado)
    ;(getCachedStockPrice as jest.Mock).mockResolvedValueOnce(null)

    // Configurar o mock do fetch para retornar uma resposta de limite excedido
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        Note: "Thank you for using Alpha Vantage! Our standard API call frequency is 5 calls per minute and 500 calls per day.",
      }),
    })

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(typeof data.price).toBe("number")
    expect(data.price).toBeGreaterThan(0)
    expect(data.source).toBe("simulated")
  })
})
