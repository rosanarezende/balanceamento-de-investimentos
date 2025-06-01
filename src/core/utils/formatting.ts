/**
 * Utilitários para formatação de valores
 */

/**
 * Formata um valor numérico para moeda brasileira (BRL)
 * @param value - Valor numérico a ser formatado
 * @returns String formatada como moeda (ex: R$ 1.234,56)
 */
export function formatCurrency(value: number): string {
  // Verificar se o valor é um número válido
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    console.error('Tentativa de formatar valor não numérico:', value);
    return 'R$ 0,00'; // Valor padrão seguro
  }
  
  try {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  } catch (error) {
    console.error('Erro ao formatar valor:', error);
    return 'R$ 0,00'; // Fallback em caso de erro
  }
}

/**
 * Formata um valor percentual com precisão definida
 * @param value - Valor percentual (ex: 0.1234 para 12.34%)
 * @param precision - Número de casas decimais (padrão: 2)
 * @returns String formatada como percentual (ex: 12.34%)
 */
export function formatPercentage(value: number, precision: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  try {
    return `${(value * 100).toFixed(precision)}%`;
  } catch (error) {
    console.error('Erro ao formatar percentual:', error);
    return '0%';
  }
}

/**
 * Formata um número com separadores de milhar e precisão definida
 * @param value - Valor numérico
 * @param precision - Número de casas decimais (padrão: 2)
 * @returns String formatada com separadores de milhar
 */
export function formatNumber(value: number, precision: number = 2): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  try {
    return value.toLocaleString("pt-BR", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    });
  } catch (error) {
    console.error('Erro ao formatar número:', error);
    return '0';
  }
}
