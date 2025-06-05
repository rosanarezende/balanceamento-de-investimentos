/**
 * Mock do serviço de preços de ações para testes
 */

import { mockStockPrices, simulateStockPrice } from "../"

const mockStockPriceService = jest.requireMock('@/services/api/stock-price')

/**
 * Mocks do serviço de preços de ações para testes
 *
 * Este arquivo define os mocks para o serviço de preços de ações,
 * permitindo simular respostas em testes unitários e de integração.
 */
export const setupStockPriceMock = (ticker: string) => {
  const stockPrice = simulateStockPrice(ticker)
  mockStockPriceService.getCurrentPrice.mockResolvedValue(stockPrice)
  mockStockPriceService.getPriceHistory.mockResolvedValue([
    { date: '2024-01-01', price: stockPrice - 5 },
    { date: '2024-01-02', price: stockPrice },
    { date: '2024-01-03', price: stockPrice + 3 }
  ])
  mockStockPriceService.searchStocks.mockResolvedValue(
    Object.entries(mockStockPrices).map(([symbol, price]) => ({
      symbol,
      name: symbol, // Simulando o nome como o próprio símbolo
      price
    }))
  )
  mockStockPriceService.getStockInfo.mockResolvedValue({
    symbol: ticker,
    name: ticker, // Simulando o nome como o próprio símbolo
    price: stockPrice,
    change: 2.50, // Valor fixo para simulação
    changePercent: 1.69 // Valor fixo para simulação
  })
}

const tickers = Object.keys(mockStockPrices)
const randomIndex = Math.floor(Math.random() * tickers.length)

export const setupStockPricesMock = () => tickers.forEach(ticker => setupStockPriceMock(ticker))

export const getMockTickerName = () => tickers[randomIndex] || 'AAPL'

export const resetStockPriceMocks = () => {
  Object.values(mockStockPriceService).forEach(mock => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset()
    }
  })
}
