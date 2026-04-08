"use client"

import React, { useState } from 'react'
import { FileText, ChevronDown, ChevronUp } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { portfolioColors } from "@/styles/portfolio-theme"

interface FundamentalsNotesFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  maxLength?: number;
  readOnly?: boolean;
  collapsible?: boolean;
  initiallyExpanded?: boolean;
}

/**
 * Campo para entrada e exibição de notas fundamentais manuais
 * com suporte a modo colapsável para economizar espaço na interface
 */
export const FundamentalsNotesField: React.FC<FundamentalsNotesFieldProps> = ({
  value,
  onChange,
  label = "Notas/Métricas Fundamentais",
  placeholder = "Insira suas anotações sobre métricas fundamentais, análises ou observações importantes...",
  maxLength = 500,
  readOnly = false,
  collapsible = true,
  initiallyExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [charCount, setCharCount] = useState(value?.length || 0);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    
    onChange(newValue);
    setCharCount(newValue.length);
  };
  
  // Se não houver valor e for somente leitura, não exibe nada
  if (!value && readOnly) return null;
  
  // Conteúdo do campo
  const fieldContent = (
    <>
      {!readOnly && (
        <div className="flex justify-between items-center mb-1">
          <Label htmlFor="notasFundamentos" className="text-sm font-medium">
            {label}
          </Label>
          <span className="text-xs text-muted-foreground">
            {charCount}/{maxLength}
          </span>
        </div>
      )}
      
      <Textarea
        id="notasFundamentos"
        value={value || ''}
        onChange={handleChange}
        placeholder={readOnly ? '' : placeholder}
        className={`resize-none ${readOnly ? 'bg-muted/50 cursor-default' : ''}`}
        rows={readOnly ? 3 : 4}
        readOnly={readOnly}
      />
      
      {readOnly && value && (
        <div className="mt-1 text-xs text-right text-muted-foreground">
          {value.length} caracteres
        </div>
      )}
    </>
  );
  
  // Se não for colapsável, retorna apenas o conteúdo
  if (!collapsible) {
    return fieldContent;
  }
  
  // Versão colapsável
  return (
    <Card className="border border-border bg-card/50">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className={`font-medium ${portfolioColors.subtitle}`}>
            {label}
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
        <CardContent className="pt-0 pb-3 px-3">
          {fieldContent}
        </CardContent>
      )}
    </Card>
  );
}

export default FundamentalsNotesField
