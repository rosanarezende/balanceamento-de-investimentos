"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { useAuth } from "@/core/state/auth-context";
import {
  getUserPortfolio,
  updateStock,
  removeStock as removeStockFromFirestore,
  validateUserInput
} from "@/services/firebase/firestore";
import {
  getStockPrice,
  getMultipleStockPrices
} from "@/services/api/stock-price";
import { isDevelopmentMode, simulateStockPrices } from "@/__mocks__";
import {
  Stock,
  StockWithDetails,
  PortfolioSummary
} from "@/core/types";
import { safeNumber } from "@/core/utils";

/**
 * Interface para o contexto de portfólio
 */
interface PortfolioContextType {
  // Dados
  stocks: Record<string, Stock>;
  stocksWithDetails: StockWithDetails[];
  portfolioSummary: PortfolioSummary;
  totalPortfolioValue: number;

  // Estado
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isRefreshing: boolean;
  hasPendingOperations: boolean;
  hasStocks: boolean;
  hasEligibleStocks: boolean;

  // Ações
  refreshPortfolio: () => Promise<void>;
  addStockToPortfolio: (ticker: string, data: Omit<Stock, "ticker">) => Promise<boolean>;
  removeStockFromPortfolio: (ticker: string) => Promise<boolean>;
  updateStockInPortfolio: (ticker: string, data: Partial<Omit<Stock, "ticker">>) => Promise<boolean>;
}

// Criar contexto
const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

/**
 * Provider para o contexto de portfólio
 */
export function PortfolioProvider({ children }: { children: React.ReactNode }) {
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

      // Validar estrutura do portfólio
      if (portfolio) {
        // Transformar portfólio para adicionar ticker como chave se necessário
        const validatedPortfolio: Record<string, { ticker: string; quantity: number; targetPercentage: number; userRecommendation?: "Comprar" | "Vender" | "Aguardar"; }> = {};

        for (const [ticker, stockData] of Object.entries(portfolio)) {
          validatedPortfolio[ticker] = {
            ticker,
            quantity: stockData.quantity,
            targetPercentage: stockData.targetPercentage,
            userRecommendation: stockData.userRecommendation
          };
        }

        setStocks(validatedPortfolio);
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
      if (isDevelopmentMode()) {
        console.log("Ambiente de desenvolvimento: usando preços simulados");
        prices = simulateStockPrices(tickers);
      } else {
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
        validateUserInput({
          ...data,
          userRecommendation: data.userRecommendation ?? "Aguardar"
        });

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
        await updateStock(user.uid, ticker, {
          quantity: data.quantity,
          targetPercentage: data.targetPercentage,
          userRecommendation: data.userRecommendation ?? "Aguardar"
        });

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
        await updateStock(user.uid, ticker, {
          quantity: data.quantity ?? previousStock.quantity,
          targetPercentage: data.targetPercentage ?? previousStock.targetPercentage,
          userRecommendation: data.userRecommendation ?? previousStock.userRecommendation ?? "Aguardar"
        });

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
    try {
      if (Object.keys(stocks).length === 0) {
        setStocksWithDetails([]);
        return;
      }

      const stocksArray = Object.values(stocks);

      // Calcular detalhes com os preços disponíveis
      const detailedStocks = stocksArray.map(stock => {
        // Garantir que preço e quantidade sejam números válidos
        const currentPrice = safeNumber(stockPrices[stock.ticker]);
        const quantity = safeNumber(stock.quantity);
        const currentValue = currentPrice * quantity;

        // Simular variação diária para cada ação
        const dailyChangePercentage = (Math.random() - 0.5) * 10; // Entre -5% e +5%
        const dailyChange = (dailyChangePercentage / 100) * currentPrice;

        return {
          ...stock,
          currentPrice,
          currentValue,
          dailyChange,
          dailyChangePercentage,
          currentPercentage: 0, // Será calculado depois
          targetValue: 0, // Será calculado depois
          targetDifference: 0, // Será calculado depois
          targetDifferencePercentage: 0 // Será calculado depois
        };
      });

      // Calcular valor total da carteira com validação
      const totalValue = detailedStocks.reduce((sum, stock) => {
        return sum + safeNumber(stock.currentValue);
      }, 0);

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
    } catch (error) {
      console.error("Erro ao calcular detalhes dos ativos:", error);
      setStocksWithDetails([]);
      setError("Erro ao calcular detalhes da carteira. Tente novamente mais tarde.");
    }
  }, [stocks, stockPrices]);

  // Verificar se há ativos na carteira
  const hasStocks = Object.keys(stocks).length > 0;

  // Verificar se há ativos elegíveis para investimento (marcados como "Comprar")
  const hasEligibleStocks = stocksWithDetails.some(stock => stock.userRecommendation === "Comprar");

  // Calcular valor total da carteira com validação robusta
  const totalPortfolioValue = stocksWithDetails.reduce(
    (sum, stock) => {
      const value = safeNumber(stock.currentValue);
      return sum + value;
    },
    0
  );

  // Calcular métricas de performance do portfólio
  const totalValue = safeNumber(totalPortfolioValue);

  const totalDailyChange = stocksWithDetails.reduce((sum, stock) => {
    const change = safeNumber(stock.dailyChange);
    const quantity = safeNumber(stock.quantity);
    return sum + (change * quantity);
  }, 0);

  // Calcular percentual de variação diária da carteira
  const dailyChangePercentage = totalValue > 0 ? (totalDailyChange / totalValue) * 100 : 0;

  // Performance baseada na variação total da carteira (mais simples e correto)
  const performanceToday: "neutral" | "up" | "down" =
    dailyChangePercentage > 0 ? "up" :
      dailyChangePercentage < 0 ? "down" :
        "neutral";

  // Criar objeto de resumo do portfólio com todas as métricas calculadas
  const portfolioSummary: PortfolioSummary = {
    totalValue,
    stockCount: stocksWithDetails.length,
    hasEligibleStocks,
    dailyChange: totalDailyChange,
    dailyChangePercentage,
    performanceToday
  };

  // Memoizar o valor do contexto para evitar renderizações desnecessárias
  const contextValue = useMemo(() => ({
    // Dados
    stocks,
    stocksWithDetails,
    portfolioSummary,
    totalPortfolioValue: portfolioSummary.totalValue,
    hasStocks,
    hasEligibleStocks,

    // Estado
    loading: loading || pricesLoading,
    error,
    lastUpdated,
    isRefreshing,
    hasPendingOperations: pendingOperations.size > 0,

    // Ações
    refreshPortfolio,
    addStockToPortfolio,
    removeStockFromPortfolio,
    updateStockInPortfolio
  }), [
    stocks,
    stocksWithDetails,
    portfolioSummary,
    hasStocks,
    hasEligibleStocks,
    loading,
    pricesLoading,
    error,
    lastUpdated,
    isRefreshing,
    pendingOperations.size,
    refreshPortfolio,
    addStockToPortfolio,
    removeStockFromPortfolio,
    updateStockInPortfolio
  ]);

  return (
    <PortfolioContext.Provider value={contextValue}>
      {children}
    </PortfolioContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de portfólio
 * @returns Contexto de portfólio
 * @throws Erro se usado fora de um PortfolioProvider
 */
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio deve ser usado dentro de um PortfolioProvider");
  }
  return context;
}
