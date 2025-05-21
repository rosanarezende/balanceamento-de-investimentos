import { z } from 'zod';

/**
 * Esquema de validação para ações
 * Implementa validação robusta de dados usando Zod
 */
export const StockSchema = z.object({
  ticker: z.string()
    .min(4, "Ticker deve ter pelo menos 4 caracteres")
    .max(6, "Ticker não pode ter mais de 6 caracteres")
    .regex(/^[A-Z0-9]+$/, "Ticker deve conter apenas letras maiúsculas e números"),

  quantity: z.number()
    .positive("Quantidade deve ser um número positivo")
    .int("Quantidade deve ser um número inteiro"),

  targetPercentage: z.number()
    .min(0, "Percentual alvo não pode ser negativo")
    .max(100, "Percentual alvo não pode exceder 100%"),

  userRecommendation: z.enum(["Comprar", "Vender", "Aguardar"])
    .default("Comprar"),
});

/**
 * Esquema de validação para resposta de preço de ações
 */
export const StockPriceResponseSchema = z.object({
  price: z.number().nonnegative("Preço não pode ser negativo"),
  ticker: z.string(),
  lastUpdated: z.string().optional(),
});

/**
 * Tipos derivados dos esquemas Zod
 */
export type Stock = z.infer<typeof StockSchema>;
export type StockPriceResponse = z.infer<typeof StockPriceResponseSchema>;
