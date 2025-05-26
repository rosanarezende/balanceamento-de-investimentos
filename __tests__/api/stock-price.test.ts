import { GET } from "@/app/api/stock-price/route"
import { NextRequest } from "next/server"
import { fetchStockPriceServer } from "@/lib/server/stock-price"
import { jest } from "@jest/globals"

jest.mock("@/lib/server/stock-price", () => ({
  fetchStockPriceServer: jest.fn(),
}))

const mockedFetchStockPriceServer = fetchStockPriceServer as jest.MockedFunction<typeof fetchStockPriceServer>

describe("Stock Price API", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("deve retornar erro se ticker não for fornecido", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty("error")
    expect(data.error).toBe("Ticker não fornecido")
  })

  it("deve retornar preço ao buscar com sucesso", async () => {
    mockedFetchStockPriceServer.mockResolvedValueOnce(99.99)

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty("price")
    expect(data.price).toBe(99.99)
    expect(mockedFetchStockPriceServer).toHaveBeenCalledWith("PETR4")
  })

  it("deve retornar erro ao lançar exceção", async () => {
    mockedFetchStockPriceServer.mockRejectedValueOnce(new Error("Erro ao buscar preço"))

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty("error")
    expect(data.error).toBe("Erro ao buscar preço")
  })

  it("deve retornar erro 400 se não houver ações elegíveis para investimento", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eligibleStocks: [],
      }),
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Não há ações elegíveis para investimento")
  })

  it("deve retornar erro 400 se o valor de investimento for inválido", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price", {
      method: "POST",
      headers: {
: "application/json",
      },
      body: JSON.stringify({
        investmentValue: -1000,
      }),
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Valor de investimento inválido")
  })

  it("deve retornar erro 400 se o valor de investimento for zero", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        investmentValue: 0,
      }),
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Valor de investimento não pode ser zero")
  })

  it("deve retornar erro 400 se o valor de investimento for não numérico", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        investmentValue: "mil",
      }),
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Valor de investimento deve ser numérico")
  })

  it("deve retornar erro 500 se ocorrer um erro ao buscar o preço da ação", async () => {
    mockedFetchStockPriceServer.mockRejectedValueOnce(new Error("Erro ao buscar preço"))

    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=PETR4")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data).toHaveProperty("error")
    expect(data.error).toBe("Erro ao buscar preço")
  })

  it("deve retornar erro 400 se o ticker for uma string vazia", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty("error")
    expect(data.error).toBe("Ticker não fornecido")
  })

  it("deve retornar erro 400 se o ticker não for uma string", async () => {
    const request = new NextRequest("http://localhost:3000/api/stock-price?ticker=123")
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty("error")
    expect(data.error).toBe("Ticker não fornecido")
  })
})
