import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const ticker = searchParams.get('ticker')

  if (!ticker) {
    return NextResponse.json({ price: null, error: 'Ticker é obrigatório' }, { status: 400 })
  }

  try {
    // Usar Yahoo Finance API para obter cotação
    const yahooSymbol = ticker.includes('.SA') ? ticker : `${ticker}.SA`
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY

    // Tentar obter dados do Yahoo Finance
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`)
    
    if (!response.ok) {
      throw new Error(`Erro na API do Yahoo Finance: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Verificar se temos dados válidos
    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      const price = data.chart.result[0].meta.regularMarketPrice
      return NextResponse.json({ price })
    }
    
    // Fallback para Alpha Vantage se Yahoo Finance não retornar preço
    if (apiKey) {
      const alphaResponse = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`)
      
      if (alphaResponse.ok) {
        const alphaData = await alphaResponse.json()
        
        if (alphaData?.['Global Quote']?.['05. price']) {
          const price = parseFloat(alphaData['Global Quote']['05. price'])
          return NextResponse.json({ price })
        }
      }
    }
    
    // Se não conseguir obter o preço de nenhuma API, retornar erro
    throw new Error('Preço não disponível')
  } catch (error) {
    console.error(`Erro ao obter cotação para ${ticker}:`, error)
    return NextResponse.json({ 
      price: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 })
  }
}
