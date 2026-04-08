"use client"

import React from 'react'
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/core/utils/formatting"

interface AveragePriceInputFieldProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  currentPrice?: number;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  showComparison?: boolean;
}

/**
 * Campo de entrada para o preço médio de compra
 * com validação e comparação com o preço atual
 */
export const AveragePriceInputField: React.FC<AveragePriceInputFieldProps> = ({
  value,
  onChange,
  currentPrice,
  label = "Preço Médio de Compra",
  placeholder = "0,00",
  readOnly = false,
  showComparison = true
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d,]/g, "").replace(",", ".");
    
    if (!inputValue) {
      onChange(undefined);
      return;
    }
    
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    }
  };
  
  // Formata o valor para exibição
  const displayValue = value !== undefined 
    ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '';
  
  // Determina se o preço atual está acima do preço médio
  const isProfitable = currentPrice !== undefined && 
                      value !== undefined && 
                      currentPrice > value;
  
  // Calcula a diferença percentual (retorno)
  const percentageReturn = value !== undefined && currentPrice !== undefined && value > 0
    ? ((currentPrice - value) / value) * 100
    : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="precoMedio" className="text-sm font-medium flex items-center">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Informe o preço médio pelo qual você adquiriu este ativo.
                  <br />
                  Este valor será usado para calcular o Yield on Cost (YOC) e o retorno sobre o investimento.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <span className="text-muted-foreground">R$</span>
        </div>
        <Input
          id="precoMedio"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`pl-9 ${readOnly ? 'bg-muted/50 cursor-default' : ''}`}
          readOnly={readOnly}
        />
      </div>
      
      {showComparison && currentPrice !== undefined && value !== undefined && (
        <div className={`text-xs ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
          Preço atual: {formatCurrency(currentPrice)} 
          {isProfitable 
            ? ` (${percentageReturn.toFixed(1)}% de retorno)`
            : ` (${Math.abs(percentageReturn).toFixed(1)}% de perda)`
          }
        </div>
      )}
    </div>
  );
}

export default AveragePriceInputField
