import { POST } from "@/app/api/ai-recommendation/route"
import { generateText } from "@/lib/ai"
import { jest } from "@jest/globals"

// Mock do AI SDK
jest.mock("@/lib/ai", () => ({
  generateText: jest.fn(),
}))

const mockGenerateText = generateText as jest.MockedFunction<typeof generateText>

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
    expect(data.error).toBe("Prompt deve ser uma string")
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

  it("deve retornar erro 400 se o prompt for uma string vazia", async () => {
    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt não pode estar vazio")
  })

  it("deve retornar erro 400 se o prompt não for uma string", async () => {
    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: 123,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt deve ser uma string")
  })

  // New tests for edge cases and error handling
  it("deve retornar erro 400 se o prompt contiver apenas espaços em branco", async () => {
    const request = new Request("http://localhost:3000/api/ai-recommendation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: "   ",
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe("Prompt não pode estar vazio")
  })

  it("deve retornar erro 500 se o AI SDK retornar um erro inesperado", async () => {
    // Mock de erro inesperado no AI SDK
    mockGenerateText.mockRejectedValue(new Error("Erro inesperado"))

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

  it("deve retornar erro 500 se ocorrer um erro de rede ao chamar o AI SDK", async () => {
    // Mock de erro de rede no AI SDK
    mockGenerateText.mockRejectedValue(new Error("Erro de rede"))

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
})
