/**
 * Arquivo de exportação central para utilitários
 * Facilita imports e garante consistência na aplicação
 */

export * from './formatting';
export * from './styling';
export * from './error';

/**
 * Utilitários para manipulação de dados e cache
 */

/**
 * Verifica se um cache está expirado
 * @param timestamp - Timestamp de quando o cache foi criado
 * @param maxAgeMs - Idade máxima do cache em milissegundos
 * @returns true se o cache estiver expirado, false caso contrário
 */
export function isCacheExpired(timestamp: number, maxAgeMs: number): boolean {
  return Date.now() - timestamp > maxAgeMs;
}

/**
 * Atrasa a execução por um tempo determinado
 * @param ms - Tempo em milissegundos
 * @returns Promise que resolve após o tempo especificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce para funções que são chamadas frequentemente
 * @param fn - Função a ser executada
 * @param ms - Tempo de espera em milissegundos
 * @returns Função com debounce aplicado
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}
