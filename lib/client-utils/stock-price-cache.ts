interface CacheItem<T> {
  value: T
  timestamp: number
}

const STOCK_PRICE_CACHE_PREFIX = "stock_price_"
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

function isBrowser() {
  return typeof window !== "undefined"
}

function getCacheKey(ticker: string): string {
  return `${STOCK_PRICE_CACHE_PREFIX}${ticker.toUpperCase()}`
}

function isStockPriceCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_TTL_MS
}

export function getCachedStockPrice(ticker: string): number | null {
  if (!isBrowser()) return null
  try {
    const cacheKey = getCacheKey(ticker)
    const cachedData = localStorage.getItem(cacheKey)
    if (!cachedData) return null

    const { value: price, timestamp } = JSON.parse(cachedData) as CacheItem<number>
    if (!isStockPriceCacheValid(timestamp)) {
      localStorage.removeItem(cacheKey)
      return null
    }
    return price
  } catch (error) {
    console.error(`Erro ao obter preço em cache para ${ticker}:`, error)
    return null
  }
}

export function setCachedStockPrice(ticker: string, price: number): void {
  if (!isBrowser()) return
  try {
    const cacheKey = getCacheKey(ticker)
    const cacheData: CacheItem<number> = {
      value: price,
      timestamp: Date.now(),
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error(`Erro ao armazenar preço em cache para ${ticker}:`, error)
  }
}

export function clearStockPriceCache(ticker: string): void {
  if (!isBrowser()) return
  try {
    const cacheKey = getCacheKey(ticker)
    localStorage.removeItem(cacheKey)
  } catch (error) {
    console.error(`Erro ao limpar cache para ${ticker}:`, error)
  }
}