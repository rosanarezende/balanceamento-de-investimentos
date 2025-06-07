/**
 * Utilitários para cálculos da calculadora de balanceamento
 * Inclui suporte aos novos campos: precoTetoUsuario, precoMedioCompra
 */

import { Portfolio, StockWithDetails, BalanceRecommendation, BalanceSimulationResult } from '@/core/types/portfolio';

/**
 * Calcula detalhes adicionais para cada ativo do portfólio
 * @param portfolio Portfólio com ativos
 * @param prices Mapa de preços atuais por ticker
 * @returns Portfólio com detalhes adicionais calculados
 */
export const calculatePortfolioDetails = (
  portfolio: Portfolio,
  prices: Record<string, number>
): Record<string, StockWithDetails> => {
  // Calcula o valor total do portfólio
  const totalValue = Object.entries(portfolio).reduce((sum, [ticker, stock]) => {
    const price = prices[ticker] || 0;
    return sum + (stock.quantity * price);
  }, 0);

  // Calcula detalhes para cada ativo
  return Object.entries(portfolio).reduce((result, [ticker, stock]) => {
    const currentPrice = prices[ticker] || 0;
    const currentValue = stock.quantity * currentPrice;
    const currentPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
    const targetValue = (stock.targetPercentage / 100) * totalValue;
    const difference = targetValue - currentValue;

    // Novos campos calculados
    const yieldOnCost = stock.precoMedioCompra && stock.precoMedioCompra > 0
      ? (currentPrice / stock.precoMedioCompra) * 2 // Simulação de dividend yield (2%)
      : undefined;
    
    const isAboveCeilingPrice = stock.precoTetoUsuario !== undefined && 
      currentPrice > stock.precoTetoUsuario;

    result[ticker] = {
      ...stock,
      currentPrice,
      currentValue,
      currentPercentage,
      targetValue,
      difference,
      // Novos campos
      yieldOnCost,
      isAboveCeilingPrice
    };

    return result;
  }, {} as Record<string, StockWithDetails>);
};

/**
 * Calcula recomendações de balanceamento com base no valor a investir
 * Considera preço teto definido pelo usuário nas recomendações
 * @param portfolioWithDetails Portfólio com detalhes calculados
 * @param investmentAmount Valor a ser investido
 * @returns Recomendações de balanceamento
 */
