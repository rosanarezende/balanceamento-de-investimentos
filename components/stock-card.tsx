"use client"
import { formatCurrency } from "@/lib/utils"
import { UserRecommendationSelector } from "@/components/user-recommendation-selector"

interface StockCardProps {
  ticker: string
  quantity: number
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  toBuy: number
  excess: number
  currentPrice: number
  userRecommendation: string
  onUpdateRecommendation: (ticker: string, recommendation: string) => void
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
  userRecommendation,
  onUpdateRecommendation,
}: StockCardProps) {
  const handleRecommendationUpdate = (newRecommendation: string) => {
    onUpdateRecommendation(ticker, newRecommendation)
  }

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden">
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="text-xs text-gray-500">CÓDIGO</div>
            <div className="font-bold">{ticker}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">QTD</div>
            <div className="font-bold">{quantity}</div>
          </div>
          <div className="flex flex-col items-center">
            <UserRecommendationSelector
              ticker={ticker}
              currentRecommendation={userRecommendation}
              onUpdate={handleRecommendationUpdate}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="text-gray-500">VALOR ATUAL DOS ATIVOS</div>
          <div className="text-gray-500">ALOCAÇÃO ATUAL</div>
          <div className="font-bold text-blue-600">
            {currentPrice > 0 ? formatCurrency(currentValue) : "Indisponível"}
          </div>
          <div className="font-bold">{currentPercentage.toFixed(2)}%</div>

          <div className="text-gray-500">META</div>
          <div className="text-gray-500">PREÇO ATUAL</div>
          <div className="font-bold">{targetPercentage.toFixed(2)}%</div>
          <div className="font-bold">{currentPrice > 0 ? formatCurrency(currentPrice) : "Indisponível"}</div>

          <div className="text-gray-500">{toBuy > 0 ? "A COMPRAR" : "EXCESSO"}</div>
          <div className="text-gray-500">RECOMENDAÇÃO</div>
          <div className="font-bold">
            {currentPrice > 0 ? (toBuy > 0 ? formatCurrency(toBuy) : formatCurrency(excess)) : "Indisponível"}
          </div>
          <div className="font-bold">{userRecommendation}</div>
        </div>
      </div>
    </div>
  )
}
