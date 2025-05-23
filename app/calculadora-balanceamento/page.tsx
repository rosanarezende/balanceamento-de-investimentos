"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import { usePortfolio } from "@/hooks/use-portfolio"
import { Menu } from "@/components/ui/menu"

export default function CalculadoraBalanceamento() {
  const [investmentValue, setInvestmentValue] = useState("")
  const router = useRouter()

  // Adicionar uso do hook para verificar se há ativos
  const { stocksWithDetails, loading: portfolioLoading, refreshPortfolio } = usePortfolio()
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Função para forçar a atualização da carteira
  const handleRefreshPortfolio = async () => {
    setIsRefreshing(true)
    try {
      await refreshPortfolio()
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Verificar se há ativos na carteira ao carregar a página
  useEffect(() => {
    // Forçar uma atualização da carteira ao montar o componente
    handleRefreshPortfolio()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleCalculate = () => {
    // Limpar erro anterior
    setError(null)
    
    const value = Number.parseFloat(investmentValue.replace(/[^\d,]/g, "").replace(",", "."))
    if (isNaN(value) || value <= 0) {
      setError("Por favor, insira um valor válido para o aporte.")
      return
    }

    // Verificar se há ativos na carteira
    if (stocksWithDetails.length === 0) {
      setError("Você precisa adicionar ativos à sua carteira antes de usar a calculadora.")
      return
    }

    // Verificar se há ativos elegíveis para investimento (marcados como "Comprar")
    const eligibleStocks = stocksWithDetails.filter(stock => stock.userRecommendation === "Comprar")
    if (eligibleStocks.length === 0) {
      setError("Não há ativos marcados como 'Comprar' na sua carteira. Adicione recomendações aos seus ativos.")
      return
    }

    // Priorizar ações mais distantes da meta
    eligibleStocks.sort((a, b) => {
      const diffA = a.targetPercentage - a.currentPercentage
      const diffB = b.targetPercentage - b.currentPercentage
      return diffB - diffA
    })

    // Navegar para o resultado apenas se todas as validações passarem
    router.push(`/calculadora-balanceamento/resultado?valor=${value}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números e vírgula
    let value = e.target.value.replace(/[^\d,]/g, "")

    // Formatar como moeda apenas se houver valor
    if (value) {
      // Remover vírgulas extras (manter apenas a última)
      const parts = value.split(",")
      if (parts.length > 1) {
        value = parts[0] + "," + parts.slice(1).join("")
      }

      // Se terminar com vírgula, manter assim para continuar digitando decimais
      if (value.endsWith(",")) {
        setInvestmentValue(value)
        return
      }

      // Formatar o número
      const number = Number.parseFloat(value.replace(",", "."))
      if (!isNaN(number)) {
        value = number
          .toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(".", ",")
      }
    }

    setInvestmentValue(value)
  }

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

          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-6">
              <h2 className="text-3xl font-bold text-center text-foreground">2º Passo</h2>

              <p className="text-lg text-muted-foreground text-center">
                Para iniciar a projeção de balanceamento você deve informar abaixo o valor que deseja investir
              </p>

              {/* Adicionar indicador de carregamento */}
              {portfolioLoading ? (
                <div className="w-full flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Adicionar mensagem de erro quando não há ativos */}
                  {stocksWithDetails.length === 0 && (
                    <div className="w-full bg-yellow-500/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-foreground">Carteira vazia</h3>
                          <p className="text-sm text-muted-foreground">
                            Você precisa adicionar ativos à sua carteira antes de usar a calculadora.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => router.push('/')}
                          >
                            Ir para Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshPortfolio}
                            disabled={isRefreshing}
                          >
                            {isRefreshing ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                                Atualizando...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Atualizar Carteira
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mostrar mensagem se não há ativos elegíveis */}
                  {stocksWithDetails.length > 0 && 
                  !stocksWithDetails.some(stock => stock.userRecommendation === "Comprar") && (
                    <div className="w-full bg-yellow-500/10 p-4 rounded-lg">
                      <div className="flex items-start">
                        <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-foreground">Sem ativos para compra</h3>
                          <p className="text-sm text-muted-foreground">
                            Não há ativos marcados como "Comprar" na sua carteira. Adicione recomendações aos seus ativos.
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => router.push('/')}
                          >
                            Gerenciar Ativos
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Exibir mensagem de erro */}
                  {error && (
                    <div className="w-full bg-destructive/10 p-4 rounded-lg">
                      <p className="text-destructive text-sm">{error}</p>
                    </div>
                  )}

                  <div className="w-full">
                    <div className="bg-background border border-input rounded-lg p-4 flex items-center">
                      <span className="text-muted-foreground text-2xl mr-2">R$</span>
                      <input
                        type="text"
                        className="flex-1 text-2xl outline-none bg-transparent text-foreground"
                        value={investmentValue}
                        onChange={handleInputChange}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <Button 
                    className="w-full py-6 text-xl" 
                    size="lg" 
                    onClick={handleCalculate}
                    disabled={stocksWithDetails.length === 0 || 
                            !stocksWithDetails.some(stock => stock.userRecommendation === "Comprar")}
                  >
                    Calcular
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Menu />
    </AuthGuard>
  )
}
