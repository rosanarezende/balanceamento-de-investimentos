"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, BarChart2, PieChart, RefreshCw } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { usePortfolio } from "@/hooks/use-portfolio"
import { PortfolioChart } from "@/components/dashboard/portfolio-chart"
import { PortfolioComparisonChart } from "@/components/dashboard/portfolio-comparison-chart"
import AuthGuard from "@/components/auth-guard"
import { AppShell } from "@/components/layout/app-shell"
import DashboardLayout from "./layout"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function Dashboard() {
  const router = useRouter()
  const { stocksWithDetails, loading, error, totalPortfolioValue, refreshPortfolio } = usePortfolio()
  const [chartType, setChartType] = useState<"pie" | "comparison">("pie")
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isRecovering, setIsRecovering] = useState(false)

  const handleBack = () => {
    router.push("/")
  }

  // Tratamento de erros não capturados
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("Erro não tratado na dashboard:", event.error)
      setLoadError("Ocorreu um erro ao carregar a dashboard. Tente novamente mais tarde.")
      // Registrar erro em serviço de monitoramento (opcional)
    }

    window.addEventListener("error", handleError)
    return () => window.removeEventListener("error", handleError)
  }, [])

  // Limpar erro quando os dados são carregados com sucesso
  useEffect(() => {
    if (!loading && !error && stocksWithDetails.length > 0) {
      setLoadError(null)
    }
  }, [loading, error, stocksWithDetails])

  // Função para tentar recuperar de erros
  const handleRecovery = async () => {
    try {
      setIsRecovering(true)
      await refreshPortfolio()
      setLoadError(null)
      toast.success("Dashboard atualizada com sucesso!")
    } catch (err) {
      console.error("Erro ao tentar recuperar dashboard:", err)
      toast.error("Não foi possível recuperar a dashboard")
    } finally {
      setIsRecovering(false)
    }
  }

  // Componente de erro com opção de recuperação
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 my-4">
      <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erro ao carregar dashboard</h3>
      <p className="text-red-700 dark:text-red-200 mb-4">{message}</p>
      <Button 
        onClick={handleRecovery} 
        disabled={isRecovering}
        className="w-full"
      >
        {isRecovering ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Tentando recuperar...
          </>
        ) : (
          "Tentar novamente"
        )}
      </Button>
    </div>
  )

  return (
    <AuthGuard>
      <AppShell>
        <DashboardLayout>
          <div className="container max-w-md mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="w-10"></div> {/* Espaçador para centralizar o título */}
            </div>

            {/* Exibir erro crítico se existir */}
            {loadError && <ErrorDisplay message={loadError} />}

            {/* Continuar renderização normal se não houver erro crítico */}
            {!loadError && (
              <>
                <Card className="mb-6">
                  <CardContent className="p-4">
                    <h2 className="text-lg font-medium mb-2">Resumo da Carteira</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Total</p>
                        <p className="text-xl font-bold">
                          {typeof totalPortfolioValue === "number" && !isNaN(totalPortfolioValue)
                            ? formatCurrency(totalPortfolioValue)
                            : "R$ 0,00"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Quantidade de Ativos</p>
                        <p className="text-xl font-bold">{stocksWithDetails.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center mb-4">
                  <div className="inline-flex rounded-md shadow-sm" role="group">
                    <Button
                      variant={chartType === "pie" ? "default" : "outline"}
                      className="rounded-r-none"
                      onClick={() => setChartType("pie")}
                    >
                      <PieChart className="h-4 w-4 mr-2" />
                      Composição
                    </Button>
                    <Button
                      variant={chartType === "comparison" ? "default" : "outline"}
                      className="rounded-l-none"
                      onClick={() => setChartType("comparison")}
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Comparação
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="py-8 text-center">
                    <Skeleton className="h-8 w-3/4 mx-auto" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                  </div>
                ) : error ? (
                  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full"
                      onClick={refreshPortfolio}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                ) : stocksWithDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Você ainda não possui ações na sua carteira.</p>
                    <Button className="mt-4" onClick={() => router.push("/")}>
                      Adicionar Ações
                    </Button>
                  </div>
                ) : chartType === "pie" ? (
                  <ErrorBoundary fallback={<div className="text-center py-8">Não foi possível carregar o gráfico</div>}>
                    <PortfolioChart 
                      data={stocksWithDetails} 
                      totalValue={typeof totalPortfolioValue === 'number' && !isNaN(totalPortfolioValue) ? totalPortfolioValue : 0} 
                    />
                  </ErrorBoundary>
                ) : (
                  <ErrorBoundary fallback={<div className="text-center py-8">Não foi possível carregar o gráfico</div>}>
                    <PortfolioComparisonChart data={stocksWithDetails} />
                  </ErrorBoundary>
                )}
              </>
            )}
          </div>
        </DashboardLayout>
      </AppShell>
    </AuthGuard>
  )
}

// Componente ErrorBoundary para capturar erros em componentes filhos
class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro em componente filho:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
