import { apiCache } from './api/cache'
import { withRetry } from './api/retry'
import { StockPriceResponse } from './schemas/stock'

/**
 * Gera um preço simulado para uma ação quando a API não está disponível
 * @param ticker Código da ação
 * @returns Preço simulado
 */
function getSimulatedStockPrice(ticker: string): number {
  // Preços simulados para desenvolvimento e demonstração
  const simulatedPrices: Record<string, number> = {
    RANI3: 7.96,
    TIMS3: 19.76,
    AZZA3: 43.73,
    PRIO3: 39.58,
    CXSE3: 15.33,
    ALUP11: 29.53,
    ABCB4: 21.86,
    NEOE3: 23.87,
    AGRO3: 21.23,
    ITUB4: 32.45,
    PETR4: 36.78,
    VALE3: 68.92,
    BBDC4: 17.35,
    MGLU3: 4.28,
    WEGE3: 41.56,
    BBAS3: 53.21,
  }

  return simulatedPrices[ticker] || Math.random() * 100 + 5
}


const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo"
async function fetchStockPriceFromAlphaVantage(ticker: string): Promise<number> {
  const formattedTicker = `${ticker}.SA`
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedTicker}&apikey=${ALPHA_VANTAGE_API_KEY}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    })
    clearTimeout(timeoutId)

    if (!response.ok) throw new Error(`API respondeu com status ${response.status}`)

    const data = await response.json()
    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      return Number.parseFloat(data["Global Quote"]["05. price"])
    }
    throw new Error("Dados inválidos recebidos da API")
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

export async function fetchStockPrice(ticker: string): Promise<number> {
  const cacheKey = `stock_price_${ticker}`

  // Verificar cache primeiro
  const cachedData = apiCache.get<number>(cacheKey)
  if (cachedData !== null) {
    console.log(`Usando preço em cache para ${ticker}`)
    return cachedData
  }

  try {
    // Só chama Alpha Vantage em produção
    let price: number
    if (process.env.NODE_ENV === "production") {
      price = await withRetry(
        () => fetchStockPriceFromAlphaVantage(ticker),
        { maxRetries: 3, delayMs: 1000, backoffFactor: 1.5 }
      )
    } else {
      price = getSimulatedStockPrice(ticker)
    }
    apiCache.set(cacheKey, price, { ttl: 15 * 60 * 1000 })
    return price
  }

  catch (error) {
    // fallback para preço simulado
    const price = getSimulatedStockPrice(ticker)
    apiCache.set(cacheKey, price, { ttl: 5 * 60 * 1000 })
    return price
  }
}

// Tipos de recomendação disponíveis
export const RECOMMENDATION_TYPES = ["Comprar", "Vender", "Aguardar"]

// Descrições das recomendações
export const RECOMMENDATION_DESCRIPTIONS = {
  Comprar: "Recomendado para aportes. O ativo está subvalorizado ou tem boas perspectivas de crescimento.",
  Vender: "Não recomendado para aportes. Considere vender posições existentes se necessário.",
  Aguardar: "Mantenha as posições existentes, mas aguarde antes de fazer novos aportes.",
}

export async function saveManualRecommendation(ticker: string, recommendation: string): Promise<void> {
  // This is a placeholder function. In a real application, this function would
  // save the user's manual recommendation to a database or other persistent storage.
  console.log(`Salvando recomendação manual para ${ticker}: ${recommendation}`)
  return Promise.resolve()
}