export const calculateBalanceRecommendations = (
  portfolioWithDetails: Record<string, StockWithDetails>,
  investmentAmount: number
): BalanceRecommendation[] => {
  // Calcula o valor total do portfólio
  const totalValue = Object.values(portfolioWithDetails).reduce(
    (sum, stock) => sum + stock.currentValue,
    0
  );

  // Valor total após o investimento
  const totalValueAfterInvestment = totalValue + investmentAmount;

  // Calcula recomendações para cada ativo
  const recommendations = Object.entries(portfolioWithDetails).map(([ticker, stock]) => {
    // Valor alvo após o investimento
    const targetValueAfterInvestment = (stock.targetPercentage / 100) * totalValueAfterInvestment;
    
    // Valor a investir para atingir o alvo
    let recommendedInvestment = targetValueAfterInvestment - stock.currentValue;
    
    // Não recomendar valores negativos (venda)
    recommendedInvestment = Math.max(0, recommendedInvestment);
    
    // Número esperado de ações a comprar
    const expectedShares = stock.currentPrice > 0 
      ? recommendedInvestment / stock.currentPrice 
      : 0;

    // Considerar recomendação do usuário
    if (stock.userRecommendation === 'Vender' || stock.userRecommendation === 'Aguardar') {
      recommendedInvestment = 0;
    }

    // Considerar preço teto definido pelo usuário
    // Se o preço atual estiver acima do preço teto, não recomendar compra
    if (stock.precoTetoUsuario !== undefined && 
        stock.currentPrice > stock.precoTetoUsuario) {
      recommendedInvestment = 0;
    }

    return {
      ticker,
      currentAllocation: stock.currentPercentage,
      targetAllocation: stock.targetPercentage,
      recommendedInvestment,
      expectedShares,
      userRecommendation: stock.userRecommendation,
      // Novos campos
      precoTetoUsuario: stock.precoTetoUsuario,
      precoMedioCompra: stock.precoMedioCompra,
      isAboveCeilingPrice: stock.isAboveCeilingPrice,
      yieldOnCost: stock.yieldOnCost
    };
  });

  // Ajusta as recomendações para garantir que o total não exceda o valor a investir
  const totalRecommended = recommendations.reduce(
    (sum, rec) => sum + rec.recommendedInvestment,
    0
  );

  if (totalRecommended > investmentAmount) {
    // Fator de ajuste para reduzir proporcionalmente as recomendações
    const adjustmentFactor = investmentAmount / totalRecommended;
    
    // Aplica o ajuste a todas as recomendações
    recommendations.forEach(rec => {
      rec.recommendedInvestment *= adjustmentFactor;
      rec.expectedShares = rec.currentAllocation > 0 
        ? rec.recommendedInvestment / portfolioWithDetails[rec.ticker].currentPrice 
        : 0;
    });
  }

  // Prioriza ativos com maior diferença entre alocação atual e meta
  return recommendations.sort((a, b) => {
    // Se um ativo está acima do preço teto, priorizar menos
    if (a.isAboveCeilingPrice && !b.isAboveCeilingPrice) return 1;
    if (!a.isAboveCeilingPrice && b.isAboveCeilingPrice) return -1;
    
    // Priorizar por recomendação do usuário
    if (a.userRecommendation === 'Comprar' && b.userRecommendation !== 'Comprar') return -1;
    if (a.userRecommendation !== 'Comprar' && b.userRecommendation === 'Comprar') return 1;
    
    // Priorizar por diferença entre alocação atual e meta
    return (b.targetAllocation - b.currentAllocation) - (a.targetAllocation - a.currentAllocation);
  });
};

/**
 * Calcula o resultado da simulação de balanceamento
 * @param portfolioWithDetails Portfólio com detalhes calculados
 * @param recommendations Recomendações de balanceamento
 * @param investmentAmount Valor a ser investido
 * @returns Resultado da simulação
 */
export const calculateSimulationResult = (
  portfolioWithDetails: Record<string, StockWithDetails>,
  recommendations: BalanceRecommendation[],
  investmentAmount: number
): BalanceSimulationResult => {
  // Valor total do portfólio antes do investimento
  const portfolioValueBefore = Object.values(portfolioWithDetails).reduce(
    (sum, stock) => sum + stock.currentValue,
    0
  );

  // Valor total do portfólio após o investimento
  const portfolioValueAfter = portfolioValueBefore + investmentAmount;

  // Variação percentual
  const percentageChange = portfolioValueBefore > 0 
    ? (investmentAmount / portfolioValueBefore) * 100 
    : 100;

  // Verifica se há ativos acima do preço teto
  const hasStocksAboveCeilingPrice = recommendations.some(rec => rec.isAboveCeilingPrice);

  // Calcula o YOC médio ponderado pelo valor atual
  const totalValueWithYOC = Object.values(portfolioWithDetails)
    .filter(stock => stock.yieldOnCost !== undefined)
    .reduce((sum, stock) => sum + stock.currentValue, 0);

  const weightedYOCSum = Object.values(portfolioWithDetails)
    .filter(stock => stock.yieldOnCost !== undefined)
    .reduce((sum, stock) => sum + (stock.yieldOnCost || 0) * stock.currentValue, 0);

  const averageYieldOnCost = totalValueWithYOC > 0 
    ? weightedYOCSum / totalValueWithYOC 
    : undefined;

  return {
    recommendations,
    totalInvestment: investmentAmount,
    portfolioValueBefore,
    portfolioValueAfter,
    percentageChange,
    date: new Date(),
    // Novos campos
    hasStocksAboveCeilingPrice,
    averageYieldOnCost
  };
};
