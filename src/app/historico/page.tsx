"use client"

import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, RefreshCw, Calendar, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"

import AuthGuard from "@/components/auth-guard"
import { AppShell } from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

import { formatCurrency } from "@/core/utils/formatting"
import { useAuth } from "@/core/state/auth-context"
import { type Simulation } from "@/core/schemas/stock"

import { getSimulations } from "@/services/firebase/firestore"

export default function HistoricoSimulacoes() {
  const router = useRouter()
  const { user } = useAuth()
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadSimulations = async () => {
    if (!user?.uid) return

    try {
      setError(null)
      const simulationsData = await getSimulations(user.uid)
      setSimulations(simulationsData)
    } catch (err) {
      console.error("Erro ao carregar histórico:", err)
      setError("Não foi possível carregar o histórico de simulações")
      toast.error("Erro ao carregar histórico")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadSimulations()
  }, [user?.uid])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSimulations()
  }

  const handleBack = () => {
    router.push("/")
  }

  const handleViewSimulation = (simulationId: string) => {
    if (simulationId) {
      router.push(`/historico/${simulationId}`)
    }
  }

  const calculateGainLoss = (before: number, after: number) => {
    const difference = after - before
    const percentage = before > 0 ? ((difference / before) * 100) : 0
    return { difference, percentage }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Componente de Loading
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Componente de Estado Vazio
  const EmptyState = () => (
    <Card>
      <CardContent className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Nenhuma simulação encontrada
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Você ainda não fez nenhuma simulação de balanceamento.
        </p>
        <Button onClick={() => router.push("/calculadora-balanceamento")}>
          Fazer primeira simulação
        </Button>
      </CardContent>
    </Card>
  )

  // Componente de Erro
  const ErrorDisplay = () => (
    <Card>
      <CardContent className="text-center py-8">
        <div className="text-red-500 mb-4">
          <RefreshCw className="h-8 w-8 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Erro ao carregar histórico
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error}
        </p>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Carregando...
            </>
          ) : (
            "Tentar novamente"
          )}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <AuthGuard>
      <AppShell>
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Histórico de Simulações</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh} 
              disabled={refreshing}
              aria-label="Atualizar"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <ErrorDisplay />
          ) : simulations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {simulations.map((simulation) => {
                const { difference, percentage } = calculateGainLoss(
                  simulation.portfolioValueBefore,
                  simulation.portfolioValueAfter
                )
                const isPositive = difference >= 0

                return (
                  <Card key={simulation.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-500">
                            {formatDate(simulation.date)}
                          </span>
                        </div>
                        <Badge variant={isPositive ? "default" : "destructive"}>
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {percentage.toFixed(2)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Valor Investido</p>
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(simulation.investmentAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Variação</p>
                          <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{formatCurrency(difference)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Valor Antes</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(simulation.portfolioValueBefore)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Valor Depois</p>
                          <p className="text-sm font-medium">
                            {formatCurrency(simulation.portfolioValueAfter)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">
                          Ativos simulados: {simulation.allocations.length}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {simulation.allocations.slice(0, 5).map((allocation) => (
                            <Badge key={allocation.ticker} variant="outline" className="text-xs">
                              {allocation.ticker}
                            </Badge>
                          ))}
                          {simulation.allocations.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{simulation.allocations.length - 5} mais
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleViewSimulation(simulation.id || '')}
                        disabled={!simulation.id}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  )
}
