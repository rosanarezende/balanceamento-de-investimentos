import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { StockCard } from "@/components/stocks/stock-card"
import { formatCurrency } from "@/lib/utils"
import { fetchDailyChange } from "@/lib/api"

// Mock da função formatCurrency
jest.mock("@/lib/utils", () => ({
  formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
}))

// Mock da função fetchDailyChange
jest.mock("@/lib/api", () => ({
  fetchDailyChange: jest.fn(async (ticker) => {
    if (ticker === "PETR4") {
      return { change: 1.5, changePercentage: 3 }
    }
    return { change: 0, changePercentage: 0 }
  }),
}))

describe("StockCard", () => {
  const defaultProps = {
    ticker: "PETR4",
    quantity: 10,
    currentValue: 500,
    currentPercentage: 10,
    targetPercentage: 15,
    toBuy: 250,
    excess: 0,
    currentPrice: 50,
    dailyChange: 1.5,
    dailyChangePercentage: 3,
    userRecommendation: "Comprar",
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    loading: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should render stock information correctly", () => {
    render(<StockCard {...defaultProps} />)

    // Verificar se o ticker é exibido
    expect(screen.getByText("PETR4")).toBeInTheDocument()

    // Verificar se a quantidade é exibida
    expect(screen.getByText("10")).toBeInTheDocument()

    // Verificar se o valor atual é exibido
    expect(screen.getByText("R$ 500.00")).toBeInTheDocument()

    // Verificar se o percentual atual é exibido
    expect(screen.getByText("10.00%")).toBeInTheDocument()

    // Verificar se o percentual meta é exibido
    expect(screen.getByText("15.00%")).toBeInTheDocument()

    // Verificar se o valor a comprar é exibido
    expect(screen.getByText(/abaixo da meta/i)).toBeInTheDocument()
    expect(formatCurrency).toHaveBeenCalledWith(250)

    // Verificar se o preço atual é exibido
    expect(screen.getByText(/preço atual/i)).toBeInTheDocument()
    expect(formatCurrency).toHaveBeenCalledWith(50)

    // Verificar se a recomendação é exibida
    expect(screen.getByText("Comprar")).toBeInTheDocument()
  })

  it("should show excess value when excess > 0", () => {
    render(<StockCard {...defaultProps} toBuy={0} excess={100} />)

    // Verificar se o excesso é exibido
    expect(screen.getByText(/acima da meta/i)).toBeInTheDocument()
    expect(formatCurrency).toHaveBeenCalledWith(100)
  })

  it("should call onEdit when edit button is clicked", () => {
    render(<StockCard {...defaultProps} />)

    // Clicar no botão de editar
    fireEvent.click(screen.getByLabelText(/editar/i))

    // Verificar se onEdit foi chamado
    expect(defaultProps.onEdit).toHaveBeenCalled()
  })

  it("should call onDelete when delete button is clicked", () => {
    render(<StockCard {...defaultProps} />)

    // Clicar no botão de excluir
    fireEvent.click(screen.getByLabelText(/excluir/i))

    // Verificar se onDelete foi chamado
    expect(defaultProps.onDelete).toHaveBeenCalled()
  })

  it("should display positive daily change correctly", async () => {
    render(<StockCard {...defaultProps} />)

    // Verificar se a variação diária positiva é exibida corretamente
    await waitFor(() => {
      const dailyChange = screen.getByText("3.00%")
      expect(dailyChange).toBeInTheDocument()
      expect(dailyChange).toHaveClass("text-state-success")
    })
  })

  it("should display negative daily change correctly", async () => {
    render(<StockCard {...defaultProps} dailyChange={-1.5} dailyChangePercentage={-3} />)

    // Verificar se a variação diária negativa é exibida corretamente
    await waitFor(() => {
      const dailyChange = screen.getByText("3.00%")
      expect(dailyChange).toBeInTheDocument()
      expect(dailyChange).toHaveClass("text-state-error")
    })
  })

  it("should display loading state correctly", () => {
    render(<StockCard {...defaultProps} loading={true} />)

    // Verificar se o indicador de carregamento é exibido
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("should fetch daily change on mount", async () => {
    render(<StockCard {...defaultProps} />)

    // Verificar se fetchDailyChange foi chamado
    expect(fetchDailyChange).toHaveBeenCalledWith("PETR4")

    // Verificar se a variação diária é exibida corretamente
    await waitFor(() => {
      const dailyChange = screen.getByText("3.00%")
      expect(dailyChange).toBeInTheDocument()
    })
  })
})
