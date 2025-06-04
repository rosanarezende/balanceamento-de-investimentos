/**
 * Dados mock de preços de ações
 */

export const mockStockPrices: Record<string, number> = {
  'AAPL': 15.00,
  'GOOGL': 25.00,
  'MSFT': 30.00,
  'AMZN': 32.00,
  'TSLA': 80.00,
  'NVDA': 4.50,
  'META': 28.00,
  'NFLX': 4.20,
  'AMD': 0.85,
  'INTC': 0.45,
}

export const simulateStockPrices = (tickers: string[]): Record<string, number> => {
  return tickers.reduce((acc, ticker) => {
    acc[ticker] = simulateStockPrice(ticker)
    return acc
  }, {} as Record<string, number>)
}

export const simulateStockPrice = (ticker: string): number => {
  // Usar preço mock se disponível, senão gerar preço entre R$10 e R$100
  return mockStockPrices[ticker] || (Math.random() * 90 + 10)
}
