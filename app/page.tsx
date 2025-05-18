"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { fetchStockPrice } from "@/lib/api"
import { StockCard } from "@/components/stock-card"

// Tipo para representar uma ação na carteira
interface Stock {
  ticker: string
  quantity: number
  targetPercentage: number
}

// Dados iniciais da carteira
const initialStocks: Stock[] = [
  { ticker: "RANI3", quantity: 26, targetPercentage: 11.0 },
  { ticker: "TIMS3", quantity: 11, targetPercentage: 11.0 },
  { ticker: "AZZA3", quantity: 4, targetPercentage: 11.0 },
  { ticker: "PRIO3", quantity: 6, targetPercentage: 11.0 },
  { ticker: "CXSE3", quantity: 14, targetPercentage: 11.0 },
  { ticker: "ALUP11", quantity: 7, targetPercentage: 11.0 },
  { ticker: "ABCB4", quantity: 10, targetPercentage: 11.0 },
  { ticker: "NEOE3", quantity: 7, targetPercentage: 11.0 },
  { ticker: "AGRO3", quantity: 9, targetPercentage: 11.0 },
]

interface StockWithDetails extends Stock {
  currentPrice: number
  currentValue: number
  currentPercentage: number
  toBuy: number
  excess: number
  reserveValue: number
}

export default function Home() {
  const [stocks] = useState<Stock[]>(initialStocks)
  const [stocksWithDetails, setStocksWithDetails] = useState<StockWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true)
      try {
        // Buscar preços atuais para todas as ações
        const stockPrices: Record<string, number> = {}
        for (const stock of stocks) {
          stockPrices[stock.ticker] = await fetchStockPrice(stock.ticker)
        }

        // Calcular o valor total da carteira
        const totalValue = stocks.reduce((total, stock) => {
          return total + stock.quantity * stockPrices[stock.ticker]
        }, 0)

        setTotalPortfolioValue(totalValue)

        // Calcular informações detalhadas para cada ação
        const detailedStocks = stocks.map((stock) => {
          const currentPrice = stockPrices[stock.ticker]
          const currentValue = stock.quantity * currentPrice
          const currentPercentage = (currentValue / totalValue) * 100
          const targetValue = (stock.targetPercentage / 100) * totalValue
          const toBuy = Math.max(0, targetValue - currentValue)
          const excess = Math.max(0, currentValue - targetValue)
          const reserveValue = stock.ticker === "NEOE3" ? 23.21 : 0 // Simulação de valor em reserva

          return {
            ...stock,
            currentPrice,
            currentValue,
            currentPercentage,
            toBuy,
            excess,
            reserveValue,
          }
        })

        setStocksWithDetails(detailedStocks)
      } catch (error) {
        console.error("Erro ao buscar dados das ações:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStockData()
  }, [stocks])

  const handleCalculatorClick = () => {
    router.push("/calculadora-balanceamento")
  }

  const handleEditClick = () => {
    router.push("/editar-ativos")
  }

  const handleHistoryClick = () => {
    router.push("/historico")
  }

  const handleResetClick = () => {
    if (confirm("Tem certeza que deseja resetar todos os ativos? Esta ação não pode ser desfeita.")) {
      // Implementar lógica de reset
    }
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-md mx-auto bg-white pb-4">
        <div className="flex items-center p-4 border-b">
          <button onClick={() => router.back()} className="mr-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h1 className="font-medium">Minhas Ações</h1>
            <p className="text-xs text-gray-500">Informações detalhadas sobre a carteira</p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ativos</h2>
            <button className="text-blue-600">
              <Info size={20} />
            </button>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Carregando dados das ações...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stocksWithDetails.map((stock) => (
                <StockCard
                  key={stock.ticker}
                  ticker={stock.ticker}
                  quantity={stock.quantity}
                  currentValue={stock.currentValue}
                  currentPercentage={stock.currentPercentage}
                  targetPercentage={stock.targetPercentage}
                  toBuy={stock.toBuy}
                  excess={stock.excess}
                  currentPrice={stock.currentPrice}
                  reserveValue={stock.reserveValue}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 space-y-3 mt-4">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCalculatorClick}>
            CALCULADORA DE BALANCEAMENTO
          </Button>

          <Button
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={handleEditClick}
          >
            EDITAR ATIVOS MANUALMENTE
          </Button>

          <Button
            variant="outline"
            className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
            onClick={handleHistoryClick}
          >
            HISTÓRICO DE SIMULAÇÕES
          </Button>

          <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700" onClick={handleResetClick}>
            RESETAR TODOS OS ATIVOS
          </Button>
        </div>
      </div>
    </div>
  )
}
