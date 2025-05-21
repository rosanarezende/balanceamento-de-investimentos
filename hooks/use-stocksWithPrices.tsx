import { useEffect, useState } from "react"
import type { Stock } from "@/lib/schemas/stock"
import { useRouter } from "next/navigation"

interface StockWithPrice extends Stock {
  currentPrice: number
}

// Dados iniciais da carteira
const initialStocks: Stock[] = [
  { ticker: "RANI3", quantity: 26, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "TIMS3", quantity: 11, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "AZZA3", quantity: 4, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "PRIO3", quantity: 6, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "CXSE3", quantity: 14, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "ALUP11", quantity: 7, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "ABCB4", quantity: 10, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "NEOE3", quantity: 7, targetPercentage: 11.0, userRecommendation: "Comprar" },
  { ticker: "AGRO3", quantity: 9, targetPercentage: 11.0, userRecommendation: "Comprar" },
]

export function useStocksWithPrices(investmentParam: string | null) {
  const router = useRouter()
  const [stocks, setStocks] = useState<StockWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [investmentValue, setInvestmentValue] = useState<string | null>(null)

  useEffect(() => {
    if (!investmentParam) {
      router.push("/calculadora-balanceamento")
      return
    }

    setInvestmentValue(investmentParam)

    const fetchStockData = async () => {
      setLoading(true)
      setError(null)
      const stocksWithPrices: StockWithPrice[] = []

      for (const stock of initialStocks) {
        try {
          const res = await fetch(`/api/stock-price?ticker=${stock.ticker}`)
          const data = await res.json()
          stocksWithPrices.push({
            ...stock,
            currentPrice: data.price ?? 0,
          })
        } catch (err) {
          stocksWithPrices.push({
            ...stock,
            currentPrice: 0,
          })
          setError("Erro ao buscar preços de algumas ações.")
        }
      }

      setStocks(stocksWithPrices)
      setLoading(false)
    }

    fetchStockData()
  }, [initialStocks, investmentParam])

  return { loading, error, stocks, setStocks, investmentValue }
}
