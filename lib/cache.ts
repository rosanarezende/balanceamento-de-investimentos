// Sistema de cache simples para armazenar preços de ações
interface CacheItem<T> {
  value: T
  timestamp: number
  expiresAt: number
}

class Cache<T> {
  private cache: Map<string, CacheItem<T>> = new Map()
  private defaultTTL: number

  constructor(defaultTTLInSeconds = 300) {
    // 5 minutos por padrão
    this.defaultTTL = defaultTTLInSeconds * 1000
  }

  set(key: string, value: T, ttlInSeconds?: number): void {
    const now = Date.now()
    const ttl = (ttlInSeconds !== undefined ? ttlInSeconds : this.defaultTTL) * 1000

    this.cache.set(key, {
      value,
      timestamp: now,
      expiresAt: now + ttl,
    })
  }

  get(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Verificar se o item expirou
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.value
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Limpar itens expirados
  purgeExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key)
      }
    }
  }
}

// Exportar uma instância do cache para preços de ações
export const stockPriceCache = new Cache<number>(300) // Cache de 5 minutos para preços
