"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { usePortfolio } from "@/hooks/use-portfolio"
import { saveSimulation } from "@/lib/firestore"
import AuthGuard from "@/components/auth-guard"
import Loading from "@/components/ui/loading"

interface StockAllocation {
  ticker: string
  currentValue: number
  currentPercentage: number
  targetPercentage: number
  currentQuantity: number
  investmentAmount: number
  newQuantity: number
  quantityToAcquire: number
  currentPrice: number
  userRecommendation: string
  isEligibleForInvestment: boolean
}

export default function ResultadoCalculadora() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { stocksWithDetails } = usePortfolio()
  const [allocations, setAllocations] = useState<StockAllocation[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [newTotalPortfolioValue, setNewTotalPortfolioValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingSimulation, setSavingSimulation] = useState(false)

  useEffect(() => {
    const calculateAllocations = async () => {
      setLoading(true)
      setError(null)

      const investmentParam = searchParams.get("valor")
      if (!investmentParam) {
        router.push("/calculadora-balanceamento")
        return
      }

      const investmentValue = Number.parseFloat(investmentParam)
      setTotalInvestment(investmentValue)

      try {
        // Calcular o valor total atual da carteira
        const currentTotalValue = stocksWithDetails.reduce((total, stock) => {
          return total + stock.currentValue
        }, 0)

        setTotalPortfolioValue(currentTotalValue)
        setNewTotalPortfolioValue(currentTotalValue + investmentValue)

        // Filtrar ações elegíveis para investimento (recomendação "Comprar")
        const eligibleStocks = stocksWithDetails.map((stock) => ({
          ...stock,
          isEligibleForInvestment: stock.userRecommendation === "Comprar",
        }))

        // Calcular investimentos ideais apenas para ações elegíveis e abaixo do peso
        const stocksWithIdealInvestment = eligibleStocks.map((stock) => {
          const targetValue = (stock.targetPercentage / 100) * (currentTotalValue + investmentValue)
          const idealInvestment = stock.isEligibleForInvestment ? Math.max(0, targetValue - stock.currentValue) : 0

          return {
            ...stock,
            idealInvestment,
          }
        })

        // Calcular a soma dos investimentos ideais para ações elegíveis
        const totalIdealInvestment = stocksWithIdealInvestment.reduce((sum, stock) => sum + stock.idealInvestment, 0)

        // Calcular as alocações finais
        const finalAllocations = stocksWithIdealInvestment.map((stock) => {
          let investmentAmount = 0

          if (stock.isEligibleForInvestment) {
            if (totalIdealInvestment <= investmentValue) {
              // Caso 1: Podemos atender todas as necessidades ideais
              const remainingInvestment = investmentValue - totalIdealInvestment

              // Distribuir o restante proporcionalmente entre ações elegíveis
              const totalEligibleTargetPercentage = eligibleStocks
                .filter((s) => s.isEligibleForInvestment)
                .reduce((sum, s) => sum + s.targetPercentage, 0)

              const proportionalShare =
                totalEligibleTargetPercentage > 0 ? stock.targetPercentage / totalEligibleTargetPercentage : 0

              investmentAmount = stock.idealInvestment + proportionalShare * remainingInvestment
            } else if (totalIdealInvestment > 0) {
              // Caso 2: Distribuir proporcionalmente às necessidades
              investmentAmount = (stock.idealInvestment / totalIdealInvestment) * investmentValue
            }
          }

          // Arredondar para o número inteiro de ações
          const quantityToAcquire = Math.floor(investmentAmount / stock.currentPrice)
          const adjustedInvestment = quantityToAcquire * stock.currentPrice

          return {
            ticker: stock.ticker,
            currentValue: stock.currentValue,
            currentPercentage: stock.currentPercentage,
            targetPercentage: stock.targetPercentage,
            currentQuantity: stock.quantity,
            investmentAmount: adjustedInvestment,
            newQuantity: stock.quantity + quantityToAcquire,
            quantityToAcquire,
            currentPrice: stock.currentPrice,
            userRecommendation: stock.userRecommendation,
            isEligibleForInvestment: stock.isEligibleForInvestment,
          }
        })

        setAllocations(finalAllocations)
      } catch (error) {
        console.error("Erro ao calcular alocações:", error)
        setError("Não foi possível calcular as alocações. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    if (stocksWithDetails.length > 0) {
      calculateAllocations()
    }
  }, [stocksWithDetails, searchParams, router])

  const handleBack = () => {
    router.back()
  }

  const handleAgreeTerms = async () => {
    if (!user) return

    setShowTerms(false)
    setSavingSimulation(true)

    try {
      // Salvar a simulação no Firestore
      await saveSimulation(user.uid, {
        date: new Date(),
        investmentAmount: totalInvestment,
        portfolioValueBefore: totalPortfolioValue,
        portfolioValueAfter: newTotalPortfolioValue,
        allocations: allocations.map((allocation) => ({
          ticker: allocation.ticker,
          currentValue: allocation.currentValue,
          currentPercentage: allocation.currentPercentage,
          targetPercentage: allocation.targetPercentage,
          currentQuantity: allocation.currentQuantity,
          investmentAmount: allocation.investmentAmount,
          newQuantity: allocation.newQuantity,
          quantityToAcquire: allocation.quantityToAcquire,
          currentPrice: allocation.currentPrice,
          userRecommendation: allocation.userRecommendation,
        })),
      })

      // Redirecionar para a página de histórico
      router.push("/historico")
    } catch (error) {
      console.error("Erro ao salvar simulação:", error)
      alert("Não foi possível salvar a simulação. Por favor, tente novamente.")
    } finally {
      setSavingSimulation(false)
    }
  }

  // Verificar se há ações elegíveis para investimento
  const hasEligibleStocks = allocations.some(
    (allocation) => allocation.isEligibleForInvestment && allocation.investmentAmount > 0,
  )

  return (
    <AuthGuard>
      <div className="bg-background min-h-screen">
        <div className="max-w-md mx-auto bg-card min-h-screen">
          <div className="p-4 flex items-center border-b border-border">
            <button onClick={handleBack} className="mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div>
              <h1 className="font-medium text-card-foreground">Calculadora De Balanceamento</h1>
              <p className="text-xs text-muted-foreground">Calcule como reorganizar seus investimentos</p>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-xl font-bold mb-2 text-card-foreground">3º Passo</h2>

            <p className="text-sm text-muted-foreground mb-4">
              Baseado nos ativos da carteira, vamos exibir as ações que recomendamos de acordo com o valor informado e
              suas preferências pessoais.
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-lg mb-4">
                <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <Loading text="Calculando recomendações de investimento..." />
            ) : !hasEligibleStocks ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-center mb-2 text-card-foreground">Nenhum ativo elegível para aporte</h3>
                <p className="text-sm text-muted-foreground">
                  Não há ativos marcados como "Comprar" que estejam abaixo do peso na sua carteira. Considere alterar
                  suas recomendações ou ajustar os percentuais META.
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-6">
                {allocations
                  .filter((allocation) => allocation.investmentAmount > 0)
                  .map((allocation) => (
                    <div
                      key={allocation.ticker}
                      className={`bg-card border border-border rounded-lg overflow-hidden ${
                        !allocation.isEligibleForInvestment ? "opacity-50" : ""
                      }`}
                    >
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <div className="bg-muted rounded-full p-1 mr-2">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 16V12"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 8H12.01"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">CÓDIGO</div>
                              <div className="font-bold text-card-foreground">{allocation.ticker}</div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div
                              className={`text-xs font-medium px-2 py-1 rounded-full mr-1 ${
                                allocation.userRecommendation === "Comprar"
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : allocation.userRecommendation === "Aguardar"
                                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              }`}
                            >
                              {allocation.userRecommendation}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                          <div className="text-muted-foreground">VALOR ATUAL DOS ATIVOS</div>
                          <div className="text-muted-foreground">ALOCAÇÃO ATUAL</div>
                          <div className="font-bold text-card-foreground">
                            {formatCurrency(allocation.currentValue)}
                          </div>
                          <div className="font-bold text-card-foreground">
                            {allocation.currentPercentage.toFixed(2)}%
                          </div>

                          <div className="text-muted-foreground">VALOR A INVESTIR</div>
                          <div className="text-muted-foreground">ALOCAÇÃO RECOMENDADA/META</div>
                          <div className="font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(allocation.investmentAmount)}
                          </div>
                          <div className="font-bold text-card-foreground">
                            {allocation.targetPercentage.toFixed(2)}%
                          </div>

                          <div className="text-muted-foreground">QTD ATUAL</div>
                          <div className="text-muted-foreground">QTD A ADQUIRIR</div>
                          <div className="font-bold text-card-foreground">{allocation.currentQuantity}</div>
                          <div className="font-bold text-card-foreground">{allocation.quantityToAcquire}</div>

                          <div className="text-muted-foreground">PREÇO DO PAPEL NO MOMENTO DA CONSULTA</div>
                          <div className="text-muted-foreground"></div>
                          <div className="font-bold text-card-foreground">
                            {formatCurrency(allocation.currentPrice)}
                          </div>
                          <div className="font-bold text-card-foreground"></div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg mb-6">
              <h3 className="text-red-600 dark:text-red-400 font-bold text-center mb-2">ATENÇÃO!</h3>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                Para investir, é necessário realizar a compra de ações diretamente na sua corretora/ banco.
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                Ao clicar em "Confirmar Aporte", você reconhece que isto não é uma ordem de investimento e sim uma
                sugestão pessoal. Este aplicativo não realiza aplicações no CPF dos usuários.
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                1. Algumas corretoras/bancos de investimentos cobram taxas de corretagem para compra e venda de ações.
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                2. Antes de investir, transfira o dinheiro para a sua corretora/ banco.
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                3. O prazo de liquidação na Bolsa de Valores, que é de D+2, significa que o dinheiro da compra ou venda
                de ações é debitado ou creditado 2 dias úteis após a negociação.
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">
                4. Os preços dos ativos sofrem um atraso de até 15 minutos em relação ao mercado. Portanto, podem
                existir diferenças de valores entre o preço exibido e o preço real de mercado.
              </p>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800 dark:text-white py-3 rounded-lg font-medium"
              onClick={() => setShowTerms(true)}
              disabled={savingSimulation}
            >
              {savingSimulation ? "PROCESSANDO..." : "CONFIRME O TERMO ACIMA"}
            </Button>
          </div>

          {showTerms && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-card rounded-lg p-6 max-w-sm w-full">
                <h3 className="font-bold mb-4 text-card-foreground">Confirmar Simulação</h3>
                <p className="text-sm mb-6 text-muted-foreground">
                  Você confirma que entende que esta é apenas uma simulação e que a execução das ordens deve ser feita
                  diretamente na sua corretora?
                </p>
                <div className="flex space-x-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowTerms(false)}
                    disabled={savingSimulation}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-primary text-primary-foreground"
                    onClick={handleAgreeTerms}
                    disabled={savingSimulation}
                  >
                    {savingSimulation ? "Salvando..." : "Confirmar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}
