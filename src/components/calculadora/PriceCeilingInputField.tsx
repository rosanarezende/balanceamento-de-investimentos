"use client"

import React from 'react'
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatCurrency } from "@/core/utils/formatting"

interface PriceCeilingInputFieldProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  currentPrice?: number;
  label?: string;
  placeholder?: string;
  readOnly?: boolean;
  showComparison?: boolean;
}

/**
 * Campo de entrada para o preço teto definido pelo usuário
 * com validação e comparação com o preço atual
 */
export const PriceCeilingInputField: React.FC<PriceCeilingInputFieldProps> = ({
  value,
  onChange,
  currentPrice,
  label = "Preço Teto (Seu)",
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
  
  // Determina se o preço atual está acima do preço teto
  const isAboveCeiling = currentPrice !== undefined && 
                         value !== undefined && 
                         currentPrice > value;
  
  // Calcula a diferença percentual
  const percentageDiff = value !== undefined && currentPrice !== undefined && value > 0
    ? ((currentPrice - value) / value) * 100
    : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="precoTeto" className="text-sm font-medium flex items-center">
          {label}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-3.5 w-3.5 ml-1 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Defina o preço máximo que você considera justo pagar por este ativo.
                  <br />
                  A calculadora usará este valor para alertar quando o preço atual estiver acima do seu preço teto.
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
          id="precoTeto"
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`pl-9 ${readOnly ? 'bg-muted/50 cursor-default' : ''}`}
          readOnly={readOnly}
        />
      </div>
      
      {showComparison && currentPrice !== undefined && value !== undefined && (
        <div className={`text-xs ${isAboveCeiling ? 'text-red-500' : 'text-green-500'}`}>
          Preço atual: {formatCurrency(currentPrice)} 
          {isAboveCeiling 
            ? ` (${percentageDiff.toFixed(1)}% acima do teto)`
            : ` (${Math.abs(percentageDiff).toFixed(1)}% abaixo do teto)`
          }
        </div>
      )}
    </div>
  );
}

export default PriceCeilingInputField
