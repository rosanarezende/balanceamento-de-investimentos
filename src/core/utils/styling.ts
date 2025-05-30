/**
 * Utilitários para manipulação de classes CSS e estilos
 */

/**
 * Concatena classes CSS, filtrando valores falsy
 * @param classes - Lista de classes CSS a serem concatenadas
 * @returns String com as classes concatenadas
 */
export function cn(...classes: string[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Gera uma cor aleatória em formato hexadecimal
 * @returns String com cor hexadecimal (ex: #FF5733)
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Gera um array de cores para uso em gráficos e visualizações
 * @param count - Quantidade de cores necessárias
 * @param isDarkMode - Se true, gera cores mais claras para tema escuro
 * @returns Array de strings com cores em formato hexadecimal
 */
export function generateChartColors(count: number, isDarkMode: boolean = false): string[] {
  // Cores base para temas claro e escuro
  const baseColors = {
    light: [
      "rgba(59, 130, 246, 0.6)",
      "rgba(16, 185, 129, 0.6)",
      "rgba(139, 92, 246, 0.6)",
      "rgba(245, 158, 11, 0.6)",
      "rgba(236, 72, 153, 0.6)",
      "rgba(6, 182, 212, 0.6)",
      "rgba(239, 68, 68, 0.6)",
      "rgba(167, 139, 250, 0.6)",
    ],
    dark: [
      "rgba(96, 165, 250, 0.6)",
      "rgba(52, 211, 153, 0.6)",
      "rgba(165, 105, 246, 0.6)",
      "rgba(245, 158, 11, 0.6)",
      "rgba(236, 72, 153, 0.6)",
      "rgba(6, 182, 212, 0.6)",
      "rgba(239, 68, 68, 0.6)",
      "rgba(167, 139, 250, 0.6)",
    ],
  };

  // Selecionar cores com base no tema
  const themeColors = isDarkMode ? baseColors.dark : baseColors.light;
  
  // Se precisamos de mais cores do que temos na base, gerar cores adicionais
  if (count <= themeColors.length) {
    return themeColors.slice(0, count);
  }
  
  // Gerar cores adicionais
  const result = [...themeColors];
  for (let i = themeColors.length; i < count; i++) {
    result.push(`rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`);
  }
  
  return result;
}
