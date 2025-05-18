"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { fetchStockPrice, getBtgRecommendation } from "@/lib/api"
import { RecommendationEditor } from "@/components/recommendation-editor"

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

interface StockAllocation {
  ticker: string
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  currentQuantity: number
  investmentAmount: number
  newQuantity: number
  currentPrice: number
  recommendation: string
}

export default function ResultadoCalculadora() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [allocations, setAllocations] = useState<StockAllocation[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [newTotalPortfolioValue, setNewTotalPortfolioValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)

  useEffect(() => {
    const calculateAllocations = async () => {
      setLoading(true)

      const investmentParam = searchParams.get("valor")
      if (!investmentParam) {
        router.push("/calculadora-balanceamento")
        return
      }

      const investmentValue = Number.parseFloat(investmentParam)
      setTotalInvestment(investmentValue)

      try {
        // Buscar preços e recomendações para todas as ações
        const stockData: Record<string, { price: number; recommendation: string }> = {}

        for (const stock of initialStocks) {
          const [price, recommendation] = await Promise.all([
            fetchStockPrice(stock.ticker),
            getBtgRecommendation(stock.ticker),
          ])

          stockData[stock.ticker] = { price, recommendation }
        }

        // Calcular o valor total atual da carteira
        const currentTotalValue = initialStocks.reduce((total, stock) => {
          return total + stock.quantity * stockData[stock.ticker].price
        }, 0)

        setTotalPortfolioValue(currentTotalValue)
        setNewTotalPortfolioValue(currentTotalValue + investmentValue)

        // Calcular alocações ideais
        const stocksWithDetails = initialStocks.map((stock) => {
          const currentPrice = stockData[stock.ticker].price
          const currentValue = stock.quantity * currentPrice
          const currentPercentage = (currentValue / currentTotalValue) * 100
          const targetValue = (stock.targetPercentage / 100) * (currentTotalValue + investmentValue)
          const idealInvestment = Math.max(0, targetValue - currentValue)

          return {
            ...stock,
            currentPrice,
            currentValue,
            currentPercentage,
            idealInvestment,
            recommendation: stockData[stock.ticker].recommendation,
          }
        })

        // Calcular a soma dos investimentos ideais
        const totalIdealInvestment = stocksWithDetails.reduce((sum, stock) => sum + stock.idealInvestment, 0)

        // Calcular as alocações finais
        const finalAllocations = stocksWithDetails.map((stock) => {
          let investmentAmount = 0

          if (totalIdealInvestment <= investmentValue) {
            // Caso 1: Podemos atender todas as necessidades ideais
            const remainingInvestment = investmentValue - totalIdealInvestment
            investmentAmount = stock.idealInvestment + (stock.targetPercentage / 100) * remainingInvestment
          } else if (totalIdealInvestment > 0) {
            // Caso 2: Distribuir proporcionalmente às necessidades
            investmentAmount = (stock.idealInvestment / totalIdealInvestment) * investmentValue
          } else {
            // Caso especial: Não há necessidades ideais, distribuir pelo percentual alvo
            investmentAmount = (stock.targetPercentage / 100) * investmentValue
          }

          // Arredondar para o número inteiro de ações
          const newShares = Math.floor(investmentAmount / stock.currentPrice)
          const adjustedInvestment = newShares * stock.currentPrice

          return {
            ticker: stock.ticker,
            currentValue: stock.currentValue,
            currentPercentage: stock.currentPercentage,
            targetPercentage: stock.targetPercentage,
            currentQuantity: stock.quantity,
            investmentAmount: adjustedInvestment,
            newQuantity: stock.quantity + newShares,
            currentPrice: stock.currentPrice,
            recommendation: stock.recommendation,
          }
        })

        setAllocations(finalAllocations)
      } catch (error) {
        console.error("Erro ao calcular alocações:", error)
      } finally {
        setLoading(false)
      }
    }

    calculateAllocations()
  }, [searchParams, router])

  const handleBack = () => {
    router.back()
  }

  const handleAgreeTerms = () => {
    setShowTerms(false)
    // Aqui seria implementada a lógica para salvar a simulação
    router.push("/")
  }

  const handleRecommendationUpdate = (ticker: string, newRecommendation: string) => {
    setAllocations(
      allocations.map((allocation) =>
        allocation.ticker === ticker ? { ...allocation, recommendation: newRecommendation } : allocation,
      ),
    )
  }

  return (
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
          <h2 className="text-xl font-bold mb-2">3º Passo</h2>

          <p className="text-sm text-gray-600 mb-4">
            Baseado nos ativos da carteira, vamos exibir as ações que a inteligência artificial recomenda de acordo com
            o valor informado. Ressaltamos que a recomendação é apenas uma sugestão.
          </p>

          <div className="bg-gray-50 p-3 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Entenda Nossas Orientações</h3>
            <p className="text-xs text-gray-600 mb-2">
              A recomendação "AGUARDAR" é motivada pelo fato de o preço atual estar acima do preço médio. Portanto,
              sugerimos que o preço retorne ao patamar do preço de mercado.
            </p>
            <p className="text-xs text-blue-600 font-medium mb-2">ORIENTAÇÃO RESERVA</p>

            <p className="text-xs text-gray-600 mb-2">
              A Recomendação de "COMPRAR" é motivada pelo fato de o preço atual estar abaixo do preço médio ou do
              patamar considerado ideal para investimento.
            </p>
            <p className="text-xs text-blue-600 font-medium">ORIENTAÇÃO COMPRA</p>
          </div>

          {loading ? (
            <div className="py-8 text-center">
              <p className="text-gray-500">Calculando recomendações de investimento...</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {allocations.map((allocation) => (
                <div key={allocation.ticker} className="bg-white border rounded-lg overflow-hidden">
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-gray-200 rounded-full p-1 mr-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 16V12"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 8H12.01"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">CÓDIGO</div>
                          <div className="font-bold">{allocation.ticker}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`text-xs font-medium px-2 py-1 rounded-full mr-1 ${
                            allocation.recommendation === "COMPRAR"
                              ? "bg-green-100 text-green-600"
                              : allocation.recommendation === "AGUARDAR"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600"
                          }`}
                        >
                          {allocation.recommendation}
                        </div>
                        <RecommendationEditor
                          ticker={allocation.ticker}
                          currentRecommendation={allocation.recommendation}
                          onUpdate={(rec) => handleRecommendationUpdate(allocation.ticker, rec)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <div className="text-gray-500">VALOR ATUAL DOS ATIVOS</div>
                      <div className="text-gray-500">ALOCAÇÃO ATUAL</div>
                      <div className="font-bold">{formatCurrency(allocation.currentValue)}</div>
                      <div className="font-bold">{allocation.currentPercentage.toFixed(2)}%</div>

                      <div className="text-gray-500">VALOR EM RESERVA</div>
                      <div className="text-gray-500">ALOCAÇÃO RECOMENDADA/META</div>
                      <div className="font-bold">
                        {allocation.ticker === "NEOE3" ? formatCurrency(23.21) : "R$ 0,00"}
                      </div>
                      <div className="font-bold">{allocation.targetPercentage.toFixed(2)}%</div>

                      <div className="text-gray-500">VALOR A INVESTIR</div>
                      <div className="text-gray-500">QTD NOVA DO ATIVO EM CARTEIRA</div>
                      <div className="font-bold text-green-600">{formatCurrency(allocation.investmentAmount)}</div>
                      <div className="font-bold">{allocation.newQuantity}</div>

                      <div className="text-gray-500">PREÇO DO PAPEL NO MOMENTO DA CONSULTA</div>
                      <div className="text-gray-500">PREÇO MÉDIO</div>
                      <div className="font-bold">{formatCurrency(allocation.currentPrice)}</div>
                      <div className="font-bold">
                        {allocation.ticker === "NEOE3" ? formatCurrency(23.21) : formatCurrency(0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="bg-red-50 p-4 rounded-lg mb-6">
            <h3 className="text-red-600 font-bold text-center mb-2">ATENÇÃO!</h3>
            <p className="text-xs text-gray-700 mb-2">
              Para investir, é necessário realizar a compra de ações diretamente na sua corretora/ banco.
            </p>
            <p className="text-xs text-gray-700 mb-2">
              Ao clicar em "Confirmar Aporte", você reconhece que isto não é uma ordem de investimento e sim uma
              sugestão pessoal. Este aplicativo não realiza aplicações no CPF dos usuários.
            </p>
            <p className="text-xs text-gray-700 mb-2">
              1. Algumas corretoras/bancos de investimentos cobram taxas de corretagem para compra e venda de ações.
            </p>
            <p className="text-xs text-gray-700 mb-2">
              2. Antes de investir, transfira o dinheiro para a sua corretora/ banco.
            </p>
            <p className="text-xs text-gray-700 mb-2">
              3. O prazo de liquidação na Bolsa de Valores, que é de D+2, significa que o dinheiro da compra ou venda de
              ações é debitado ou creditado 2 dias úteis após a negociação.
            </p>
            <p className="text-xs text-gray-700 mb-2">
              4. Os preços dos ativos sofrem um atraso de até 15 minutos em relação ao mercado. Portanto, podem existir
              diferenças de valores entre o preço exibido e o preço real de mercado.
            </p>
          </div>

          <button
            className="w-full bg-red-600 text-white py-3 rounded-lg font-medium"
            onClick={() => setShowTerms(true)}
          >
            CONFIRME O TERMO ACIMA
          </button>
        </div>

        {showTerms && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="font-bold mb-4">Confirmar Simulação</h3>
              <p className="text-sm mb-6">
                Você confirma que entende que esta é apenas uma simulação e que a execução das ordens deve ser feita
                diretamente na sua corretora?
              </p>
              <div className="flex space-x-4">
                <button className="flex-1 bg-gray-200 py-2 rounded-lg" onClick={() => setShowTerms(false)}>
                  Cancelar
                </button>
                <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg" onClick={handleAgreeTerms}>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
