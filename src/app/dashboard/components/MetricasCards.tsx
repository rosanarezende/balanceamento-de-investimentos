"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { 
  Tooltip as UITooltip, 
  TooltipContent as UITooltipContent, 
  TooltipTrigger as UITooltipTrigger, 
  TooltipProvider as UITooltipProvider 
} from "@/components/ui/tooltip"
import { formatCurrency } from "@/core/utils"
import { cn } from "@/core/utils"
import { usePortfolio } from "@/core/state/portfolio-context"

export function MetricasCards() {
  const { portfolioSummary } = usePortfolio()
  return (
    <UITooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Valor Total */}
        <UITooltip>
          <UITooltipTrigger asChild>
            <div className="text-center p-6 rounded-lg bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 cursor-help">
              <div className="text-3xl font-bold text-white">
                {formatCurrency(portfolioSummary.totalValue)}
              </div>
              <div className="text-slate-400">Valor Total</div>
            </div>
          </UITooltipTrigger>
          <UITooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              Soma do valor atual de todos os ativos na sua carteira, baseado nos preços mais recentes disponíveis.
            </p>
          </UITooltipContent>
        </UITooltip>

        {/* Número de Ativos */}
        <UITooltip>
          <UITooltipTrigger asChild>
            <div className="text-center p-6 rounded-lg bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 cursor-help">
              <div className="text-3xl font-bold text-white">
                {portfolioSummary.stockCount}
              </div>
              <div className="text-slate-400">Ativos Diferentes</div>
            </div>
          </UITooltipTrigger>
          <UITooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              Quantidade de diferentes ativos (ações, fundos, etc.) que compõem sua carteira de investimentos.
            </p>
          </UITooltipContent>
        </UITooltip>

        {/* Performance Hoje */}
        <UITooltip>
          <UITooltipTrigger asChild>
            <div className={cn(
              "text-center p-6 rounded-lg border cursor-help",
              portfolioSummary.performanceToday === "up"
                ? "bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30"
                : portfolioSummary.performanceToday === "down"
                  ? "bg-gradient-to-r from-red-600/20 to-rose-600/20 border-red-500/30"
                  : "bg-gradient-to-r from-slate-600/20 to-gray-600/20 border-slate-500/30"
            )}>
              <div className={cn(
                "text-3xl font-bold flex items-center justify-center",
                portfolioSummary.performanceToday === "up" ? "text-green-400" :
                  portfolioSummary.performanceToday === "down" ? "text-red-400" : "text-slate-400"
              )}>
                {portfolioSummary.performanceToday === "up" ? <TrendingUp className="w-6 h-6 mr-2" /> :
                  portfolioSummary.performanceToday === "down" ? <TrendingDown className="w-6 h-6 mr-2" /> : null}
                {(portfolioSummary.dailyChangePercentage || 0).toFixed(2)}%
              </div>
              <div className="text-slate-400">Hoje</div>
            </div>
          </UITooltipTrigger>
          <UITooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              Variação percentual do valor total da sua carteira no dia atual, comparando com o fechamento anterior.
            </p>
          </UITooltipContent>
        </UITooltip>

        {/* Variação em Reais */}
        <UITooltip>
          <UITooltipTrigger asChild>
            <div className="text-center p-6 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 cursor-help">
              <div className="text-3xl font-bold text-white">
                {formatCurrency(portfolioSummary.dailyChange || 0)}
              </div>
              <div className="text-slate-400">Variação (R$)</div>
            </div>
          </UITooltipTrigger>
          <UITooltipContent side="bottom" className="max-w-xs">
            <p className="text-sm">
              Valor em reais da variação da sua carteira hoje. Representa o ganho ou perda financeira do dia.
            </p>
          </UITooltipContent>
        </UITooltip>
      </div>
    </UITooltipProvider>
  )
}
