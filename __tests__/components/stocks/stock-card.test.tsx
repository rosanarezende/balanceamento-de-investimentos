import { render, screen, fireEvent } from "@testing-library/react"
import { StockCard } from "@/components/stocks/stock-card"
import { formatCurrency } from "@/lib/utils"

// Mock da função formatCurrency
jest.mock("@/lib/utils", () => ({
  formatCurrency: jest.fn((value) => `R$ ${value.toFixed(2)}`),
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
    dailyChange: 25,
    dailyChangePercentage: 5,
    userRecommendation: "Comprar",
    onEdit: jest.fn(),
    onDelete: jest.fn(),
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
    expect(screen.getByText(/a comprar/i)).toBeInTheDocument()
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
    expect(screen.getByText(/excesso/i)).toBeInTheDocument()
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

  it("should display positive daily change correctly", () => {
    render(<StockCard {...defaultProps} />)

    // Verificar se a variação diária positiva é exibida corretamente
    const dailyChange = screen.getByText(/\+R\$ 25\.00/i)
    expect(dailyChange).toBeInTheDocument()
    expect(dailyChange).toHaveClass("text-green-500")

    // Verificar se o percentual de variação diária positiva é exibido corretamente
    const dailyChangePercentage = screen.getByText(/\+5\.00%/i)
    expect(dailyChangePercentage).toBeInTheDocument()
    expect(dailyChangePercentage).toHaveClass("text-green-500")
  })

  it("should display negative daily change correctly", () => {
    render(<StockCard {...defaultProps} dailyChange={-25} dailyChangePercentage={-5} />)

    // Verificar se a variação diária negativa é exibida corretamente
    const dailyChange = screen.getByText(/-R\$ 25\.00/i)
    expect(dailyChange).toBeInTheDocument()
    expect(dailyChange).toHaveClass("text-red-500")

    // Verificar se o percentual de variação diária negativa é exibido corretamente
    const dailyChangePercentage = screen.getByText(/-5\.00%/i)
    expect(dailyChangePercentage).toBeInTheDocument()
    expect(dailyChangePercentage).toHaveClass("text-red-500")
  })
})
