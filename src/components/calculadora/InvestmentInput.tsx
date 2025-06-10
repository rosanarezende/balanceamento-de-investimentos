"use client"

import React from 'react'
import { formatCurrency } from "@/core/utils/formatting"

interface InvestmentInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  suggestedValue?: number;
  onUseSuggested?: (value: string) => void;
  placeholder?: string;
}

export const InvestmentInput: React.FC<InvestmentInputProps> = ({
  value,
  onChange,
  disabled = false,
  suggestedValue,
  onUseSuggested,
  placeholder = "0,00"
}) => {
  const formattedSuggestion = suggestedValue ? formatCurrency(suggestedValue).replace("R$", "").trim() : null;
  
  return (
    <div className="w-full space-y-2">
      <div className="bg-background border border-input rounded-lg p-4 flex items-center">
        <span className="text-muted-foreground text-2xl mr-2">R$</span>
        <input
          type="text"
          className="flex-1 text-2xl outline-none bg-transparent text-foreground"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
      
      {suggestedValue && onUseSuggested && (
        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs text-primary hover:text-primary/80 transition-colors"
            onClick={() => onUseSuggested(formattedSuggestion || "")}
            disabled={disabled}
          >
            Usar valor sugerido ({formatCurrency(suggestedValue)})
          </button>
        </div>
      )}
    </div>
  )
}

export default InvestmentInput
