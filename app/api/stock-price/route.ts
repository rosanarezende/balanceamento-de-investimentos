import { NextResponse } from "next/server"

// Chave de API da Alpha Vantage (agora usando uma variável de ambiente do servidor)
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "demo"

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
    ITUB4: 32.45,
    PETR4: 36.78,
    VALE3: 68.92,
    BBDC4: 17.35,
    MGLU3: 4.28,
    WEGE3: 41.56,
    BBAS3: 53.21,
  }

  return simulatedPrices[ticker] || Math.random() * 100 + 5
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get("ticker")

  if (!ticker) {
    return NextResponse.json({ error: "Ticker não fornecido" }, { status: 400 })
  }

  try {
    // Em ambiente de preview ou desenvolvimento, usar diretamente os preços simulados
    if (process.env.NODE_ENV !== "production") {
      const price = getSimulatedStockPrice(ticker)
      return NextResponse.json({ price })
    }

    // Adiciona o sufixo .SA para ações brasileiras
    const formattedTicker = `${ticker}.SA`

    // Endpoint da API Alpha Vantage para obter cotação em tempo real
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${formattedTicker}&apikey=${ALPHA_VANTAGE_API_KEY}`

    // Adicionar timeout para a requisição
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.warn(`API respondeu com status ${response.status} para ${ticker}`)
      const price = getSimulatedStockPrice(ticker)
      return NextResponse.json({ price })
    }

    const data = await response.json()

    // Verifica se a resposta contém os dados esperados
    if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
      const price = Number.parseFloat(data["Global Quote"]["05. price"])
      return NextResponse.json({ price })
    }

    // Fallback para preços simulados em caso de erro ou limite de API excedido
    console.warn(`Dados inválidos recebidos da API para ${ticker}`)
    const price = getSimulatedStockPrice(ticker)
    return NextResponse.json({ price })
  } catch (error) {
    // Captura e loga o erro, mas não deixa a aplicação quebrar
    console.warn(`Erro ao buscar preço para ${ticker}, usando preço simulado:`, error)
    const price = getSimulatedStockPrice(ticker)
    return NextResponse.json({ price })
  }
}
