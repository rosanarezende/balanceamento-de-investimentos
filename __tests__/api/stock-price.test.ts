import { GET } from "@/app/api/stock-price/route"
import { NextRequest } from "next/server"

// Mock do fetch
global.fetch = jest.fn()

describe("Stock Price API", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("should return an error if ticker is not provided", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty("error")
  })

  it("should return simulated price in development environment", async () => {
    // Salvar o NODE_ENV original
    const originalEnv = process.env.NODE_ENV

    // Definir como development para o teste
    process.env.NODE_ENV = "development"

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(typeof data.price).toBe("number")

    // Restaurar o NODE_ENV original
    process.env.NODE_ENV = originalEnv
  })

  it("should handle API errors gracefully", async () => {
    // Definir como production para testar a chamada à API
    process.env.NODE_ENV = "production"

    // Mock da resposta de erro da API
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("API Error"))

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(typeof data.price).toBe("number")
  })

  it("should parse API response correctly", async () => {
    // Definir como production para testar a chamada à API
    process.env.NODE_ENV = "production"

    // Mock da resposta bem-sucedida da API
    global.fetch = jest.fn().mockResolvedValueOnce({
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
  })
})
