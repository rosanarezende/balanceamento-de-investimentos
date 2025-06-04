import { z } from 'zod';

/**
 * Schema Zod para validação de ações (Stock)
 */
export const StockSchema = z.object({
  ticker: z.string().min(1, "Ticker é obrigatório").max(10, "Ticker deve ter no máximo 10 caracteres"),
  quantity: z.number().min(0, "Quantidade deve ser maior ou igual a 0"),
  targetPercentage: z.number().min(0, "Porcentagem alvo deve ser maior ou igual a 0").max(100, "Porcentagem alvo deve ser menor ou igual a 100"),
  userRecommendation: z.enum(["Comprar", "Vender", "Aguardar"]).optional(),
});

/**
 * Schema Zod para ações com detalhes adicionais
 */
export const StockWithDetailsSchema = StockSchema.extend({
  currentPrice: z.number().min(0, "Preço atual deve ser maior ou igual a 0"),
  currentValue: z.number().min(0, "Valor atual deve ser maior ou igual a 0"),
  currentPercentage: z.number().min(0, "Porcentagem atual deve ser maior ou igual a 0"),
  targetValue: z.number().min(0, "Valor alvo deve ser maior ou igual a 0"),
  targetDifference: z.number(),
  targetDifferencePercentage: z.number(),
  dailyChange: z.number().optional(),
  dailyChangePercentage: z.number().optional(),
});

/**
 * Schema Zod para portfólio (objeto com tickers como chaves)
 */
export const PortfolioSchema = z.record(
  z.string(), // ticker como chave
  StockSchema.omit({ ticker: true }) // Stock sem o campo ticker (já é a chave)
);

/**
 * Schema Zod para alocação de simulação
 */
export const SimulationAllocationSchema = z.object({
  ticker: z.string(),
  currentValue: z.number().min(0),
  currentPercentage: z.number().min(0),
  targetPercentage: z.number().min(0),
  currentQuantity: z.number().min(0),
  investmentAmount: z.number().min(0),
  newQuantity: z.number().min(0),
  quantityToAcquire: z.number().min(0),
  currentPrice: z.number().min(0),
  userRecommendation: z.enum(["Comprar", "Vender", "Aguardar"]).optional(),
  isEligibleForInvestment: z.boolean(),
});

/**
 * Schema Zod para simulação
 */
export const SimulationSchema = z.object({
  id: z.string().optional(),
  date: z.date(),
  investmentAmount: z.number().min(0),
  portfolioValueBefore: z.number().min(0),
  portfolioValueAfter: z.number().min(0),
  allocations: z.array(SimulationAllocationSchema),
});

/**
 * Schema Zod para resumo do portfólio
 */
export const PortfolioSummarySchema = z.object({
  totalValue: z.number().min(0),
  stockCount: z.number().min(0),
  hasEligibleStocks: z.boolean(),
  dailyChange: z.number().optional(),
  dailyChangePercentage: z.number().optional(),
  performanceToday: z.enum(["up", "down", "neutral"]).optional(),
});

// Exportar tipos derivados dos schemas Zod
export type Stock = z.infer<typeof StockSchema>;
export type StockWithDetails = z.infer<typeof StockWithDetailsSchema>;
export type Portfolio = z.infer<typeof PortfolioSchema>;
export type SimulationAllocation = z.infer<typeof SimulationAllocationSchema>;
export type Simulation = z.infer<typeof SimulationSchema>;
export type PortfolioSummary = z.infer<typeof PortfolioSummarySchema>;
