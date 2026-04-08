"use client"

import React from 'react'
import { BalanceRecommendation } from '@/core/types/portfolio'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { YieldOnCostDisplay } from '@/components/calculadora/YieldOnCostDisplay'
import { StockCeilingPriceAlert } from '@/components/calculadora/StockCeilingPriceAlert'
import { formatCurrency, formatPercentage, formatNumber } from '@/core/utils/formatting'
import { portfolioColors } from "@/styles/portfolio-theme"

interface RecommendationCardProps {
  recommendation: BalanceRecommendation;
  investmentAmount: number;
}

/**
 * Card de recomendação de balanceamento com suporte aos novos campos
 * (preço teto, preço médio e yield on cost)
 */
export const RecommendationCard: React.FC<RecommendationCardProps> = ({ 
  recommendation,
  investmentAmount
}) => {
  const {
    ticker,
    currentAllocation,
    targetAllocation,
    recommendedInvestment,
    expectedShares,
    userRecommendation,
    // Novos campos
    precoTetoUsuario,
    precoMedioCompra,
    isAboveCeilingPrice,
    yieldOnCost
  } = recommendation;

  // Calcula a porcentagem do investimento total
  const investmentPercentage = investmentAmount > 0 
    ? (recommendedInvestment / investmentAmount) * 100 
    : 0;

  // Determina a cor da badge de recomendação
  const getRecommendationColor = () => {
    switch (userRecommendation) {
      case 'Comprar': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'Aguardar': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Vender': return 'bg-red-500/10 text-red-500 border-red-500/30';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    }
  };

  return (
    <Card className={`w-full ${recommendedInvestment === 0 ? 'opacity-70' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className={`text-xl font-bold ${portfolioColors.title}`}>
            {ticker}
          </CardTitle>
          
          {userRecommendation && (
            <Badge variant="outline" className={`${getRecommendationColor()}`}>
              {userRecommendation}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Alerta de preço acima do teto */}
        {isAboveCeilingPrice && (
          <StockCeilingPriceAlert
            ticker={ticker}
            currentPrice={precoTetoUsuario ? (precoTetoUsuario * 1.1) : 0} // Simulação para exemplo
            ceilingPrice={precoTetoUsuario || 0}
            showDetails={false}
          />
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Alocação Atual</p>
            <p className="text-lg font-medium">{formatPercentage(currentAllocation)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Meta de Alocação</p>
            <p className="text-lg font-medium">{formatPercentage(targetAllocation)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Investimento Recomendado</p>
            <p className="text-lg font-medium">{formatCurrency(recommendedInvestment)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">% do Aporte</p>
            <p className="text-lg font-medium">{formatPercentage(investmentPercentage)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Ações Estimadas</p>
            <p className="text-lg font-medium">{formatNumber(expectedShares, 2)}</p>
          </div>
          
          {/* Yield on Cost, se disponível */}
          {yieldOnCost && precoMedioCompra && (
            <div>
              <p className="text-sm text-muted-foreground">Yield on Cost</p>
              <YieldOnCostDisplay
                precoMedioCompra={precoMedioCompra}
                currentPrice={precoMedioCompra * 1.1} // Simulação para exemplo
                dividendYield={2} // Valor fixo para exemplo
                showBadge={false}
              />
            </div>
          )}
        </div>
        
        {/* Seção de campos adicionais */}
        {(precoTetoUsuario || precoMedioCompra) && (
          <>
            <Separator className="my-4" />
            
            <div className="grid grid-cols-2 gap-4">
              {precoTetoUsuario && (
                <div>
                  <p className="text-sm text-muted-foreground">Preço Teto (Seu)</p>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-medium">{formatCurrency(precoTetoUsuario)}</p>
                    {isAboveCeilingPrice && (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30 text-xs">
                        Acima
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {precoMedioCompra && (
                <div>
                  <p className="text-sm text-muted-foreground">Preço Médio de Compra</p>
                  <p className="text-base font-medium">{formatCurrency(precoMedioCompra)}</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Explicação quando não há investimento recomendado */}
        {recommendedInvestment === 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-md text-sm text-muted-foreground">
            {isAboveCeilingPrice ? (
              <p>Sem aporte recomendado: preço atual acima do seu preço teto definido.</p>
            ) : userRecommendation === 'Aguardar' || userRecommendation === 'Vender' ? (
              <p>Sem aporte recomendado: sua recomendação é {userRecommendation.toLowerCase()} este ativo.</p>
            ) : (
              <p>Sem aporte recomendado: este ativo já está próximo ou acima da meta de alocação.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
