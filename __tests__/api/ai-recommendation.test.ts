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
})
