/**
 * Utilitários para manipulação de erros e validação
 */

import { ErrorInfo } from '../types/common';

/**
 * Cria um objeto de erro padronizado
 * @param message - Mensagem de erro
 * @param code - Código de erro opcional
 * @param details - Detalhes adicionais do erro
 * @returns Objeto ErrorInfo padronizado
 */
export function createError(message: string, code?: string, details?: unknown): ErrorInfo {
  return {
    message,
    code,
    details
  };
}

/**
 * Valida se um valor é um número válido
 * @param value - Valor a ser validado
 * @returns true se for um número válido, false caso contrário
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Valida se um objeto tem todas as propriedades esperadas
 * @param obj - Objeto a ser validado
 * @param requiredProps - Array de propriedades obrigatórias
 * @returns true se todas as propriedades existirem, false caso contrário
 */
export function hasRequiredProperties(obj: Record<string, any>, requiredProps: string[]): boolean {
  if (!obj || typeof obj !== 'object') return false;
  return requiredProps.every(prop => prop in obj);
}

/**
 * Captura e formata erros para exibição consistente
 * @param error - Erro capturado
 * @returns Objeto ErrorInfo padronizado
 */
export function handleError(error: unknown): ErrorInfo {
  if (error instanceof Error) {
    return createError(error.message, undefined, error.stack);
  } else if (typeof error === 'string') {
    return createError(error);
  } else {
    return createError('Ocorreu um erro desconhecido', undefined, error);
  }
}

/**
 * Converte um valor para número válido ou retorna 0
 * Encapsula o padrão repetitivo: isValidNumber(value) ? value : 0
 * @param value - Valor a ser convertido
 * @returns Número válido ou 0
 */
export function safeNumber(value: unknown): number {
  return isValidNumber(value) ? value : 0;
}
