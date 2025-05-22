interface CacheItem<T> {
  value: T
  timestamp: number
}

const STOCK_PRICE_CACHE_PREFIX = "stock_price_"
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos em milissegundos

export async function getCachedStockPrice(ticker: string): Promise<number | null> {
  try {
    const cacheKey = `${STOCK_PRICE_CACHE_PREFIX}${ticker}`
    const cachedData = localStorage.getItem(cacheKey)

    if (!cachedData) {
      return null
    }

    const { value: price, timestamp } = JSON.parse(cachedData) as CacheItem<number>
    const now = Date.now()

    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey)
      return null
    }

    return price
  } catch (error) {
    console.error(`Erro ao obter preço em cache para ${ticker}:`, error)
    return null
  }
}

export async function setCachedStockPrice(ticker: string, price: number): Promise<void> {
  try {
    const cacheKey = `${STOCK_PRICE_CACHE_PREFIX}${ticker}`
    const cacheData: CacheItem<number> = {
      value: price,
      timestamp: Date.now(),
    }

    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error(`Erro ao armazenar preço em cache para ${ticker}:`, error)
  }
}

export async function clearStockPriceCache(ticker: string): Promise<void> {
  try {
    const cacheKey = `${STOCK_PRICE_CACHE_PREFIX}${ticker}`
    localStorage.removeItem(cacheKey)
  } catch (error) {
    console.error(`Erro ao limpar cache para ${ticker}:`, error)
  }
}
