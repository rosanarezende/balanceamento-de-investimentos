/**
 * Definições de tipos relacionados ao portfólio de investimentos
 */

export interface Stock {
  ticker: string;
  quantity: number;
  targetPercentage: number;
  userRecommendation?: "Comprar" | "Vender" | "Aguardar";
}

export interface StockWithDetails extends Stock {
  currentPrice: number;
  currentValue: number;
  currentPercentage: number;
  targetValue: number;
  targetDifference: number;
  targetDifferencePercentage: number;
}

export interface Portfolio {
  [ticker: string]: Omit<Stock, "ticker">;
}

export interface SimulationAllocation {
  ticker: string;
  currentValue: number;
  currentPercentage: number;
  targetPercentage: number;
  currentQuantity: number;
  investmentAmount: number;
  newQuantity: number;
  quantityToAcquire: number;
  currentPrice: number;
  userRecommendation?: "Comprar" | "Vender" | "Aguardar";
}

export interface Simulation {
  id?: string;
  date: Date;
  investmentAmount: number;
  portfolioValueBefore: number;
  portfolioValueAfter: number;
  allocations: SimulationAllocation[];
}

export interface PortfolioSummary {
  totalValue: number;
  stockCount: number;
  hasEligibleStocks: boolean;
}
