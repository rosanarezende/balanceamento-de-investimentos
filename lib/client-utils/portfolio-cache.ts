import { Portfolio } from "@/lib/firestore"


const CACHE_TTL = 5 * 60 * 1000 // 5 minutos em milissegundos
const PORTFOLIO_CACHE_KEY = "userPortfolio"
const PORTFOLIO_LAST_UPDATED_KEY = "portfolioLastUpdated"

function isBrowser() {
  return typeof window !== "undefined"
}

export function getPortfolioCache() {
  if (!isBrowser()) return null

  const cachedPortfolio = localStorage.getItem(PORTFOLIO_CACHE_KEY)
  const lastUpdatedStr = localStorage.getItem(PORTFOLIO_LAST_UPDATED_KEY)
  
  if (cachedPortfolio && lastUpdatedStr) {
    return {
      portfolio: JSON.parse(cachedPortfolio) as Portfolio,
      lastUpdated: new Date(lastUpdatedStr)
    }
  }
  return null
}

export function setPortfolioCache(portfolio: Portfolio) {
  if (!isBrowser()) return

  localStorage.setItem(PORTFOLIO_CACHE_KEY, JSON.stringify(portfolio))
  localStorage.setItem(PORTFOLIO_LAST_UPDATED_KEY, new Date().toISOString())
}

export function clearPortfolioCache() {
  if (!isBrowser()) return

  localStorage.removeItem(PORTFOLIO_CACHE_KEY)
  localStorage.removeItem(PORTFOLIO_LAST_UPDATED_KEY)
}

export function isPortfolioCacheValid(lastUpdated: Date): boolean {
  if (!isBrowser()) return false
  if (!lastUpdated) return false
  
  const now = Date.now()
  return now - lastUpdated.getTime() < CACHE_TTL
}
