"use client"

import { CardGlass } from "@/components/ui/card-glass"
import { BadgeStatus } from "@/components/ui/badge-status"
import { formatCurrency } from "@/lib/utils"
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useEffect, useState } from "react"
import { fetchDailyChange } from "@/lib/api"

interface StockCardProps {
  ticker: string
  quantity: number
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  toBuy: number
  excess: number
  currentPrice: number
  dailyChange: number
  dailyChangePercentage: number
  userRecommendation: string
  onEdit: () => void
  onDelete: () => void
  loading?: boolean
} {
}

export function StockCard({
  ticker,
  quantity,
  currentValue,
  currentPercentage,
  targetPercentage,
  toBuy,
  excess,
  currentPrice,
  dailyChange,
  dailyChangePercentage,
  userRecommendation,
  onEdit,
  onDelete,
  loading = false,
}: StockCardProps) {
  const [dailyChangeState, setDailyChangeState] = useState(dailyChange)
  const [dailyChangePercentageState, setDailyChangePercentageState] = useState(dailyChangePercentage)

  useEffect(() => {
    const fetchChange = async () => {
      const { change, changePercentage } = await fetchDailyChange(ticker)
      setDailyChangeState(change)
      setDailyChangePercentageState(changePercentage)
    }

    fetchChange()
  }, [ticker])

  // Check if currentValue is a number and greater than 0
  if (typeof currentValue !== "number" || currentValue <= 0) {
    throw new Error("currentValue must be a number greater than 0")
  }

  // Determinar o status com base na recomendação
  const getRecommendationStatus = (recommendation: string) => {
    switch (recommendation) {
      case "Comprar":
        return "success"
      case "Aguardar":
        return "warning"
      case "Vender":
        return "error"
      default:
        return "neutral"
    }
  }

  // Determinar se o ativo está acima ou abaixo da meta
  const isAboveTarget = currentPercentage > targetPercentage
  const targetDifference = Math.abs(currentPercentage - targetPercentage).toFixed(2)

  // Determinar a opacidade com base na recomendação
  const isRecommendedToBuy = userRecommendation === "Comprar"

  return (
    <CardGlass
      className={cn(
        "relative transition-all duration-300",
        isRecommendedToBuy ? "border-l-4 border-l-accent-secondary" : "opacity-80 hover:opacity-100",
      )}
      hoverEffect
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <LoadingSpinner size="lg" />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="mr-3">
            <div className="text-xs text-text-tertiary mb-1">CÓDIGO</div>
            <div className="text-lg font-bold">{ticker}</div>
          </div>

          <BadgeStatus status={getRecommendationStatus(userRecommendation)} label={userRecommendation} />
        </div>

        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onEdit}
                  className="p-2 rounded-full hover:bg-background-tertiary text-text-secondary"
                  aria-label="Editar ativo"
                >
                  <Edit size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar ativo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="p-2 rounded-full hover:bg-background-tertiary text-text-secondary"
                  aria-label="Excluir ativo"
                >
                  <Trash2 size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Excluir ativo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
        <div>
          <div className="text-xs text-text-tertiary">QUANTIDADE</div>
          <div className="font-medium">{quantity}</div>
        </div>

        <div>
          <div className="text-xs text-text-tertiary">PREÇO ATUAL</div>
          <div className="font-medium">{formatCurrency(currentPrice)}</div>
        </div>

        <div>
          <div className="text-xs text-text-tertiary">VALOR TOTAL</div>
          <div className="font-medium">{formatCurrency(currentValue)}</div>
        </div>

        <div>
          <div className="text-xs text-text-tertiary">VARIAÇÃO HOJE</div>
          <div
            className={cn(
              "flex items-center font-medium",
              dailyChangeState >= 0 ? "text-state-success" : "text-state-error",
            )}
          >
            {dailyChangeState >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {Math.abs(dailyChangePercentageState).toFixed(2)}%
          </div>
        </div>

        <div>
          <div className="text-xs text-text-tertiary">ALOCAÇÃO ATUAL</div>
          <div className="font-medium">{currentPercentage.toFixed(2)}%</div>
        </div>

        <div>
          <div className="text-xs text-text-tertiary">META</div>
          <div className="font-medium">{targetPercentage.toFixed(2)}%</div>
        </div>
      </div>

      <div
        className={cn(
          "p-2 rounded-md text-xs",
          isAboveTarget ? "bg-state-warning/10 text-state-warning" : "bg-state-info/10 text-state-info",
        )}
      >
        {isAboveTarget
          ? `${targetDifference}% acima da meta (excesso de ${formatCurrency(excess)})`
          : `${targetDifference}% abaixo da meta (necessário ${formatCurrency(toBuy)})`}
      </div>
    </CardGlass>
  )
}
