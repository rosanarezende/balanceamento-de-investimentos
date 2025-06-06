"use client"

import React, { useState, useEffect } from "react"
import { ArrowLeft, AlertTriangle, RefreshCw, CheckCircle, HelpCircle, Info } from "lucide-react"
import { useRouter } from "next/navigation"

import { AppShellEnhanced } from "@/components/layout/app-shell-enhanced"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { usePortfolio } from "@/core/state/portfolio-context"
import { useTheme } from "@/core/state/theme-context"
import { formatCurrency } from "@/core/utils/formatting"

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
    hasEligibleStocks,
    totalPortfolioValue
  } = usePortfolio()

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

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

  // Calcular percentual sugerido para aporte
  const maxPercentage = 10; // Limite máximo de percentual sugerido
  const minPercentage = 1;  // Limite mínimo de percentual sugerido
  const calculatedPercentage = totalPortfolioValue > 0 ? (totalPortfolioValue * 0.05 / 100) : 0; // Percentual calculado com base no valor total do portfólio
  const roundedPercentage = Math.round(calculatedPercentage * 100); // Arredondar o percentual calculado
  const suggestedPercentage = totalPortfolioValue > 0 
    ? Math.min(maxPercentage, Math.max(minPercentage, roundedPercentage)) 
    : 1000; // Garantir que o percentual esteja dentro dos limites
  const suggestedValue = totalPortfolioValue > 0 
    ? (totalPortfolioValue * (suggestedPercentage / 100)) 
    : 1000; // Valor sugerido com base no percentual calculado
  const formattedSuggestedValue = formatCurrency(suggestedValue); // Formatar o valor sugerido como moeda

  return (
    <AppShellEnhanced>
      <div className="container mx-auto max-w-md">
        <Card className="border-none shadow-none bg-card">
          <CardHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={handleBack} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <CardTitle className="text-lg font-medium text-foreground">Calculadora de Balanceamento</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">Calcule como reorganizar seus investimentos</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRefreshPortfolio}
                        disabled={isRefreshing || portfolioLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing || portfolioLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Atualizar carteira</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleTheme}
                      >
                        {theme === 'dark' ? '🌙' : '☀️'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Alternar tema</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowInfo(!showInfo)}
                      >
                        <HelpCircle className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Informações sobre a calculadora</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="flex items-center justify-center w-full">
                <div className="flex items-center justify-center bg-primary/10 rounded-full h-12 w-12 mr-4">
                  <span className="text-primary font-bold text-lg">1</span>
                </div>
                <div className="h-0.5 w-8 bg-muted-foreground/30"></div>
                <div className="flex items-center justify-center bg-primary rounded-full h-12 w-12 mx-4">
                  <span className="text-primary-foreground font-bold text-lg">2</span>
                </div>
                <div className="h-0.5 w-8 bg-muted-foreground/30"></div>
                <div className="flex items-center justify-center bg-primary/10 rounded-full h-12 w-12 ml-4">
                  <span className="text-primary font-bold text-lg">3</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-center text-foreground">Valor do Aporte</h2>

              <p className="text-base text-muted-foreground text-center">
                Informe o valor que deseja investir para receber recomendações de balanceamento
              </p>

              {/* Informações da calculadora */}
              {showInfo && (
                <Alert className="bg-primary/5 border-primary/20">
                  <Info className="h-4 w-4 text-primary" />
                  <AlertTitle>Como funciona a calculadora?</AlertTitle>
                  <AlertDescription className="text-sm">
                    <p className="mb-2">A calculadora de balanceamento ajuda você a distribuir seu novo aporte entre os ativos da sua carteira, buscando aproximá-los dos percentuais alvo definidos.</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Informe o valor que deseja investir</li>
                      <li>Verifique as recomendações para cada ativo</li>
                      <li>Veja a distribuição sugerida para seu aporte</li>
                    </ol>
                    <p className="mt-2 text-xs">Apenas ativos marcados como "Comprar" serão considerados para o balanceamento.</p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Mostrar última atualização */}
              {formattedLastUpdate && (
                <div className="flex items-center justify-center w-full">
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Última atualização: {formattedLastUpdate}
                  </Badge>
                </div>
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
                <div className="w-full flex flex-col items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <span className="text-muted-foreground text-sm">
                    {isRefreshing ? 'Atualizando carteira...' : 'Carregando carteira...'}
                  </span>
                </div>
              )}

              {/* Conteúdo principal quando não está carregando */}
              {!portfolioLoading && !isRefreshing && (
                <>
                  {/* Adicionar mensagem de erro quando não há ativos */}
                  {!hasStocks && (
                    <Alert variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <AlertTitle>Carteira vazia</AlertTitle>
                      <AlertDescription>
                        Você precisa adicionar ativos à sua carteira antes de usar a calculadora.
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/carteira')}
                          className="mt-2 w-full"
                        >
                          Ir para Carteira
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Mostrar mensagem se não há ativos elegíveis */}
                  {hasStocks && !hasEligibleStocks && (
                    <Alert variant="warning" className="w-full bg-yellow-500/10 border-yellow-500/30">
                      <AlertTriangle className="text-yellow-500 h-4 w-4 mr-2" />
                      <AlertTitle>Sem ativos para compra</AlertTitle>
                      <AlertDescription>
                        Não há ativos marcados como &quot;Comprar&quot; na sua carteira. Adicione recomendações aos seus ativos.
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/carteira')}
                          className="mt-2 w-full"
                        >
                          Gerenciar Ativos
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Exibir mensagem de erro */}
                  {error && (
                    <Alert variant="destructive" className="w-full">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Sugestão de valor */}
                  {hasStocks && hasEligibleStocks && totalPortfolioValue > 0 && (
                    <Card className="w-full bg-primary/5 border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <Info className="h-4 w-4 text-primary mt-1 mr-2" />
                          <div>
                            <p className="text-sm font-medium">Sugestão de aporte</p>
                            <p className="text-xs text-muted-foreground">
                              Para uma carteira de {formatCurrency(totalPortfolioValue)}, um aporte de aproximadamente {suggestedPercentage}% ({formattedSuggestedValue}) seria adequado.
                            </p>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-primary text-xs"
                              onClick={() => setInvestmentValue(formattedSuggestedValue.replace("R$", "").trim())}
                            >
                              Usar este valor
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                        disabled={!hasStocks || !hasEligibleStocks || isCalculating}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full py-6 text-xl"
                    size="lg"
                    onClick={handleCalculate}
                    disabled={!hasStocks || !hasEligibleStocks || isCalculating || !investmentValue}
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
          
          <CardFooter className="px-6 pb-6 pt-0">
            <p className="text-xs text-muted-foreground w-full text-center">
              Os cálculos são baseados nos ativos da sua carteira e nas recomendações definidas para cada ativo.
            </p>
          </CardFooter>
        </Card>
      </div>
    </AppShellEnhanced>
  )
}
