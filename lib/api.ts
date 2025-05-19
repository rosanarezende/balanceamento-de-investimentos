/**
 * Busca o preço atual de uma ação na B3 usando a API do servidor
 * @param ticker Código da ação (ex: ITUB4)
 * @returns Preço atual da ação ou preço simulado em caso de falha
 */
export async function fetchStockPrice(ticker: string): Promise<number> {
  try {
    // Chamar a API Route do servidor em vez de acessar diretamente a API externa
    const response = await fetch(`/api/stock-price?ticker=${ticker}`)

    if (!response.ok) {
      throw new Error(`Erro ao buscar preço: ${response.status}`)
    }

    const data = await response.json()
    return data.price
  } catch (error) {
    console.error(`Erro ao buscar preço para ${ticker}:`, error)
    throw error
  }
}

// Tipos de recomendação disponíveis
export const RECOMMENDATION_TYPES = ["Comprar", "Vender", "Aguardar"]

// Descrições das recomendações
export const RECOMMENDATION_DESCRIPTIONS = {
  Comprar: "Recomendado para aportes. O ativo está subvalorizado ou tem boas perspectivas de crescimento.",
  Vender: "Não recomendado para aportes. Considere vender posições existentes se necessário.",
  Aguardar: "Mantenha as posições existentes, mas aguarde antes de fazer novos aportes.",
}

export async function saveManualRecommendation(ticker: string, recommendation: string): Promise<void> {
  // This is a placeholder function. In a real application, this function would
  // save the user's manual recommendation to a database or other persistent storage.
  console.log(`Salvando recomendação manual para ${ticker}: ${recommendation}`)
  return Promise.resolve()
}
