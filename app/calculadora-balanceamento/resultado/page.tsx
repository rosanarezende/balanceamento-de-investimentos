"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Info, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { usePortfolio } from "@/hooks/use-portfolio"
import { saveSimulation } from "@/lib/firestore"
import AuthGuard from "@/components/auth-guard"
import { LoadingState } from "@/components/ui/loading-state"

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
  const { stocksWithDetails, loading: portfolioLoading } = usePortfolio()
  const [allocations, setAllocations] = useState<StockAllocation[]>([])
  const [totalInvestment, setTotalInvestment] = useState(0)
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0)
  const [newTotalPortfolioValue, setNewTotalPortfolioValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savingSimulation, setSavingSimulation] = useState(false)
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

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

        // Calcular investimentos ideais para todas as ações
        const stocksWithIdealInvestment = eligibleStocks.map((stock) => {
          // Valor alvo para esta ação na nova carteira
          const targetValue = (stock.targetPercentage / 100) * (currentTotalValue + investmentValue)

          // Investimento ideal para levar a ação à sua meta (se estiver abaixo do peso)
          const idealInvestment = stock.isEligibleForInvestment ? Math.max(0, targetValue - stock.currentValue) : 0

          return {
            ...stock,
            idealInvestment,
            targetValue,
          }
        })

        // Calcular a soma dos investimentos ideais para ações elegíveis
        const totalIdealInvestment = stocksWithIdealInvestment.reduce(
          (sum, stock) => sum + (stock.isEligibleForInvestment ? stock.idealInvestment : 0),
          0,
        )

        // Calcular as alocações finais
        const finalAllocations = stocksWithIdealInvestment.map((stock) => {
          let investmentAmount = 0

          if (stock.isEligibleForInvestment) {
            if (totalIdealInvestment <= investmentValue) {
              // Caso 1: Podemos atender todas as necessidades ideais
              // Primeiro, alocar o necessário para atingir a meta
              investmentAmount = stock.idealInvestment

              // Calcular o investimento restante após atender todas as necessidades
              const remainingInvestment = investmentValue - totalIdealInvestment

              if (remainingInvestment > 0) {
                // Distribuir o restante proporcionalmente entre todas as ações elegíveis
                // com base em seus percentuais alvo
                const totalEligibleTargetPercentage = eligibleStocks
                  .filter((s) => s.isEligibleForInvestment)
                  .reduce((sum, s) => sum + s.targetPercentage, 0)

                if (totalEligibleTargetPercentage > 0) {
                  const proportionalShare = stock.targetPercentage / totalEligibleTargetPercentage
                  investmentAmount += proportionalShare * remainingInvestment
                }
              }
            } else if (totalIdealInvestment > 0) {
              // Caso 2: Não podemos atender todas as necessidades
              // Distribuir proporcionalmente com base nas necessidades
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

        // Verificar se há algum valor não alocado devido ao arredondamento
        const totalAllocated = finalAllocations.reduce((sum, allocation) => sum + allocation.investmentAmount, 0)
        const unallocatedAmount = investmentValue - totalAllocated

        // Se houver valor não alocado significativo, tentar alocar para a ação com maior diferença para a meta
        if (unallocatedAmount > 0) {
          // Encontrar a ação elegível com maior diferença para a meta
          const eligibleAllocations = finalAllocations.filter((a) => a.isEligibleForInvestment)
          if (eligibleAllocations.length > 0) {
            // Ordenar por diferença entre percentual atual e meta (decrescente)
            eligibleAllocations.sort((a, b) => {
              const diffA = a.targetPercentage - a.currentPercentage
              const diffB = b.targetPercentage - b.currentPercentage
              return diffB - diffA
            })

            // Tentar alocar o valor restante para a primeira ação elegível
            const targetAllocation = eligibleAllocations[0]
            const index = finalAllocations.findIndex((a) => a.ticker === targetAllocation.ticker)

            if (index >= 0 && unallocatedAmount >= finalAllocations[index].currentPrice) {
              // Calcular quantas ações adicionais podemos comprar
              const additionalQuantity = Math.floor(unallocatedAmount / finalAllocations[index].currentPrice)
              const additionalInvestment = additionalQuantity * finalAllocations[index].currentPrice

              // Atualizar a alocação
              finalAllocations[index] = {
                ...finalAllocations[index],
                investmentAmount: finalAllocations[index].investmentAmount + additionalInvestment,
                quantityToAcquire: finalAllocations[index].quantityToAcquire + additionalQuantity,
                newQuantity:
                  finalAllocations[index].currentQuantity +
                  finalAllocations[index].quantityToAcquire +
                  additionalQuantity,
              }
            }
          }
        }

        setAllocations(finalAllocations)

        // Gerar recomendação de IA
        generateAiRecommendation(finalAllocations, investmentValue, currentTotalValue)
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

  // Função para gerar recomendação de IA
  const generateAiRecommendation = async (
    allocations: StockAllocation[],
    investmentValue: number,
    portfolioValue: number,
  ) => {
    if (allocations.length === 0) return

    setAiLoading(true)

    try {
      // Preparar os dados para a API
      const topAllocations = allocations
        .filter((a) => a.investmentAmount > 0)
        .sort((a, b) => b.investmentAmount - a.investmentAmount)
        .slice(0, 3)

      const portfolioSize = allocations.length
      const totalInvestment = investmentValue
      const currentPortfolioValue = portfolioValue
      const percentageIncrease = (investmentValue / portfolioValue) * 100

      // Construir o prompt para a API
      const prompt = `
        Como consultor financeiro, analise este balanceamento de carteira:
        
        Valor atual da carteira: ${formatCurrency(currentPortfolioValue)}
        Valor do novo aporte: ${formatCurrency(totalInvestment)} (${percentageIncrease.toFixed(2)}% da carteira atual)
        Número de ativos na carteira: ${portfolioSize}
        
        Principais alocações recomendadas:
        ${topAllocations.map((a) => `- ${a.ticker}: ${formatCurrency(a.investmentAmount)} (${a.quantityToAcquire} ações)`).join("\n")}
        
        Forneça uma breve análise (máximo 3 frases) sobre este balanceamento, considerando a diversificação e a estratégia de investimento. Seja conciso e direto.
      `

      // Chamar a API
      const response = await fetch("/api/ai-recommendation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Falha ao gerar recomendação")
      }

      const data = await response.json()
      setAiRecommendation(data.recommendation)
    } catch (error) {
      console.error("Erro ao gerar recomendação de IA:", error)
      // Não definimos erro aqui para não afetar a experiência principal
    } finally {
      setAiLoading(false)
    }
  }

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
      <div className="container mx-auto max-w-md">
        <Card className="border-none shadow-none bg-card">
          <div className="p-4 flex items-center border-b border-border">
            <button onClick={handleBack} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-medium text-foreground">Calculadora De Balanceamento</h1>
              <p className="text-xs text-muted-foreground">Calcule como reorganizar seus investimentos</p>
            </div>
          </div>

          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-2 text-foreground">3º Passo</h2>

            <p className="text-sm text-muted-foreground mb-4">
              Baseado nos ativos da carteira, vamos exibir as ações que recomendamos de acordo com o valor informado e
              suas preferências pessoais.
            </p>

            {error && (
              <div className="bg-destructive/10 p-3 rounded-lg mb-4">
                <p className="text-destructive text-sm">{error}</p>
              </div>
            )}

            {loading || portfolioLoading ? (
              <LoadingState message="Calculando recomendações de investimento..." />
            ) : !hasEligibleStocks ? (
              <div className="bg-yellow-500/10 p-4 rounded-lg mb-6">
                <h3 className="font-bold text-center mb-2 text-foreground">Nenhum ativo elegível para aporte</h3>
                <p className="text-sm text-muted-foreground">
                  Não há ativos marcados como "Comprar" que estejam abaixo do peso na sua carteira. Considere alterar
                  suas recomendações ou ajustar os percentuais META.
                </p>
              </div>
            ) : (
              <>
                {aiRecommendation && (
                  <Card className="bg-primary/10 mb-4 border-primary/20">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 shrink-0">
                          <div className="bg-primary/20 rounded-full p-1">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-primary"
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
                        </div>
                        <div>
                          <h3 className="text-xs font-medium text-primary mb-1">ANÁLISE INTELIGENTE</h3>
                          <p className="text-sm text-foreground">{aiRecommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {aiLoading && (
                  <div className="bg-primary/5 p-3 rounded-lg mb-4 flex items-center justify-center">
                    <div className="animate-pulse flex items-center gap-2">
                      <div className="h-4 w-4 bg-primary/30 rounded-full"></div>
                      <p className="text-xs text-primary/70">Gerando análise inteligente...</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  {allocations
                    .filter((allocation) => allocation.investmentAmount > 0)
                    .map((allocation) => (
                      <Card
                        key={allocation.ticker}
                        className={`border border-border overflow-hidden ${
                          !allocation.isEligibleForInvestment ? "opacity-50" : ""
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <div className="bg-muted rounded-full p-1 mr-2">
                                <Info size={20} className="text-muted-foreground" />
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">CÓDIGO</div>
                                <div className="font-bold text-foreground">{allocation.ticker}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`text-xs font-medium px-2 py-1 rounded-full mr-1 ${
                                  allocation.userRecommendation === "Comprar"
                                    ? "bg-green-500/20 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                    : allocation.userRecommendation === "Aguardar"
                                      ? "bg-yellow-500/20 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : "bg-red-500/20 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                }`}
                              >
                                {allocation.userRecommendation}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                            <div className="text-muted-foreground">VALOR ATUAL DOS ATIVOS</div>
                            <div className="text-muted-foreground">ALOCAÇÃO ATUAL</div>
                            <div className="font-bold text-foreground">{formatCurrency(allocation.currentValue)}</div>
                            <div className="font-bold text-foreground">{allocation.currentPercentage.toFixed(2)}%</div>

                            <div className="text-muted-foreground">VALOR A INVESTIR</div>
                            <div className="text-muted-foreground">ALOCAÇÃO RECOMENDADA/META</div>
                            <div className="font-bold text-green-600 dark:text-green-400">
                              {formatCurrency(allocation.investmentAmount)}
                            </div>
                            <div className="font-bold text-foreground">{allocation.targetPercentage.toFixed(2)}%</div>

                            <div className="text-muted-foreground">QTD ATUAL</div>
                            <div className="text-muted-foreground">QTD A ADQUIRIR</div>
                            <div className="font-bold text-foreground">{allocation.currentQuantity}</div>
                            <div className="font-bold text-foreground">{allocation.quantityToAcquire}</div>

                            <div className="text-muted-foreground">PREÇO DO PAPEL NO MOMENTO DA CONSULTA</div>
                            <div className="text-muted-foreground"></div>
                            <div className="font-bold text-foreground">{formatCurrency(allocation.currentPrice)}</div>
                            <div className="font-bold text-foreground"></div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            )}

            <Card className="bg-destructive/10 mb-6 border-destructive/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-center mb-2">
                  <AlertTriangle className="text-destructive mr-2" size={18} />
                  <h3 className="text-destructive font-bold text-center">ATENÇÃO!</h3>
                </div>
                <p className="text-xs text-foreground mb-2">
                  Para investir, é necessário realizar a compra de ações diretamente na sua corretora/ banco.
                </p>
                <p className="text-xs text-foreground mb-2">
                  Ao clicar em "Confirmar Aporte", você reconhece que isto não é uma ordem de investimento e sim uma
                  sugestão pessoal. Este aplicativo não realiza aplicações no CPF dos usuários.
                </p>
                <p className="text-xs text-foreground mb-2">
                  1. Algumas corretoras/bancos de investimentos cobram taxas de corretagem para compra e venda de ações.
                </p>
                <p className="text-xs text-foreground mb-2">
                  2. Antes de investir, transfira o dinheiro para a sua corretora/ banco.
                </p>
                <p className="text-xs text-foreground mb-2">
                  3. O prazo de liquidação na Bolsa de Valores, que é de D+2, significa que o dinheiro da compra ou
                  venda de ações é debitado ou creditado 2 dias úteis após a negociação.
                </p>
                <p className="text-xs text-foreground mb-2">
                  4. Os preços dos ativos sofrem um atraso de até 15 minutos em relação ao mercado. Portanto, podem
                  existir diferenças de valores entre o preço exibido e o preço real de mercado.
                </p>
              </CardContent>
            </Card>

            <Button
              variant="destructive"
              className="w-full py-3"
              onClick={() => setShowTerms(true)}
              disabled={savingSimulation || loading || portfolioLoading}
            >
              {savingSimulation ? "PROCESSANDO..." : "CONFIRME O TERMO ACIMA"}
            </Button>
          </CardContent>
        </Card>

        {showTerms && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-sm w-full">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 text-foreground">Confirmar Simulação</h3>
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
                  <Button className="flex-1" onClick={handleAgreeTerms} disabled={savingSimulation}>
                    {savingSimulation ? "Salvando..." : "Confirmar"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthGuard>
  )
}
