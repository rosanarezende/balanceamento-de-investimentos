import type React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { useRouter, useSearchParams } from "next/navigation"
import CalculadoraBalanceamento from "@/app/calculadora-balanceamento/page"
import ResultadoCalculadora from "@/app/calculadora-balanceamento/resultado/page"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAuth } from "@/contexts/auth-context"
import { saveSimulation } from "@/lib/firestore"

// Mock do useRouter e useSearchParams
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}))

// Mock do usePortfolio
jest.mock("@/hooks/use-portfolio")

// Mock do useAuth
jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock do ThemeProvider
jest.mock("@/contexts/theme-context", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock do AuthGuard
jest.mock("@/components/auth-guard", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock do saveSimulation
jest.mock("@/lib/firestore", () => ({
  saveSimulation: jest.fn(),
}))

describe("Calculator Flow Integration", () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  }

  const mockSearchParams = {
    get: jest.fn(),
  }

  const mockStocksWithDetails = [
    {
      ticker: "PETR4",
      quantity: 10,
      targetPercentage: 20,
      currentPrice: 25.5,
      currentValue: 255.0,
      currentPercentage: 19.83,
      toBuy: 2.25,
      excess: 0,
      userRecommendation: "Comprar",
    },
    {
      ticker: "VALE3",
      quantity: 15,
      targetPercentage: 30,
      currentPrice: 68.75,
      currentValue: 1031.25,
      currentPercentage: 80.17,
      toBuy: 0,
      excess: 645.37,
      userRecommendation: "Aguardar",
    },
  ]

  const mockPortfolioHook = {
    portfolio: {
      PETR4: {
        quantity: 10,
        targetPercentage: 20,
        userRecommendation: "Comprar",
      },
      VALE3: {
        quantity: 15,
        targetPercentage: 30,
        userRecommendation: "Aguardar",
      },
    },
    stocksWithDetails: mockStocksWithDetails,
    loading: false,
    error: null,
    refreshPortfolio: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(usePortfolio as jest.Mock).mockReturnValue(mockPortfolioHook)
    ;(useAuth as jest.Mock).mockReturnValue({
      user: { uid: "test-user-id" },
      loading: false,
    })
  })

  it("should handle investment value input and calculation", async () => {
    render(<CalculadoraBalanceamento />)

    // Verificar se o título é exibido
    expect(screen.getByText("Calculadora De Balanceamento")).toBeInTheDocument()

    // Verificar se o campo de entrada é exibido
    const input = screen.getByRole("textbox")
    expect(input).toBeInTheDocument()

    // Inserir um valor de investimento
    fireEvent.change(input, { target: { value: "1000,00" } })

    // Clicar no botão de calcular
    fireEvent.click(screen.getByText("Calcular"))

    // Verificar se o router.push foi chamado com o valor correto
    expect(mockRouter.push).toHaveBeenCalledWith("/calculadora-balanceamento/resultado?valor=1000")
  })

  it("should validate investment value", async () => {
    render(<CalculadoraBalanceamento />)

    // Inserir um valor inválido (zero)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "0,00" } })

    // Clicar no botão de calcular
    fireEvent.click(screen.getByText("Calcular"))

    // Verificar se a mensagem de erro é exibida
    expect(screen.getByText("Por favor, insira um valor válido para o aporte.")).toBeInTheDocument()

    // Verificar se o router.push não foi chamado
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it("should display calculation results", async () => {
    // Configurar mockSearchParams para retornar valor de investimento
    mockSearchParams.get.mockReturnValue("1000")

    render(<ResultadoCalculadora />)

    // Verificar se o título é exibido
    expect(screen.getByText("3º Passo")).toBeInTheDocument()

    // Aguardar o carregamento dos resultados
    await waitFor(() => {
      expect(screen.queryByText("Calculando recomendações de investimento...")).not.toBeInTheDocument()
    })

    // Verificar se os cards de alocação são exibidos
    expect(screen.getByText("PETR4")).toBeInTheDocument()

    // Verificar se o botão de confirmar é exibido
    expect(screen.getByText("CONFIRME O TERMO ACIMA")).toBeInTheDocument()

    // Clicar no botão de confirmar
    fireEvent.click(screen.getByText("CONFIRME O TERMO ACIMA"))

    // Verificar se o modal de confirmação é exibido
    expect(screen.getByText("Confirmar Simulação")).toBeInTheDocument()

    // Confirmar a simulação
    fireEvent.click(screen.getByText("Confirmar"))

    // Verificar se saveSimulation foi chamado
    expect(saveSimulation).toHaveBeenCalled()

    // Verificar se o redirecionamento foi feito
    expect(mockRouter.push).toHaveBeenCalledWith("/historico")
  })

  it("should handle no eligible stocks", async () => {
    // Configurar mockSearchParams para retornar valor de investimento
    mockSearchParams.get.mockReturnValue("1000")

    // Configurar usePortfolio para retornar ações sem recomendação de compra
    ;(usePortfolio as jest.Mock).mockReturnValue({
      ...mockPortfolioHook,
      stocksWithDetails: [
        {
          ...mockStocksWithDetails[0],
          userRecommendation: "Aguardar",
        },
        {
          ...mockStocksWithDetails[1],
          userRecommendation: "Vender",
        },
      ],
    })

    render(<ResultadoCalculadora />)

    // Aguardar o carregamento dos resultados
    await waitFor(() => {
      expect(screen.queryByText("Calculando recomendações de investimento...")).not.toBeInTheDocument()
    })

    // Verificar se a mensagem de nenhum ativo elegível é exibida
    expect(screen.getByText("Nenhum ativo elegível para aporte")).toBeInTheDocument()
  })

  it("should handle calculation error", async () => {
    // Configurar mockSearchParams para retornar valor de investimento
    mockSearchParams.get.mockReturnValue("1000")

    // Configurar usePortfolio para lançar um erro durante o cálculo
    const consoleSpy = jest.spyOn(console, "error").mockImplementation()

    render(<ResultadoCalculadora />)

    // Simular um erro durante o cálculo
    const error = new Error("Erro de cálculo")
    consoleSpy.mockImplementationOnce(() => {
      throw error
    })

    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(
        screen.queryByText("Não foi possível calcular as alocações. Por favor, tente novamente."),
      ).toBeInTheDocument()
    })

    // Restaurar o console.error
    consoleSpy.mockRestore()
  })

  it("should refresh portfolio", async () => {
    render(<CalculadoraBalanceamento />)

    // Verificar se o botão de atualizar carteira é exibido
    const refreshButton = screen.getByText("Atualizar Carteira")
    expect(refreshButton).toBeInTheDocument()

    // Clicar no botão de atualizar carteira
    fireEvent.click(refreshButton)

    // Verificar se a função de atualizar carteira foi chamada
    expect(mockPortfolioHook.refreshPortfolio).toHaveBeenCalled()
  })

  it("should handle API error in fetchStockPrice", async () => {
    // Configurar mockSearchParams para retornar valor de investimento
    mockSearchParams.get.mockReturnValue("1000")

    // Configurar usePortfolio para lançar um erro durante a chamada da API
    const consoleSpy = jest.spyOn(console, "error").mockImplementation()

    render(<ResultadoCalculadora />)

    // Simular um erro durante a chamada da API
    const error = new Error("Erro de API")
    consoleSpy.mockImplementationOnce(() => {
      throw error
    })

    // Verificar se a mensagem de erro é exibida
    await waitFor(() => {
      expect(
        screen.queryByText("Não foi possível obter os preços das ações. Por favor, tente novamente."),
      ).toBeInTheDocument()
    })

    // Restaurar o console.error
    consoleSpy.mockRestore()
  })
})
