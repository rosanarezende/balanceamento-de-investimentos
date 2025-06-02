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

// Valores padrão para fallback em caso de erro
const DEFAULT_STOCK_PRICE = 50; // Valor padrão para ações sem cotação
const FETCH_TIMEOUT = 5000; // Timeout para requisições (5 segundos)

/**
 * Obtém o preço atual de uma ação
 * @param ticker Código da ação
 * @returns Preço da ação ou valor de fallback em caso de erro
 */
export async function getStockPrice(ticker: string): Promise<number> {
  try {
    // Verificar cache primeiro
    const now = Date.now();
    const cachedData = priceCache[ticker];
    
    if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
      return cachedData.price;
    }
    
    // Adicionar sufixo .SA para ações brasileiras se não tiver
    const formattedTicker = ticker.includes('.') ? ticker : `${ticker}.SA`;

    // Criar controller para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    try {
      // Usar endpoint de API interno com timeout
      const response = await fetch(`/api/stock-price?ticker=${formattedTicker}`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

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
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError; // Propagar erro para ser tratado no catch externo
    }
  } catch (error) {
    console.error(`Erro ao obter cotação para ${ticker}:`, error);
    
    // Usar valor de cache expirado se disponível como primeira opção de fallback
    const cachedData = priceCache[ticker];
    if (cachedData) {
      console.log(`Usando valor de cache expirado para ${ticker}: ${cachedData.price}`);
      return cachedData.price;
    }
    
    // Usar valor padrão como última opção de fallback
    console.log(`Usando valor padrão para ${ticker}: ${DEFAULT_STOCK_PRICE}`);
    return DEFAULT_STOCK_PRICE;
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
      try {
        // getStockPrice agora sempre retorna um número (valor real ou fallback)
        const price = await getStockPrice(ticker);
        results[ticker] = price;
      } catch (error) {
        // Este catch não deve ser acionado normalmente, pois getStockPrice já tem fallback
        console.error(`Erro inesperado ao obter cotação para ${ticker}:`, error);
        results[ticker] = DEFAULT_STOCK_PRICE;
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
    toast.warning(`Usando valores aproximados para ${failedCount} ativo(s)`, {
      description: "Alguns valores podem estar desatualizados ou são estimativas."
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

/**
 * Obtém o preço atual de uma ação
 * @param ticker Código da ação
 * @returns Preço da ação ou valor de fallback em caso de erro
 */
export async function fetchStockPrice(ticker: string): Promise<number> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    const response = await fetch(`/api/stock-price?ticker=${ticker}`, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erro ao obter cotação: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.price || DEFAULT_STOCK_PRICE;
  } catch (error) {
    console.error(`Erro ao obter cotação para ${ticker}:`, error);
    return DEFAULT_STOCK_PRICE;
  }
}

/**
 * Salva uma recomendação manual
 * @param ticker Código da ação
 * @param recommendation Recomendação manual
 */
export async function saveManualRecommendation(ticker: string, recommendation: string): Promise<void> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    
    const response = await fetch(`/api/save-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker, recommendation }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Erro ao salvar recomendação: ${response.statusText}`);
    }
  } catch (error) {
    console.error(`Erro ao salvar recomendação para ${ticker}:`, error);
    toast.error("Não foi possível salvar a recomendação", {
      description: "Tente novamente mais tarde."
    });
  }
}

/**
 * Tipos de recomendação
 */
export const RECOMMENDATION_TYPES = ['Comprar', 'Vender', 'Aguardar'] as const;

/**
 * Descrições dos tipos de recomendação
 */
export const RECOMMENDATION_DESCRIPTIONS = {
  Comprar: 'Recomendado para compra com base na análise técnica e fundamentalista',
  Vender: 'Recomendado para venda devido a riscos ou sobrevalorização',
  Aguardar: 'Aguardar melhores oportunidades ou mais informações antes de decidir'
};

/**
 * Simula variação diária de uma ação
 * @param ticker Código da ação
 * @returns Percentual de variação diária
 */
export async function fetchDailyChange(ticker: string): Promise<number> {
  // Simular uma variação entre -5% e +5%
  console.log(`Simulando variação diária para ${ticker}`);
  return (Math.random() - 0.5) * 10;
}
