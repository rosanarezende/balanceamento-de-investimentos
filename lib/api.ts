export async function fetchStockPrice(ticker: string): Promise<number> {
    const response = await fetch(`/api/stock-price?ticker=${ticker}`)

    if (!response.ok) {
      throw new Error(`Erro ao buscar preço: ${response.status}`)
    }

    const data = await response.json()
    if (!data || !data.price) {
      throw new Error("Dados inválidos recebidos da API")
    }

    return data.price
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
