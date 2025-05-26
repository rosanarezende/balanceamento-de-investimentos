"use client";

import { toast } from "sonner";

/**
 * Serviço para obtenção de preços de ações
 * 
 * Este módulo contém funções para obter preços de ações de APIs externas,
 * com suporte a cache e tratamento de erros.
 */

// Cache para armazenar preços recentes e evitar chamadas repetidas
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos em milissegundos

/**
 * Obtém o preço atual de uma ação
 * @param ticker Código da ação
 * @returns Preço da ação ou null em caso de erro
 */
export async function getStockPrice(ticker: string): Promise<number | null> {
  try {
    // Verificar cache primeiro
    const now = Date.now();
    const cachedData = priceCache[ticker];
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.price;
    }
    
    // Adicionar sufixo .SA para ações brasileiras se não tiver
    const formattedTicker = ticker.includes('.') ? ticker : `${ticker}.SA`;

    // Usar endpoint de API interno
    const response = await fetch(`/api/stock-price?ticker=${formattedTicker}`);

    if (!response.ok) {
      throw new Error(`Erro ao obter cotação: ${response.statusText}`);
    }

    const data = await response.json();

    // Verificar se temos um preço válido
    if (data && data.price && typeof data.price === 'number') {
      // Atualizar cache
      priceCache[ticker] = {
        price: data.price,
        timestamp: now
      };
      
      return data.price;
    }

    throw new Error('Preço não disponível');
  } catch (error) {
    console.error(`Erro ao obter cotação para ${ticker}:`, error);
    return null;
  }
}

/**
 * Obtém preços de múltiplas ações em lotes
 * @param tickers Lista de códigos de ações
 * @returns Objeto com preços por ticker
 */
export async function getMultipleStockPrices(tickers: string[]): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  let failedCount = 0;

  // Processar em lotes para evitar muitas requisições simultâneas
  const batchSize = 5;

  for (let i = 0; i < tickers.length; i += batchSize) {
    const batch = tickers.slice(i, i + batchSize);

    // Processar lote em paralelo
    const batchPromises = batch.map(async (ticker) => {
      const price = await getStockPrice(ticker);

      if (price !== null) {
        results[ticker] = price;
      } else {
        failedCount++;
      }
    });

    await Promise.all(batchPromises);

    // Pequeno delay entre lotes para evitar rate limiting
    if (i + batchSize < tickers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Notificar se houver falhas
  if (failedCount > 0) {
    toast.error(`Não foi possível obter cotação para ${failedCount} ativo(s)`, {
      description: "Alguns valores podem estar desatualizados ou indisponíveis."
    });
  }

  return results;
}

/**
 * Simula preços de ações (apenas para desenvolvimento)
 * @param tickers Lista de códigos de ações
 * @returns Objeto com preços simulados por ticker
 */
export function simulateStockPrices(tickers: string[]): Record<string, number> {
  const results: Record<string, number> = {};

  tickers.forEach(ticker => {
    // Gerar preço entre R$10 e R$100
    results[ticker] = Math.random() * 90 + 10;
  });

  return results;
}

/**
 * Verifica se estamos em ambiente de desenvolvimento
 * @returns true se estiver em ambiente de desenvolvimento
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}
