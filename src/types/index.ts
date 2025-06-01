/**
 * Definições de tipos para o sistema de balanceamento de investimentos
 * DEPRECADO: Use os tipos derivados do Zod em /src/lib/schemas/stock.ts
 */

// Re-exportar tipos do schema Zod para manter compatibilidade
export {
  type Stock,
  type StockWithDetails,
  type Portfolio,
  type SimulationAllocation,
  type Simulation,
  type PortfolioSummary
} from '@/lib/schemas/stock';

// Interfaces específicas que não foram migradas
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

// Removida a reexportação de formatCurrency de @/core/utils para evitar problemas de SSR
