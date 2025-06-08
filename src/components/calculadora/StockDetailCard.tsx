"use client"

import React from 'react'
import { StockWithDetails } from '@/core/types/portfolio'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { StockCeilingPriceAlert } from '@/components/calculadora/StockCeilingPriceAlert'
import { YieldOnCostDisplay } from '@/components/calculadora/YieldOnCostDisplay'
import { FundamentalsNotesField } from '@/components/calculadora/FundamentalsNotesField'
import { formatCurrency, formatPercentage } from '@/core/utils/formatting'
import { portfolioColors } from "@/styles/portfolio-theme"

interface StockDetailCardProps {
  stock: StockWithDetails;
}

/**
 * Card de detalhes do ativo com suporte aos novos campos
 * (preço teto, preço médio e notas fundamentais)
 */
export const StockDetailCard: React.FC<StockDetailCardProps> = ({ stock }) => {
  const {
    ticker,
    quantity,
    currentPrice,
    currentValue,
    currentPercentage,
    targetPercentage,
    difference,
    userRecommendation,
    // Novos campos
    precoTetoUsuario,
    precoMedioCompra,
    notasFundamentos,
    isAboveCeilingPrice,
    yieldOnCost
  } = stock;

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
    <Card className="w-full">
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
            currentPrice={currentPrice}
            ceilingPrice={precoTetoUsuario || 0}
          />
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Quantidade</p>
            <p className="text-lg font-medium">{quantity}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Preço Atual</p>
            <p className="text-lg font-medium">{formatCurrency(currentPrice)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-lg font-medium">{formatCurrency(currentValue)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Alocação Atual</p>
            <p className="text-lg font-medium">{formatPercentage(currentPercentage)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Meta de Alocação</p>
            <p className="text-lg font-medium">{formatPercentage(targetPercentage)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Diferença</p>
            <p className={`text-lg font-medium ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(difference)}
            </p>
          </div>
        </div>
        
        {/* Seção de campos adicionais */}
        {(precoTetoUsuario || precoMedioCompra || notasFundamentos) && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              {/* Linha com preço teto e preço médio */}
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
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium">{formatCurrency(precoMedioCompra)}</p>
                      {yieldOnCost && (
                        <YieldOnCostDisplay
                          precoMedioCompra={precoMedioCompra}
                          currentPrice={currentPrice}
                          dividendYield={2} // Valor fixo para exemplo
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Notas fundamentais */}
              {notasFundamentos && (
                <div className="mt-4">
                  <FundamentalsNotesField
                    value={notasFundamentos}
                    onChange={() => {}} // Somente leitura
                    readOnly={true}
                    collapsible={true}
                    initiallyExpanded={false}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StockDetailCard;
