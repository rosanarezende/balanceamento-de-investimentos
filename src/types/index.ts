/**
 * Definições de tipos para o sistema de balanceamento de investimentos
 */

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

export interface SimulationAllocation {
  ticker: string
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  currentQuantity: number
  investmentAmount: number
  newQuantity: number
  quantityToAcquire: number
  currentPrice: number
  userRecommendation: string
}

export interface Simulation {
  id?: string
  date: Date
  investmentAmount: number
  portfolioValueBefore: number
  portfolioValueAfter: number
  allocations: SimulationAllocation[]
}

export interface WatchlistItem {
  ticker: string
  targetPrice: number | null
  notes: string
}

export interface UserPreferences {
  theme: "light" | "dark"
}

export type CacheItem<T> = {
  value: T;
  timestamp: number;
};

// Removida a reexportação de formatCurrency de @/lib/utils para evitar problemas de SSR
