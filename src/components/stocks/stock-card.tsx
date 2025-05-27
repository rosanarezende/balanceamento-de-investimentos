"use client"

import { useState, useEffect } from "react"
import { CardGlass } from "@/components/ui/card-glass"
import { BadgeStatus } from "@/components/ui/badge-status"
import { formatCurrency } from "@/lib/utils"
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchDailyChange } from "@/lib/api"

interface StockCardProps {
  stock: {
    id: string
    ticker: string
    name: string
    currentValue: number
    targetValue: number
    dailyChange: number
    status: "up" | "down" | "neutral"
  }
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function StockCard({ stock, onEdit, onDelete }: StockCardProps) {
  const [loading, setLoading] = useState(false)
  const [dailyChange, setDailyChange] = useState(stock.dailyChange)

  useEffect(() => {
    const fetchChange = async () => {
      setLoading(true)
      try {
        const change = await fetchDailyChange(stock.ticker)
        setDailyChange(change)
      } catch (error) {
        console.error("Failed to fetch daily change:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchChange()
  }, [stock.ticker])

  return (
    <CardGlass className="p-4 flex items-center justify-between">
      <div className="flex items-center">
        <BadgeStatus status={stock.status} />
        <div className="ml-4">
          <h3 className="text-lg font-medium">{stock.name}</h3>
          <p className="text-sm text-muted-foreground">{stock.ticker}</p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="mr-4 text-right">
          <p className="text-lg font-medium">{formatCurrency(stock.currentValue)}</p>
          <p className="text-sm text-muted-foreground">Meta: {formatCurrency(stock.targetValue)}</p>
        </div>
        <div className="flex items-center">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className={cn(
                      "flex items-center",
                      dailyChange >= 0 ? "text-green-500" : "text-red-500"
                    )}
                  >
                    {dailyChange >= 0 ? <TrendingUp /> : <TrendingDown />}
                    <span className="ml-1">{dailyChange.toFixed(2)}%</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Variação diária</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center ml-4">
          <button
            onClick={() => onEdit(stock.id)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit size={20} />
          </button>
          <button
            onClick={() => onDelete(stock.id)}
            className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </CardGlass>
  )
}
