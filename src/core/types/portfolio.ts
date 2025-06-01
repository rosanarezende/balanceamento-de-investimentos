/**
 * Definições de tipos relacionados ao portfólio de investimentos
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
