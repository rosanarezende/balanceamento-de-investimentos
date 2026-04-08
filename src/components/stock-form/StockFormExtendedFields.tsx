"use client"

import React from 'react'
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PriceCeilingInputField } from "@/components/calculadora/PriceCeilingInputField"
import { AveragePriceInputField } from "@/components/calculadora/AveragePriceInputField"
import { FundamentalsNotesField } from "@/components/calculadora/FundamentalsNotesField"
import { portfolioColors } from "@/styles/portfolio-theme"

interface StockFormExtendedFieldsProps {
  precoTetoUsuario: number | undefined;
  setPrecoTetoUsuario: (value: number | undefined) => void;
  precoMedioCompra: number | undefined;
  setPrecoMedioCompra: (value: number | undefined) => void;
  notasFundamentos: string;
  setNotasFundamentos: (value: string) => void;
  currentPrice?: number;
  initiallyExpanded?: boolean;
}

/**
 * Componente que agrupa os campos estendidos do formulário de ativo
 * com suporte a ocultação progressiva conforme sugerido no documento conceitual
 */
export const StockFormExtendedFields: React.FC<StockFormExtendedFieldsProps> = ({
  precoTetoUsuario,
  setPrecoTetoUsuario,
  precoMedioCompra,
  setPrecoMedioCompra,
  notasFundamentos,
  setNotasFundamentos,
  currentPrice,
  initiallyExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = React.useState(initiallyExpanded);
  
  return (
    <Card className="border border-border bg-card/50 mt-6">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <span className={`font-medium ${portfolioColors.subtitle}`}>
            Detalhes Adicionais
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <CardContent className="pt-0 pb-4 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <PriceCeilingInputField
              value={precoTetoUsuario}
              onChange={setPrecoTetoUsuario}
              currentPrice={currentPrice}
              showComparison={!!currentPrice}
            />
            
            <AveragePriceInputField
              value={precoMedioCompra}
              onChange={setPrecoMedioCompra}
              currentPrice={currentPrice}
              showComparison={!!currentPrice}
            />
          </div>
          
          <FundamentalsNotesField
            value={notasFundamentos}
            onChange={setNotasFundamentos}
            collapsible={false}
          />
        </CardContent>
      )}
    </Card>
  );
}

export default StockFormExtendedFields
