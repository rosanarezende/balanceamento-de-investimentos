import { POST } from "@/app/api/ai-recommendation/route"
import { generateText } from "@/lib/ai"
import { jest } from "@jest/globals"
import { fetchStockPrice } from "@/lib/api"

// Mock do AI SDK
jest.mock("@/lib/ai", () => ({
  generateText: jest.fn(),
}))

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>

jest.mock("@/lib/api", () => ({
  fetchStockPrice: jest.fn(),
}))

const mockFetchStockPrice = fetchStockPrice as jest.MockedFunction<typeof fetchStockPrice>

describe("API de Recomendação de IA", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("deve retornar erro 400 se o prompt não for fornecido", async () => {
    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt é obrigatório")
  })

  it("deve gerar uma recomendação usando o AI SDK", async () => {
    // Mock da resposta do AI SDK
    const mockRecommendation = "Esta é uma recomendação de teste gerada pela IA."
    mockGenerateText.mockResolvedValue({
      text: mockRecommendation,
    })

    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Analisar esta carteira de investimentos",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.recommendation).toBe(mockRecommendation)
    expect(mockGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "Analisar esta carteira de investimentos",
        maxTokens: 150,
        temperature: 0.7,
      }),
    )
  })

  it("deve retornar erro 500 se ocorrer um erro ao gerar a recomendação", async () => {
    // Mock de erro no AI SDK
    mockGenerateText.mockRejectedValue(new Error("Erro de API"))

    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Analisar esta carteira de investimentos",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Erro ao gerar recomendação")
  })

  it("deve retornar erro 400 se não houver ações elegíveis para investimento", async () => {
    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Analisar esta carteira de investimentos",
        eligibleStocks: [],
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Não há ações elegíveis para investimento")
  })

  it("deve retornar erro 400 se o valor de investimento for inválido", async () => {
    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Analisar esta carteira de investimentos",
        investmentValue: -1000,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Valor de investimento inválido")
  })

  it("deve retornar erro 500 se ocorrer um erro ao buscar o preço da ação", async () => {
    // Mock de erro na função fetchStockPrice
    mockFetchStockPrice.mockRejectedValue(new Error("Erro ao buscar preço"))

    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "Analisar esta carteira de investimentos",
        ticker: "AAPL",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe("Erro ao buscar preço")
  })
})
