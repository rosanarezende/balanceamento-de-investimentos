"use client"

import React, { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle, RefreshCw, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { AppShell } from "@/components/layout/app-shell"

import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert } from "@/components/ui/alert"

import { usePortfolio } from "@/core/state/portfolio-context"
import { useTheme } from "@/core/state/theme-context"

export default function CalculadoraBalanceamento() {
  const [investmentValue, setInvestmentValue] = useState("")
  const router = useRouter()

  // Adicionar uso do hook para verificar se há ativos
  const {
    stocksWithDetails,
    loading: portfolioLoading,
    refreshPortfolio,
    isRefreshing,
    lastUpdated,
    hasStocks,
    hasEligibleStocks
  } = usePortfolio()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Função para forçar a atualização da carteira
  const handleRefreshPortfolio = async () => {
    setError(null)
    setSuccess(null)

    try {
      await refreshPortfolio()
      setSuccess("Carteira atualizada com sucesso!")

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error)
      setError("Não foi possível atualizar sua carteira. Por favor, tente novamente.")
    }
  }

  // Verificar se há ativos na carteira ao carregar a página
  useEffect(() => {
    // Forçar uma atualização da carteira ao montar o componente
    handleRefreshPortfolio().catch((error) => {
      console.error("Erro ao forçar atualização da carteira:", error)
      setError("Ocorreu um erro ao forçar a atualização da carteira. Por favor, tente novamente.")
    })
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleCalculate = () => {
    // Limpar erro anterior
    setError(null)
    setIsCalculating(true)

    try {
      const value = Number.parseFloat(investmentValue.replace(/[^\d,]/g, "").replace(",", "."))
      if (isNaN(value) || value <= 0) {
        setError("Por favor, insira um valor válido para o aporte.")
        setIsCalculating(false)
        return
      }

      // Verificar se há ativos na carteira
      if (stocksWithDetails.length === 0) {
        setError("Você precisa adicionar ativos à sua carteira antes de usar a calculadora.")
        setIsCalculating(false)
        return
      }

      // Verificar se há ativos elegíveis para investimento (marcados como "Comprar")
      const eligibleStocks = stocksWithDetails.filter(stock => stock.userRecommendation === "Comprar")
      if (eligibleStocks.length === 0) {
        setError("Não há ativos marcados como 'Comprar' na sua carteira. Adicione recomendações aos seus ativos.")
        setIsCalculating(false)
        return
      }

      // Navegar para o resultado apenas se todas as validações passarem
      router.push(`/calculadora-balanceamento/resultado?valor=${value}`)
    } catch (error) {
      console.error("Erro ao processar valor:", error)
      setError("Ocorreu um erro ao processar o valor. Por favor, tente novamente.")
      setIsCalculating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpar mensagens ao editar
    setError(null)

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

  // Formatar a data da última atualização
  const formattedLastUpdate = lastUpdated
    ? new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(lastUpdated)
    : null;

  const { theme, toggleTheme } = useTheme()

  return (
    <AuthGuard>
      <AppShell>
        <div className="container mx-auto max-w-md">
          <Card className="border-none shadow-none bg-card">
            <div className="p-4 flex items-center border-b border-border">
              <button onClick={handleBack} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft size={24} />
              </button>
              <div className="flex-1">
                <h1 className="font-medium text-foreground">Calculadora De Balanceamento</h1>
                <p className="text-xs text-muted-foreground">Calcule como reorganizar seus investimentos</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefreshPortfolio}
                disabled={isRefreshing || portfolioLoading}
                title="Atualizar carteira"
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing || portfolioLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                title="Alternar tema"
                className="ml-2"
              >
                {theme === 'dark' ? '🌙' : '☀️'}
              </Button>
            </div>

            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center gap-6">
                <h2 className="text-3xl font-bold text-center text-foreground">2º Passo</h2>

                <p className="text-lg text-muted-foreground text-center">
                  Para iniciar a projeção de balanceamento você deve informar abaixo o valor que deseja investir
                </p>

                {/* Mostrar última atualização */}
                {formattedLastUpdate && (
                  <p className="text-xs text-muted-foreground w-full text-center">
                    Última atualização: {formattedLastUpdate}
                  </p>
                )}

                {/* Mensagem de sucesso */}
                {success && (
                  <Alert className="w-full bg-green-500/10 text-green-500 border-green-500/50">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span>{success}</span>
                  </Alert>
                )}

                {/* Adicionar indicador de carregamento */}
                {(portfolioLoading || isRefreshing) && (
                  <div className="w-full flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2 text-muted-foreground">
                      {isRefreshing ? 'Atualizando carteira...' : 'Carregando carteira...'}
                    </span>
                  </div>
                )}

                {/* Conteúdo principal quando não está carregando */}
                {!portfolioLoading && !isRefreshing && (
                  <>
                    {/* Adicionar mensagem de erro quando não há ativos */}
                    {!hasStocks && (
                      <div className="w-full bg-yellow-500/10 p-4 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-foreground">Carteira vazia</h3>
                            <p className="text-sm text-muted-foreground">
                              Você precisa adicionar ativos à sua carteira antes de usar a calculadora.
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/')}
                              >
                                Ir para Dashboard
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mostrar mensagem se não há ativos elegíveis */}
                    {hasStocks && !hasEligibleStocks && (
                      <div className="w-full bg-yellow-500/10 p-4 rounded-lg">
                        <div className="flex items-start">
                          <AlertTriangle className="text-yellow-500 mr-2 h-5 w-5 mt-0.5" />
                          <div>
                            <h3 className="font-medium text-foreground">Sem ativos para compra</h3>
                            <p className="text-sm text-muted-foreground">
                              Não há ativos marcados como &quot;Comprar&quot; na sua carteira. Adicione recomendações aos seus ativos.
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
                        <div className="flex items-start">
                          <AlertTriangle className="text-destructive mr-2 h-5 w-5 mt-0.5" />
                          <p className="text-destructive text-sm">{error}</p>
                        </div>
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
                          placeholder="0"
                          disabled={!hasStocks || !hasEligibleStocks || isCalculating}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full py-6 text-xl"
                      size="lg"
                      onClick={handleCalculate}
                      disabled={!hasStocks || !hasEligibleStocks || isCalculating}
                    >
                      {isCalculating ? (
                        <>
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        'Calcular'
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  )
}
