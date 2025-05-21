/**
 * Implementação de sistema de retry para chamadas de API
 * Permite tentar novamente uma operação em caso de falha com backoff exponencial
 */

interface RetryOptions {
  maxRetries: number
  delayMs: number
  backoffFactor: number
}

/**
 * Executa uma função assíncrona com retry automático em caso de falha
 * @param fn Função assíncrona a ser executada
 * @param options Opções de retry (tentativas máximas, delay inicial, fator de backoff)
 * @returns Resultado da função ou erro após todas as tentativas
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, delayMs: 1000, backoffFactor: 1.5 }
): Promise<T> {
  let lastError: Error | unknown

  for (let attempt = 0; attempt < options.maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // Se não for o último retry, aguardar antes de tentar novamente
      if (attempt < options.maxRetries - 1) {
        const delay = options.delayMs * Math.pow(options.backoffFactor, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
