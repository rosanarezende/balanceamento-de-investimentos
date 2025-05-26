"use client";

/**
 * Utilitário de cache para preços de ações
 * 
 * Este módulo fornece funções para armazenar e recuperar preços de ações em cache,
 * reduzindo a necessidade de chamadas repetidas à API.
 */

interface CacheItem<T> {
  value: T;
  timestamp: number;
}

const STOCK_PRICE_CACHE_PREFIX = "stock_price_";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos em milissegundos
const isBrowser = typeof window !== "undefined";

/**
 * Obtém o preço de uma ação do cache
 * @param ticker Código da ação
 * @returns Preço da ação ou null se não estiver em cache ou expirado
 */
export async function getCachedStockPrice(ticker: string): Promise<number | null> {
  if (typeof ticker !== "string") {
    throw new Error("Ticker deve ser uma string");
  }

  if (!ticker.trim()) {
    throw new Error("Ticker não pode estar vazio");
  }

  if (!isBrowser) return null;
  
  try {
    const cacheKey = `${STOCK_PRICE_CACHE_PREFIX}${ticker}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (!cachedData) {
      return null;
    }

    const { value: price, timestamp } = JSON.parse(cachedData) as CacheItem<number>;
    const now = Date.now();

    if (now - timestamp > CACHE_TTL) {
      localStorage.removeItem(cacheKey);
      return null;
    }

    return price;
  } catch (error) {
    console.error(`Erro ao obter preço em cache para ${ticker}:`, error);
    return null;
  }
}

/**
 * Armazena o preço de uma ação em cache
 * @param ticker Código da ação
 * @param price Preço da ação
 */
export async function setCachedStockPrice(ticker: string, price: number): Promise<void> {
  if (typeof ticker !== "string") {
    throw new Error("Ticker deve ser uma string");
  }

  if (!ticker.trim()) {
    throw new Error("Ticker não pode estar vazio");
  }

  if (!isBrowser) return;
  
  try {
    const cacheKey = `${STOCK_PRICE_CACHE_PREFIX}${ticker}`;
    const cacheData: CacheItem<number> = {
      value: price,
      timestamp: Date.now(),
    };

    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error(`Erro ao armazenar preço em cache para ${ticker}:`, error);
  }
}

/**
 * Limpa o cache de preço de uma ação específica
 * @param ticker Código da ação
 */
export async function clearStockPriceCache(ticker: string): Promise<void> {
  if (typeof ticker !== "string") {
    throw new Error("Ticker deve ser uma string");
  }

  if (!ticker.trim()) {
    throw new Error("Ticker não pode estar vazio");
  }

  if (!isBrowser) return;
  
  try {
    const cacheKey = `${STOCK_PRICE_CACHE_PREFIX}${ticker}`;
    localStorage.removeItem(cacheKey);
  } catch (error) {
    console.error(`Erro ao limpar cache para ${ticker}:`, error);
  }
}

/**
 * Limpa todo o cache de preços de ações
 */
export async function clearAllStockPriceCache(): Promise<void> {
  if (!isBrowser) return;
  
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STOCK_PRICE_CACHE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error("Erro ao limpar todo o cache de preços:", error);
  }
}
