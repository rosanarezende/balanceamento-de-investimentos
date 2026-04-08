"use client"

import React from 'react'
import { ArrowLeft, RefreshCw, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CalculadoraHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  onToggleTheme: () => void;
  onToggleHelp: () => void;
  isRefreshing: boolean;
  theme: string;
  title?: string;
  description?: string;
}

export const CalculadoraHeader: React.FC<CalculadoraHeaderProps> = ({
  onBack,
  onRefresh,
  onToggleTheme,
  onToggleHelp,
  isRefreshing,
  theme,
  title = "Calculadora de Balanceamento",
  description = "Calcule como reorganizar seus investimentos"
}) => {
  return (
    <CardHeader className="p-4 border-b border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <CardTitle className="text-lg font-medium text-foreground">{title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">{description}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Atualizar carteira</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleTheme}
                >
                  {theme === 'dark' ? '🌙' : '☀️'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Alternar tema</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleHelp}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Informações sobre a calculadora</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </CardHeader>
  )
}

export default CalculadoraHeader
