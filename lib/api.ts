"use client"

import { toast } from "sonner"

// const ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY

// Função para obter cotação de um ativo
export async function getStockPrice(ticker: string): Promise<number | null> {
  try {
    // Adicionar sufixo .SA para ações brasileiras se não tiver
    const formattedTicker = ticker.includes('.') ? ticker : `${ticker}.SA`

    // Usar Yahoo Finance API através do data_api
    const response = await fetch(`/api/stock-price?ticker=${formattedTicker}`)

    if (!response.ok) {
      throw new Error(`Erro ao obter cotação: ${response.statusText}`)
    }

    const data = await response.json()

    // Verificar se temos um preço válido
    if (data && data.price && typeof data.price === 'number') {
      return data.price
    }

    throw new Error('Preço não disponível')
  } catch (error) {
    console.error(`Erro ao obter cotação para ${ticker}:`, error)
    return null
  }
}

// Função para obter cotações de múltiplos ativos
export async function getMultipleStockPrices(tickers: string[]): Promise<Record<string, number>> {
  const results: Record<string, number> = {}
  let failedCount = 0

  // Processar em lotes para evitar muitas requisições simultâneas
  const batchSize = 5

  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize)

    // Processar lote em paralelo
    const batchPromises = batch.map(async (ticker) => {
      const price = await getStockPrice(ticker)

      if (price !== null) {
        results[ticker] = price
      } else {
        failedCount++
      }
    })

    await Promise.all(batchPromises)

    // Pequeno delay entre lotes para evitar rate limiting
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  // Notificar se houver falhas
  if (failedCount > 0) {
    toast.error(`Não foi possível obter cotação para ${failedCount} ativo(s)`, {
      description: "Alguns valores podem estar desatualizados ou indisponíveis."
    })
  }

  return results
}

// Função para simular preços (apenas para desenvolvimento)
export function simulateStockPrices(tickers: string[]): Record<string, number> {
  const results: Record<string, number> = {}

  tickers.forEach(ticker => {
    // Gerar preço entre R$10 e R$100
    results[ticker] = Math.random() * 90 + 10
  })

  return results
}

// Função para determinar se estamos em ambiente de desenvolvimento
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}
