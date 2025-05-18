// Chave de API da Alpha Vantage (em produção, deve ser armazenada como variável de ambiente)
const ALPHA_VANTAGE_API_KEY = "demo" // Substitua pela sua chave real

/**
 * Busca o preço atual de uma ação na B3 usando a API Alpha Vantage
 * @param ticker Código da ação (ex: ITUB4)
 * @returns Preço atual da ação ou preço simulado em caso de falha
 */
export async function fetchStockPrice(ticker: string): Promise<number> {
  try {
    // Adiciona o sufixo .SA para ações brasileiras
    const formattedTicker = `${ticker}.SA`

    // Endpoint da API Alpha Vantage para obter cotação em tempo real
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedTicker}&apikey=${ALPHA_VANTAGE_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    // Verifica se a resposta contém os dados esperados
    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      return Number.parseFloat(data["Global Quote"]["05. price"])
    }

    // Fallback para preços simulados em caso de erro ou limite de API excedido
    return getSimulatedStockPrice(ticker)
  } catch (error) {
    console.error(`Erro ao buscar preço para ${ticker}:`, error)
    // Fallback para preços simulados
    return getSimulatedStockPrice(ticker)
  }
}

/**
 * Gera um preço simulado para uma ação quando a API não está disponível
 * @param ticker Código da ação
 * @returns Preço simulado
 */
function getSimulatedStockPrice(ticker: string): number {
  // Preços simulados para desenvolvimento e demonstração
  const simulatedPrices: Record<string, number> = {
    RANI3: 7.96,
    TIMS3: 19.76,
    AZZA3: 43.73,
    PRIO3: 39.58,
    CXSE3: 15.33,
    ALUP11: 29.53,
    ABCB4: 21.86,
    NEOE3: 23.87,
    AGRO3: 21.23,
  }

  return simulatedPrices[ticker] || Math.random() * 100 + 5
}

/**
 * Armazena recomendações manuais inseridas pelo usuário
 * Em uma implementação real, isso seria persistido em um banco de dados ou localStorage
 */
const manualRecommendations: Record<string, string> = {}

/**
 * Obtém a recomendação do BTG para uma ação
 * @param ticker Código da ação
 * @returns Recomendação ou "COMPRAR" como padrão
 */
export async function getBtgRecommendation(ticker: string): Promise<string> {
  // Verifica se há uma recomendação manual
  if (manualRecommendations[ticker]) {
    return manualRecommendations[ticker]
  }

  // Se não houver, retorna "COMPRAR" como padrão
  return "COMPRAR"
}

/**
 * Salva uma recomendação manual inserida pelo usuário
 * @param ticker Código da ação
 * @param recommendation Recomendação (COMPRAR, AGUARDAR, VENDER)
 */
export function saveManualRecommendation(ticker: string, recommendation: string): void {
  manualRecommendations[ticker] = recommendation

  // Em uma implementação real, salvar no localStorage ou em um banco de dados
  // localStorage.setItem(`btg_recommendation_${ticker}`, recommendation);
}

/**
 * Tipos de recomendação disponíveis
 */
export const RECOMMENDATION_TYPES = ["COMPRAR", "AGUARDAR", "VENDER"]
