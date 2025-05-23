export interface Stock {
  ticker: string
  quantity: number
  targetPercentage: number
  userRecommendation: string
}

export interface StockWithDetails extends Stock {
  currentPrice: number
  currentValue: number
  currentPercentage: number
  toBuy: number
  excess: number
}

export interface Portfolio {
  [ticker: string]: {
    quantity: number
    targetPercentage: number
    userRecommendation: string
  }
}
