"use client"

import { useState } from "react"
import { CardGlass } from "@/components/ui/card-glass"
import { SectionTitle } from "@/components/ui/section-title"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, BarChart4 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { PortfolioComparisonChart } from "@/components/dashboard/portfolio-comparison-chart"
import { cn } from "@/lib/utils"

interface PortfolioSummaryProps {
  totalValue: number
  stocksCount: number
  dailyChange: number
  dailyChangePercentage: number
  stocksData: {
    ticker: string
    currentValue: number
    currentPercentage: number
    targetPercentage: number
  }[]
}

export function PortfolioSummary({
  totalValue,
  stocksCount,
  dailyChange,
  dailyChangePercentage,
  stocksData,
}: PortfolioSummaryProps) {
  const [expanded, setExpanded] = useState(true)
  const [chartType, setChartType] = useState<"pie" | "comparison">("pie")

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <div className="mb-6 animate-fade-in">
      <CardGlass className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <SectionTitle
            title="Resumo da Carteira"
            subtitle="Visão geral dos seus investimentos"
            icon={<BarChart4 size={20} />}
          />
          <button
            onClick={toggleExpanded}
            className="p-1.5 rounded-md hover:bg-background-tertiary text-text-secondary"
            aria-label={expanded ? "Recolher" : "Expandir"}
          >
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 rounded-lg bg-background-tertiary">
            <p className="text-sm text-text-secondary mb-1">Valor Total</p>
            <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
          </div>

          <div className="p-4 rounded-lg bg-background-tertiary">
            <p className="text-sm text-text-secondary mb-1">Ativos</p>
            <p className="text-2xl font-bold">{stocksCount}</p>
          </div>

          <div className="col-span-2 md:col-span-1 p-4 rounded-lg bg-background-tertiary">
            <p className="text-sm text-text-secondary mb-1">Variação Hoje</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-bold", dailyChange >= 0 ? "text-state-success" : "text-state-error")}>
                {formatCurrency(dailyChange)}
              </p>
              <div
                className={cn(
                  "flex items-center text-sm",
                  dailyChange >= 0 ? "text-state-success" : "text-state-error",
                )}
              >
                {dailyChange >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="ml-1">{Math.abs(dailyChangePercentage).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {expanded && (
          <>
            <div className="flex justify-center mb-4">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-l-lg",
                    chartType === "pie"
                      ? "bg-accent-primary text-white"
                      : "bg-background-tertiary text-text-secondary hover:bg-background-tertiary/80",
                  )}
                  onClick={() => setChartType("pie")}
                >
                  Composição
                </button>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-r-lg",
                    chartType === "comparison"
                      ? "bg-accent-primary text-white"
                      : "bg-background-tertiary text-text-secondary hover:bg-background-tertiary/80",
                  )}
                  onClick={() => setChartType("comparison")}
                >
                  Comparação
                </button>
              </div>
            </div>

            <div className="h-64 md:h-80">
              {chartType === "pie" ? (
                <PortfolioChart data={stocksData} totalValue={totalValue} />
              ) : (
                <PortfolioComparisonChart data={stocksData} />
              )}
            </div>
          </>
        )}
      </CardGlass>
    </div>
  )
}
