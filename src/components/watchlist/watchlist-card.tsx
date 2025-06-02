"use client"

import { CardGlass } from "@/components/ui/card-glass"
import { BadgeStatus } from "@/components/ui/badge-status"
import { formatCurrency } from "@/core/utils"
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/core/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WatchlistCardProps {
  ticker: string
  currentPrice: number
  dailyChange: number
  dailyChangePercentage: number
  targetPrice: number | null
  notes: string
  onEdit: () => void
  onDelete: () => void
}

export function WatchlistCard({
  ticker,
  currentPrice,
  dailyChange,
  dailyChangePercentage,
  targetPrice,
  notes,
  onEdit,
  onDelete,
}: WatchlistCardProps) {
  // Verificar se o preço atual está próximo do preço alvo (±5%)
  const isNearTarget = targetPrice && Math.abs(currentPrice - targetPrice) / targetPrice <= 0.05

  // Verificar se o preço atual atingiu ou ultrapassou o preço alvo
  const hasReachedTarget = targetPrice && currentPrice >= targetPrice

  return (
    <CardGlass
      className={cn(
        "relative transition-all duration-300",
        isNearTarget && "border-l-4 border-l-accent-quaternary",
        hasReachedTarget && "border-l-4 border-l-accent-secondary animate-pulse-glow",
      )}
      hoverEffect
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="mr-3">
            <div className="text-xs text-text-tertiary mb-1">CÓDIGO</div>
            <div className="text-lg font-bold">{ticker}</div>
          </div>

          {isNearTarget && <BadgeStatus status="warning" label="Próximo do Alvo" />}

          {hasReachedTarget && <BadgeStatus status="success" label="Alvo Atingido" />}
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
          <div className="text-xs text-text-tertiary">PREÇO ATUAL</div>
          <div className="font-medium">{formatCurrency(currentPrice)}</div>
        </div>

        <div>
          <div className="text-xs text-text-tertiary">VARIAÇÃO HOJE</div>
          <div
            className={cn(
              "flex items-center font-medium",
              dailyChange >= 0 ? "text-state-success" : "text-state-error",
            )}
          >
            {dailyChange >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {Math.abs(dailyChangePercentage).toFixed(2)}%
          </div>
        </div>

        {targetPrice && (
          <>
            <div>
              <div className="text-xs text-text-tertiary">PREÇO ALVO</div>
              <div className="font-medium">{formatCurrency(targetPrice)}</div>
            </div>

            <div>
              <div className="text-xs text-text-tertiary">DISTÂNCIA DO ALVO</div>
              <div
                className={cn("font-medium", currentPrice >= targetPrice ? "text-state-success" : "text-text-primary")}
              >
                {currentPrice >= targetPrice
                  ? `+${((currentPrice / targetPrice - 1) * 100).toFixed(2)}%`
                  : `-${((targetPrice / currentPrice - 1) * 100).toFixed(2)}%`}
              </div>
            </div>
          </>
        )}
      </div>

      {notes && (
        <div className="p-2 rounded-md text-xs bg-background-tertiary text-text-secondary">
          <p className="font-medium mb-1">Notas:</p>
          <p>{notes}</p>
        </div>
      )}

      {isNearTarget && (
        <div className="absolute top-2 right-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full animate-ping",
              hasReachedTarget ? "bg-state-success" : "bg-state-warning",
            )}
          ></div>
        </div>
      )}
    </CardGlass>
  )
}
