"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getBtgRecommendation } from "@/lib/api"
import { RecommendationEditor } from "@/components/recommendation-editor"

interface StockCardProps {
  ticker: string
  quantity: number
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  toBuy: number
  excess: number
  currentPrice: number
  reserveValue?: number
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
  reserveValue = 0,
}: StockCardProps) {
  const [recommendation, setRecommendation] = useState<string>("COMPRAR") // Valor padrão
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true)
      try {
        const rec = await getBtgRecommendation(ticker)
        setRecommendation(rec)
      } catch (error) {
        console.error(`Erro ao buscar recomendação para ${ticker}:`, error)
        setRecommendation("COMPRAR") // Fallback para o valor padrão
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendation()
  }, [ticker])

  const handleRecommendationUpdate = (newRecommendation: string) => {
    setRecommendation(newRecommendation)
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
            {loading ? (
              <div className="text-xs text-gray-400">Verificando...</div>
            ) : (
              <div className="flex items-center">
                <div
                  className={`flex items-center text-xs px-2 py-1 rounded-full ${
                    recommendation === "COMPRAR"
                      ? "bg-green-100 text-green-600"
                      : recommendation === "AGUARDAR"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {recommendation === "COMPRAR" && <ArrowUp className="h-3 w-3 mr-1" />}
                  {recommendation === "AGUARDAR" && (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-1"
                    >
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M12 6V12L16 14"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {recommendation}
                </div>
                <RecommendationEditor
                  ticker={ticker}
                  currentRecommendation={recommendation}
                  onUpdate={handleRecommendationUpdate}
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          <div className="text-gray-500">VALOR ATUAL DOS ATIVOS</div>
          <div className="text-gray-500">ALOCAÇÃO ATUAL</div>
          <div className="font-bold text-blue-600">{formatCurrency(currentValue)}</div>
          <div className="font-bold">{currentPercentage.toFixed(2)}%</div>

          <div className="text-gray-500">VALOR EM RESERVA</div>
          <div className="text-gray-500">ALOCAÇÃO RECOMENDADA/META</div>
          <div className="font-bold">{formatCurrency(reserveValue)}</div>
          <div className="font-bold">{targetPercentage.toFixed(2)}%</div>

          <div className="text-gray-500">VALOR EM RESERVA</div>
          <div className="text-gray-500">PREÇO MÉDIO</div>
          <div className="font-bold">{reserveValue > 0 ? formatCurrency(reserveValue) : "R$ 0,00"}</div>
          <div className="font-bold">
            {toBuy > 0
              ? formatCurrency(toBuy)
              : reserveValue > 0
                ? formatCurrency(reserveValue)
                : formatCurrency(excess)}
          </div>
        </div>
      </div>
    </div>
  )
}
