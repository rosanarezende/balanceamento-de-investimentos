"use client"

import React from 'react'
import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BalanceSimulationResult } from '@/core/types/portfolio'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatPercentage } from '@/core/utils/formatting'
import { portfolioColors } from "@/styles/portfolio-theme"

interface SimulationSummaryCardProps {
  result: BalanceSimulationResult;
}

/**
 * Card de resumo da simulação de balanceamento com suporte aos novos campos
 * (preço teto, yield on cost)
 */
export const SimulationSummaryCard: React.FC<SimulationSummaryCardProps> = ({ result }) => {
  const {
    totalInvestment,
    portfolioValueBefore,
    portfolioValueAfter,
    percentageChange,
    // Novos campos
    hasStocksAboveCeilingPrice,
    averageYieldOnCost
  } = result;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className={`text-xl font-bold ${portfolioColors.title}`}>
          Resumo da Simulação
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Alerta para ativos acima do preço teto */}
        {hasStocksAboveCeilingPrice && (
          <Alert className="bg-yellow-500/10 border-yellow-500/30 mb-4">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-sm">
              <p>
                <span className="font-medium text-yellow-500">Atenção:</span> Alguns ativos estão com preço atual acima do seu preço teto definido.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Considere revisar suas recomendações ou aguardar uma melhor oportunidade de compra.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor a Investir</p>
            <p className="text-lg font-medium">{formatCurrency(totalInvestment)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Valor Atual da Carteira</p>
            <p className="text-lg font-medium">{formatCurrency(portfolioValueBefore)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Valor Após Investimento</p>
            <p className="text-lg font-medium">{formatCurrency(portfolioValueAfter)}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Variação Percentual</p>
            <p className="text-lg font-medium text-green-500">+{formatPercentage(percentageChange)}</p>
          </div>
        </div>
        
        {/* Seção de métricas adicionais */}
        {averageYieldOnCost !== undefined && (
          <>
            <Separator className="my-4" />
            
            <div>
              <p className="text-sm text-muted-foreground">Yield on Cost Médio da Carteira</p>
              <p className="text-lg font-medium">
                {formatPercentage(averageYieldOnCost)}
                <span className="text-xs text-muted-foreground ml-2">
                  (baseado nos preços médios de compra informados)
                </span>
              </p>
            </div>
          </>
        )}
        
        {/* Dicas e observações */}
        <div className="mt-6 p-4 bg-muted/50 rounded-md">
          <p className="text-sm font-medium mb-2">Observações:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• As recomendações consideram sua meta de alocação e suas recomendações pessoais.</li>
            <li>• Ativos marcados como "Aguardar" ou "Vender" não recebem aporte recomendado.</li>
            {hasStocksAboveCeilingPrice && (
              <li>• Ativos com preço atual acima do seu preço teto não recebem aporte recomendado.</li>
            )}
            <li>• O número de ações é estimado com base nos preços atuais.</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationSummaryCard;
