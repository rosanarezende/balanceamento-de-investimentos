import { fetchStockPrice } from "@/lib/api"
import type { Portfolio, StockWithDetails } from "@/lib/types"

export async function calculatePortfolioDetails(portfolio: Portfolio): Promise<{
    detailedStocks: StockWithDetails[]
    totalValue: number
    failedStocks: string[]
}> {
  const stockPrices: Record<string, number> = {}
  const failedStocks: string[] = []
  
  const pricePromises = Object.keys(portfolio).map(async (ticker) => {
    try {
      const price = await fetchStockPrice(ticker)
      return { ticker, price }
    } catch {
      failedStocks.push(ticker)
      return { ticker, price: 0 }
    }
  })
  
  const priceResults = await Promise.all(pricePromises)
  priceResults.forEach(({ ticker, price }) => {
    stockPrices[ticker] = price
  })
  
  const portfolioEntries = Object.entries(portfolio)

  const totalValue = portfolioEntries.reduce((acc, [ticker, stockItem]) => {
    const price = stockPrices[ticker] || 0
    return acc + stockItem.quantity * price
  }, 0)

  const detailedStocks = portfolioEntries.map(([ticker, stock]) => {
    const currentPrice = stockPrices[ticker] || 0
    const currentValue = stock.quantity * currentPrice
    const currentPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0
    const targetValue = (stock.targetPercentage / 100) * totalValue
    const toBuy = Math.max(0, targetValue - currentValue)
    const excess = Math.max(0, currentValue - targetValue)
    return {
      ticker,
      quantity: stock.quantity,
      targetPercentage: stock.targetPercentage,
      userRecommendation: stock.userRecommendation || "Comprar",
      currentPrice,
      currentValue,
      currentPercentage,
      toBuy,
      excess,
    }
  })

  return { detailedStocks, totalValue, failedStocks }
}
