import { z } from 'zod';

// Schema para validação de ativos
export const StockSchema = z.object({
  ticker: z.string().min(1).max(10),
  quantity: z.number().positive(),
  targetPercentage: z.number().min(0).max(100),
  userRecommendation: z.enum(['Comprar', 'Aguardar', 'Vender']).optional(),
  // Novos campos conforme Documento Conceitual
  precoTetoUsuario: z.number().positive().optional(),
  precoMedioCompra: z.number().positive().optional(),
  notasFundamentos: z.string().max(500).optional(),
});

// Tipo para um ativo individual
export type Stock = z.infer<typeof StockSchema>;

// Tipo para o portfólio completo (mapa de ticker para detalhes do ativo)
export type Portfolio = Record<string, Stock>;

// Tipo para ativo com detalhes adicionais (preço atual, etc.)
export type StockWithDetails = Stock & {
  currentPrice: number;
  currentValue: number;
  currentPercentage: number;
  targetValue: number;
  difference: number;
  // Novos campos calculados
  yieldOnCost?: number; // Rendimento sobre custo (baseado no preço médio)
  isAboveCeilingPrice?: boolean; // Indica se o preço atual está acima do preço teto
};

// Tipo para recomendação de balanceamento
export type BalanceRecommendation = {
  ticker: string;
  currentAllocation: number;
  targetAllocation: number;
  recommendedInvestment: number;
  expectedShares: number;
  userRecommendation?: 'Comprar' | 'Aguardar' | 'Vender';
  // Novos campos para recomendações
  precoTetoUsuario?: number;
  precoMedioCompra?: number;
  isAboveCeilingPrice?: boolean;
  yieldOnCost?: number;
};

// Tipo para resultado de simulação de balanceamento
export type BalanceSimulationResult = {
  recommendations: BalanceRecommendation[];
  totalInvestment: number;
  portfolioValueBefore: number;
  portfolioValueAfter: number;
  percentageChange: number;
  date: Date;
  // Novos campos para resultados de simulação
  hasStocksAboveCeilingPrice: boolean;
  averageYieldOnCost?: number;
};
