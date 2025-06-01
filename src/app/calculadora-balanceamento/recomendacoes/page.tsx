"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { fetchStockPrice, saveManualRecommendation, RECOMMENDATION_TYPES } from "@/services/api/stockPrice"
import { getCachedStockPrice, setCachedStockPrice } from "@/utils/client/cache"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import AuthGuard from "@/components/auth-guard"
import { Stock } from "@/lib/schemas/stock"

// Interface para ações com preço
interface StockWithPrice extends Stock {
  currentPrice: number
  recommendation: string
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

export default function RecomendacoesBTG() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [stocks, setStocks] = useState<StockWithPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [investmentValue, setInvestmentValue] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true)
      setError(null)

      const investmentParam = searchParams.get("valor")

      if (!investmentParam) {
        router.push("/calculadora-balanceamento")
        return
      }

      const investmentValueNumber = Number(investmentParam)
      if (isNaN(investmentValueNumber) || investmentValueNumber <= 0) {
        setError("Por favor, insira um valor de investimento válido.")
        setLoading(false)
        return
      }

      setInvestmentValue(investmentParam)

      try {
        // Buscar preços para todas as ações
        const stocksWithPrices: StockWithPrice[] = []

        for (const stock of initialStocks) {
          try {
            let currentPrice = getCachedStockPrice(stock.ticker)
            if (currentPrice === null) {
              currentPrice = await fetchStockPrice(stock.ticker)
              setCachedStockPrice(stock.ticker, currentPrice)
            }
            stocksWithPrices.push({
              ...stock,
              currentPrice,
              recommendation: "Comprar", // Valor padrão
            })
          } catch (err) {
            console.error(`Erro ao processar ação ${stock.ticker}:`, err)
            // Continuar com as outras ações mesmo se uma falhar
            stocksWithPrices.push({
              ...stock,
              currentPrice: 0, // Valor temporário
              recommendation: "Comprar",
            })
          }
        }

        setStocks(stocksWithPrices)
      } catch (error) {
        console.error("Erro ao buscar dados das ações:", error)
        setError("Não foi possível carregar os dados das ações. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchStockData().catch((err) => {
      console.error("Erro ao buscar dados das ações:", err)
      setError("Não foi possível carregar os dados das ações. Por favor, tente novamente.")
      setLoading(false)
    })
  }, [searchParams, router])

  const handleBack = () => {
    router.back()
  }

  const handleRecommendationChange = (ticker: string, recommendation: string) => {
    try {
      setStocks(stocks.map((stock) => (stock.ticker === ticker ? { ...stock, recommendation } : stock)))
    } catch (err) {
      console.error(`Erro ao alterar recomendação para ${ticker}:`, err)
      setError("Não foi possível alterar a recomendação. Por favor, tente novamente.")
    }
  }

  const handleSkip = () => {
    // Navegar para o resultado sem salvar recomendações (usará os valores padrão)
    router.push(`/calculadora-balanceamento/resultado?valor=${investmentValue}`)
  }

  const handleContinue = () => {
    try {
      // Salvar todas as recomendações
      stocks.forEach((stock) => {
        saveManualRecommendation(stock.ticker, stock.recommendation)
      })

      // Navegar para o resultado
      router.push(`/calculadora-balanceamento/resultado?valor=${investmentValue}`)
    } catch (err) {
      console.error("Erro ao salvar recomendações:", err)
      setError("Não foi possível salvar as recomendações. Por favor, tente novamente.")
    }
  }

  const handleRetry = () => {
    // Tentar buscar os dados novamente
    setStocks([])
    setLoading(true)
    setError(null)

    // Recarregar a página
    window.location.reload()
  }

  return (
    <AuthGuard>
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="p-4 flex items-center border-b">
            <button onClick={handleBack} className="mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 19L5 12L12 5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1 className="font-medium">Calculadora De Balanceamento</h1>
              <p className="text-xs text-gray-500">Calcule como reorganizar seus investimentos</p>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">Recomendações BTG (Opcional)</h2>

            <p className="text-sm text-gray-600 mb-4">
              Informe as recomendações do BTG Pactual para cada ativo, se disponíveis. Você pode pular esta etapa se não
              tiver essas informações.
            </p>

            {loading ? (
              <div className="py-8 text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-500 mt-4">Carregando dados das ações...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <div className="flex justify-center space-x-4">
                  <Button variant="outline" onClick={handleRetry}>
                    Tentar Novamente
                  </Button>
                  <Button onClick={handleSkip}>Continuar Mesmo Assim</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {stocks.map((stock) => (
                  <Card key={stock.ticker} className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="font-bold">{stock.ticker}</h3>
                        <p className="text-xs text-gray-500">
                          Preço atual:{" "}
                          {stock.currentPrice > 0
                            ? stock.currentPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "Preço indisponível"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Recomendação BTG:</p>
                      <RadioGroup
                        value={stock.recommendation}
                        onValueChange={(value) => handleRecommendationChange(stock.ticker, value)}
                        className="flex space-x-4"
                      >
                        {RECOMMENDATION_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-1">
                            <RadioGroupItem value={type} id={`${stock.ticker}-${type}`} />
                            <Label
                              htmlFor={`${stock.ticker}-${type}`}
                              className={`text-xs font-normal ${
                                type === "Comprar"
                                  ? "text-green-600"
                                  : type === "Aguardar"
                                    ? "text-yellow-600"
                                    : "text-red-600"
                              }`}
                            >
                              {type}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex space-x-4">
              <Button variant="outline" className="flex-1 border-blue-600 text-blue-600" onClick={handleSkip}>
                Pular
              </Button>
              <Button
                className="flex-1 bg-blue-600"
                onClick={handleContinue}
                disabled={loading || (stocks.length === 0 && !error)}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
