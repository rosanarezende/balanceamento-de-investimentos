"use client"

import React from 'react'
import { AlertTriangle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { portfolioColors } from "@/styles/portfolio-theme"

interface StockCeilingPriceAlertProps {
  ticker: string;
  currentPrice: number;
  ceilingPrice: number;
  showDetails?: boolean;
}

/**
 * Componente que exibe um alerta quando o preço atual de um ativo
 * está acima do preço teto definido pelo usuário
 */
export const StockCeilingPriceAlert: React.FC<StockCeilingPriceAlertProps> = ({
  ticker,
  currentPrice,
  ceilingPrice,
  showDetails = true
}) => {
  // Só exibe o alerta se o preço teto estiver definido e o preço atual for maior
  if (!ceilingPrice || currentPrice <= ceilingPrice) {
    return null;
  }

  // Calcula a porcentagem acima do preço teto
  const percentageAbove = ((currentPrice - ceilingPrice) / ceilingPrice) * 100;
  
  return (
    <Alert className="bg-yellow-500/10 border-yellow-500/30 mb-4">
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
      <AlertTitle className="text-yellow-500 font-medium">
        Preço acima do teto definido
      </AlertTitle>
      {showDetails && (
        <AlertDescription className="text-sm">
          <p>
            O preço atual de <span className="font-medium">{ticker}</span> (R$ {currentPrice.toFixed(2)}) 
            está <span className="font-medium text-yellow-500">{percentageAbove.toFixed(1)}%</span> acima 
            do seu preço teto definido (R$ {ceilingPrice.toFixed(2)}).
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Considere revisar sua estratégia de alocação para este ativo.
          </p>
        </AlertDescription>
      )}
    </Alert>
  )
}

export default StockCeilingPriceAlert
