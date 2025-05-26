"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";
import { 
  getUserPortfolio, 
  updateStock, 
  removeStock as removeStockFromFirestore,
  validateUserInput
} from "@/services/firebase/firestore";
import { 
  getStockPrice, 
  getMultipleStockPrices, 
  simulateStockPrices, 
  isDevelopment 
} from "@/services/api/stockPrice";

/**
 * Hook para gerenciar o portfólio de investimentos do usuário
 * 
 * Este hook fornece funções para carregar, adicionar, atualizar e remover
 * ativos da carteira, além de calcular valores e percentuais.
 */

export type Stock = {
  ticker: string;
  quantity: number;
  targetPercentage: number;
  userRecommendation?: "Comprar" | "Vender" | "Aguardar";
}

export type StockWithDetails = Stock & {
  currentPrice: number;
  currentValue: number;
  currentPercentage: number;
  targetValue: number;
  targetDifference: number;
  targetDifferencePercentage: number;
}

export function usePortfolio() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState<Record<string, Stock>>({});
  const [stocksWithDetails, setStocksWithDetails] = useState<StockWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [stockPrices, setStockPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  // Função para buscar a carteira do usuário
  const fetchPortfolio = useCallback(async () => {
    if (!user) {
      setStocks({});
      setStocksWithDetails([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const portfolio = await getUserPortfolio(user.uid);

      if (portfolio) {
        setStocks(portfolio);
        // Preços e detalhes serão calculados em outro useEffect
      } else {
        setStocks({});
        setStocksWithDetails([]);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Erro ao buscar carteira:", err);
      setError("Não foi possível carregar sua carteira. Tente novamente mais tarde.");
      toast.error("Erro ao carregar carteira", {
        description: "Não foi possível carregar sua carteira. Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Função para buscar preços dos ativos
  const fetchStockPrices = useCallback(async (stocksList: Record<string, Stock>) => {
    const tickers = Object.keys(stocksList);

    if (tickers.length === 0) {
      setStockPrices({});
      return;
    }

    setPricesLoading(true);

    try {
      let prices: Record<string, number> = {};

      // Em desenvolvimento, usar preços simulados
      if (isDevelopment()) {
        // eslint-disable-next-line no-console
        console.log("Ambiente de desenvolvimento: usando preços simulados");
        prices = simulateStockPrices(tickers);
      } else {
        // Em produção, buscar preços reais
        // eslint-disable-next-line no-console
        console.log("Ambiente de produção: buscando preços reais");
        prices = await getMultipleStockPrices(tickers);
      }

      setStockPrices(prices);
    } catch (err) {
      console.error("Erro ao buscar preços:", err);

      // Em caso de erro, usar preços padrão como fallback
      const fallbackPrices: Record<string, number> = {};
      tickers.forEach(ticker => {
        fallbackPrices[ticker] = 50; // Valor padrão
      });

      setStockPrices(fallbackPrices);

      toast.error("Erro ao buscar cotações", {
        description: "Usando valores aproximados. Tente atualizar novamente mais tarde."
      });
    } finally {
      setPricesLoading(false);
    }
  }, []);

  // Função para atualizar manualmente a carteira
  const refreshPortfolio = useCallback(async () => {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      await fetchPortfolio();

      // Forçar atualização dos preços também
      const currentStocks = { ...stocks };
      if (Object.keys(currentStocks).length > 0) {
        await fetchStockPrices(currentStocks);
      }

      toast.success("Carteira atualizada com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar carteira:", err);
      toast.error("Erro ao atualizar carteira", {
        description: "Não foi possível atualizar sua carteira. Tente novamente mais tarde."
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchPortfolio, fetchStockPrices, isRefreshing, stocks]);

  // Função para adicionar um ativo à carteira
  const addStockToPortfolio = useCallback(
    async (ticker: string, data: Omit<Stock, "ticker">) => {
      if (!user) {
        toast.error("Você precisa estar logado para adicionar ativos.");
        return false;
      }

      const operationId = `add-${ticker}-${Date.now()}`;

      try {
        // Validar dados antes de salvar
        validateUserInput(data);
        
        // Marcar operação como pendente
        setPendingOperations(prev => new Set(prev).add(operationId));

        // Atualizar estado local imediatamente para feedback instantâneo
        setStocks(prev => ({
          ...prev,
          [ticker]: {
            ticker,
            quantity: data.quantity,
            targetPercentage: data.targetPercentage,
            userRecommendation: data.userRecommendation
          }
        }));

        // Persistir no Firebase
        await updateStock(user.uid, ticker, data);

        // Buscar preço do novo ativo
        if (!stockPrices[ticker]) {
          const price = await getStockPrice(ticker);
          if (price !== null) {
            setStockPrices(prev => ({
              ...prev,
              [ticker]: price
            }));
          }
        }

        toast.success("Ativo adicionado com sucesso!", {
          description: `${ticker} foi adicionado à sua carteira.`
        });

        return true;
      } catch (err) {
        console.error(`Erro ao adicionar ${ticker}:`, err);

        // Reverter mudança local em caso de erro
        setStocks(prev => {
          const newStocks = { ...prev };
          delete newStocks[ticker];
          return newStocks;
        });

        toast.error("Erro ao adicionar ativo", {
          description: `Não foi possível adicionar ${ticker}. Tente novamente.`
        });

        return false;
      } finally {
        // Remover operação da lista de pendentes
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
      }
    },
    [user, stockPrices]
  );

  // Função para remover um ativo da carteira
  const removeStockFromPortfolio = useCallback(
    async (ticker: string) => {
      if (!user) {
        toast.error("Você precisa estar logado para remover ativos.");
        return false;
      }

      const operationId = `remove-${ticker}-${Date.now()}`;
      const previousStock = stocks[ticker];

      try {
        // Marcar operação como pendente
        setPendingOperations(prev => new Set(prev).add(operationId));

        // Atualizar estado local imediatamente para feedback instantâneo
        setStocks(prev => {
          const newStocks = { ...prev };
          delete newStocks[ticker];
          return newStocks;
        });

        // Persistir no Firebase
        await removeStockFromFirestore(user.uid, ticker);

        toast.success("Ativo removido com sucesso!", {
          description: `${ticker} foi removido da sua carteira.`
        });

        return true;
      } catch (err) {
        console.error(`Erro ao remover ${ticker}:`, err);

        // Reverter mudança local em caso de erro
        if (previousStock) {
          setStocks(prev => ({
            ...prev,
            [ticker]: previousStock
          }));
        }

        toast.error("Erro ao remover ativo", {
          description: `Não foi possível remover ${ticker}. Tente novamente.`
        });

        return false;
      } finally {
        // Remover operação da lista de pendentes
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
      }
    },
    [user, stocks]
  );

  // Função para atualizar um ativo na carteira
  const updateStockInPortfolio = useCallback(
    async (ticker: string, data: Partial<Omit<Stock, "ticker">>) => {
      if (!user) {
        toast.error("Você precisa estar logado para atualizar ativos.");
        return false;
      }

      if (!stocks[ticker]) {
        toast.error("Ativo não encontrado na carteira.");
        return false;
      }

      const operationId = `update-${ticker}-${Date.now()}`;
      const previousStock = stocks[ticker];

      try {
        // Marcar operação como pendente
        setPendingOperations(prev => new Set(prev).add(operationId));

        // Atualizar estado local imediatamente para feedback instantâneo
        setStocks(prev => ({
          ...prev,
          [ticker]: {
            ...prev[ticker],
            ...data
          }
        }));

        // Persistir no Firebase
        await updateStock(user.uid, ticker, data);

        toast.success("Ativo atualizado com sucesso!", {
          description: `${ticker} foi atualizado na sua carteira.`
        });

        return true;
      } catch (err) {
        console.error(`Erro ao atualizar ${ticker}:`, err);

        // Reverter mudança local em caso de erro
        setStocks(prev => ({
          ...prev,
          [ticker]: previousStock
        }));

        toast.error("Erro ao atualizar ativo", {
          description: `Não foi possível atualizar ${ticker}. Tente novamente.`
        });

        return false;
      } finally {
        // Remover operação da lista de pendentes
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(operationId);
          return newSet;
        });
      }
    },
    [user, stocks]
  );

  // Carregar a carteira quando o usuário mudar
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Buscar preços quando a carteira mudar
  useEffect(() => {
    if (Object.keys(stocks).length > 0) {
      fetchStockPrices(stocks);
    }
  }, [stocks, fetchStockPrices]);

  // Calcular detalhes dos ativos quando a carteira ou preços mudarem
  useEffect(() => {
    if (Object.keys(stocks).length === 0) {
      setStocksWithDetails([]);
      return;
    }

    const stocksArray = Object.values(stocks);

    // Calcular detalhes com os preços disponíveis
    const detailedStocks = stocksArray.map(stock => {
      // Usar preço da API ou um valor padrão se não disponível
      const currentPrice = stockPrices[stock.ticker] || 0;
      const currentValue = currentPrice * stock.quantity;

      return {
        ...stock,
        currentPrice,
        currentValue,
        currentPercentage: 0, // Será calculado depois
        targetValue: 0, // Será calculado depois
        targetDifference: 0, // Será calculado depois
        targetDifferencePercentage: 0 // Será calculado depois
      };
    });

    // Calcular valor total da carteira
    const totalValue = detailedStocks.reduce((sum, stock) => sum + stock.currentValue, 0);

    // Calcular percentuais e diferenças
    const finalDetailedStocks = detailedStocks.map(stock => {
      const currentPercentage = totalValue > 0 ? (stock.currentValue / totalValue) * 100 : 0;
      const targetValue = (stock.targetPercentage / 100) * totalValue;
      const targetDifference = targetValue - stock.currentValue;
      const targetDifferencePercentage = stock.currentValue > 0
        ? (targetDifference / stock.currentValue) * 100
        : 0;

      return {
        ...stock,
        currentPercentage,
        targetValue,
        targetDifference,
        targetDifferencePercentage
      };
    });

    setStocksWithDetails(finalDetailedStocks);
  }, [stocks, stockPrices]);

  // Calcular valor total da carteira
  const totalPortfolioValue = stocksWithDetails.reduce(
    (sum, stock) => sum + stock.currentValue,
    0
  );

  // Verificar se há ativos na carteira
  const hasStocks = Object.keys(stocks).length > 0;
  
  // Verificar se há ativos elegíveis para investimento (marcados como "Comprar")
  const hasEligibleStocks = stocksWithDetails.some(stock => stock.userRecommendation === "Comprar");

  return {
    stocks,
    stocksWithDetails,
    totalPortfolioValue,
    loading: loading || pricesLoading,
    error,
    lastUpdated,
    isRefreshing,
    hasPendingOperations: pendingOperations.size > 0,
    hasStocks,
    hasEligibleStocks,
    refreshPortfolio,
    addStockToPortfolio,
    removeStockFromPortfolio,
    updateStockInPortfolio
  };
}
