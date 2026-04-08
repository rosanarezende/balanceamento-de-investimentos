"use client"

import React from 'react'
import { Calculator } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { portfolioColors } from "@/styles/portfolio-theme"

interface YieldOnCostDisplayProps {
  precoMedioCompra?: number;
  currentPrice: number;
  dividendYield?: number;
  showBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente que exibe o Yield on Cost (YOC) calculado com base no preço médio de compra
 * e no dividend yield atual ou estimado
 */
export const YieldOnCostDisplay: React.FC<YieldOnCostDisplayProps> = ({
  precoMedioCompra,
  currentPrice,
  dividendYield = 0,
  showBadge = true,
  size = 'md'
}) => {
  // Se não tiver preço médio de compra, não exibe nada
  if (!precoMedioCompra || precoMedioCompra <= 0) {
    return null;
  }

  // Calcula o Yield on Cost
  // YOC = (Dividend Yield atual × Preço atual) ÷ Preço médio de compra
  const yieldOnCost = (dividendYield * currentPrice) / precoMedioCompra;
  
  // Define classes com base no tamanho
  const sizeClasses = {
    sm: "text-xs py-0.5 px-1.5",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1.5 px-3"
  };
  
  // Define cor com base no YOC em comparação com o dividend yield
  const getColorClass = () => {
    if (yieldOnCost > dividendYield * 1.5) return "bg-green-500/20 text-green-500 border-green-500/30";
    if (yieldOnCost > dividendYield) return "bg-green-500/10 text-green-400 border-green-400/20";
    if (yieldOnCost < dividendYield * 0.5) return "bg-red-500/20 text-red-500 border-red-500/30";
    if (yieldOnCost < dividendYield) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    return "bg-blue-500/10 text-blue-400 border-blue-400/20";
  };

  const content = (
    <div className="flex items-center gap-1">
      <span className="font-medium">YOC:</span> {yieldOnCost.toFixed(2)}%
    </div>
  );

  // Se não for para mostrar badge, retorna apenas o texto
  if (!showBadge) {
    return content;
  }

  // Caso contrário, retorna um badge com tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`${sizeClasses[size]} ${getColorClass()} cursor-help`}
          >
            <Calculator className="h-3 w-3 mr-1" />
            YOC: {yieldOnCost.toFixed(2)}%
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">
            Yield on Cost: {yieldOnCost.toFixed(2)}%
            <br />
            <span className="text-xs text-muted-foreground">
              Baseado no preço médio de R$ {precoMedioCompra.toFixed(2)}
            </span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default YieldOnCostDisplay
