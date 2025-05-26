import { NextResponse } from 'next/server';

/**
 * Endpoint de API para obter preços de ações
 * 
 * Este endpoint consulta APIs externas (Yahoo Finance e Alpha Vantage)
 * para obter o preço atual de uma ação.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ price: null, error: 'Ticker é obrigatório' }, { status: 400 });
  }

  try {
    // Formatar o símbolo para Yahoo Finance
    const yahooSymbol = ticker.includes('.SA') ? ticker : `${ticker}.SA`;
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

    // Tentar obter dados do Yahoo Finance primeiro
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1d`,
      { next: { revalidate: 300 } } // Cache por 5 minutos
    );
    
    if (response.ok) {
      const data = await response.json();
      
      // Verificar se temos dados válidos
      if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
        const price = data.chart.result[0].meta.regularMarketPrice;
        return NextResponse.json({ 
          price,
          source: 'Yahoo Finance',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Fallback para Alpha Vantage se Yahoo Finance não retornar preço
    if (apiKey) {
      const alphaResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`,
        { next: { revalidate: 300 } } // Cache por 5 minutos
      );
      
      if (alphaResponse.ok) {
        const alphaData = await alphaResponse.json();
        
        if (alphaData?.['Global Quote']?.['05. price']) {
          const price = parseFloat(alphaData['Global Quote']['05. price']);
          return NextResponse.json({ 
            price,
            source: 'Alpha Vantage',
            timestamp: new Date().toISOString()
          });
        }
      }
    }
    
    // Se não conseguir obter o preço de nenhuma API, retornar erro
    throw new Error('Preço não disponível em nenhuma das fontes consultadas');
  } catch (error) {
    console.error(`Erro ao obter cotação para ${ticker}:`, error);
    return NextResponse.json({ 
      price: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
