/**
 * Sistema de cache para chamadas de API
 * Implementa o padrão Singleton para garantir uma única instância de cache
 */

interface CacheOptions {
  ttl: number // Tempo de vida em milissegundos
}

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

export class ApiCache {
  private static instance: ApiCache
  private cache: Map<string, CacheItem<any>> = new Map()

  private constructor() { }

  public static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache()
    }
    return ApiCache.instance
  }

  /**
   * Obtém um item do cache se existir e não estiver expirado
   * @param key Chave do item no cache
   * @returns O item armazenado ou null se não existir ou estiver expirado
   */
  public get<T>(key: string): T | null {
    const item = this.cache.get(key)

    if (!item) {
      return null
    }

    // Verificar se o item expirou
    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Armazena um item no cache
   * @param key Chave para armazenar o item
   * @param data Dados a serem armazenados
   * @param options Opções de cache (ttl)
   */
  public set<T>(key: string, data: T, options: CacheOptions): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: options.ttl
    })
  }

  /**
   * Remove um item específico do cache
   * @param key Chave do item a ser removido
   */
  public invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Limpa todo o cache
   */
  public invalidateAll(): void {
    this.cache.clear()
  }
}

// Exporta uma instância única do cache
export const apiCache = ApiCache.getInstance()
