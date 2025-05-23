import { getCachedStockPrice, setCachedStockPrice } from "@/lib/client-utils/stock-price-cache"

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

export async function fetchStockPriceServer(ticker: string): Promise<number> {
  const cached = await getCachedStockPrice(ticker)
  if (cached !== null) return cached

  try {
    const price = await fetchStockPriceFromAlphaVantage(ticker)

    await setCachedStockPrice(ticker, price)
    return price
  } catch (error) {
    console.error("Erro ao buscar preço da ação:", error)
    throw new Error("Erro ao buscar preço da ação")
  }
}