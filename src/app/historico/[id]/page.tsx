"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  DollarSign,
  Share
} from "lucide-react"

import AuthGuard from "@/components/auth-guard"
import { AppShellEnhanced } from "@/components/layout/app-shell-enhanced"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import { formatCurrency } from "@/core/utils/formatting"
import { useAuth } from "@/core/state/auth-context"
import { type Simulation } from "@/core/schemas/stock"

import { getSimulation } from "@/services/firebase/firestore"

export default function DetalhesSimulacao() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [simulation, setSimulation] = useState<Simulation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const simulationId = params.id as string

  useEffect(() => {
    const loadSimulation = async () => {
      if (!user?.uid || !simulationId) return

      try {
        setError(null)
        const simulationData = await getSimulation(user.uid, simulationId)
        if (simulationData) {
          setSimulation(simulationData)
        } else {
          setError("Simulação não encontrada")
        }
      } catch (err) {
        console.error("Erro ao carregar simulação:", err)
        setError("Não foi possível carregar os detalhes da simulação")
        toast.error("Erro ao carregar simulação")
      } finally {
        setLoading(false)
      }
    }

    loadSimulation()
  }, [user?.uid, simulationId])

  const handleBack = () => {
    router.push("/historico")
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

  const calculateGainLoss = (before: number, after: number) => {
    const difference = after - before
    const percentage = before > 0 ? ((difference / before) * 100) : 0
    return { difference, percentage }
  }

  const getRecommendationBadge = (recommendation?: string) => {
    switch (recommendation) {
      case "Comprar":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Comprar</Badge>
      case "Vender":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vender</Badge>
      case "Aguardar":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Aguardar</Badge>
      default:
        return <Badge variant="outline">N/A</Badge>
    }
  }

  // Componente de Loading
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
      
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-24" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  // Componente de Erro
  const ErrorDisplay = () => (
    <Card>
      <CardContent className="text-center py-12">
        <div className="text-red-500 mb-4">
          <BarChart3 className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Simulação não encontrada
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {error}
        </p>
        <Button onClick={handleBack}>
          Voltar ao histórico
        </Button>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <AuthGuard>
        <AppShellEnhanced>
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold ml-4">Detalhes da Simulação</h1>
            </div>
            <LoadingSkeleton />
          </div>
        </AppShellEnhanced>
      </AuthGuard>
    )
  }

  if (error || !simulation) {
    return (
      <AuthGuard>
        <AppShellEnhanced>
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center mb-6">
              <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold ml-4">Detalhes da Simulação</h1>
            </div>
            <ErrorDisplay />
          </div>
        </AppShellEnhanced>
      </AuthGuard>
    )
  }

  const { difference, percentage } = calculateGainLoss(
    simulation.portfolioValueBefore,
    simulation.portfolioValueAfter
  )
  const isPositive = difference >= 0

  return (
    <AuthGuard>
      <AppShellEnhanced>
        <div className="container max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" onClick={handleBack} aria-label="Voltar">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold ml-4">Detalhes da Simulação</h1>
          </div>

          {/* Resumo da Simulação */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {formatDate(simulation.date)}
                </CardTitle>
                <Badge variant={isPositive ? "default" : "destructive"} className="text-sm">
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  {percentage.toFixed(2)}%
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valor Investido</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(simulation.investmentAmount)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valor Antes</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(simulation.portfolioValueBefore)}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <BarChart3 className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Valor Depois</p>
                  <p className="text-lg font-bold">
                    {formatCurrency(simulation.portfolioValueAfter)}
                  </p>
                </div>
                
                <div className={`text-center p-4 rounded-lg ${isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  {isPositive ? (
                    <TrendingUp className={`h-6 w-6 mx-auto mb-2 text-green-600`} />
                  ) : (
                    <TrendingDown className={`h-6 w-6 mx-auto mb-2 text-red-600`} />
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-400">Variação</p>
                  <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(difference)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalhes das Alocações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Alocações Simuladas ({simulation.allocations.length} ativos)
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {simulation.allocations.map((allocation, index) => (
                  <div key={`${allocation.ticker}-${index}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono font-bold">
                          {allocation.ticker}
                        </Badge>
                        {getRecommendationBadge(allocation.userRecommendation)}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(allocation.investmentAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          para investir
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Valor Atual</p>
                        <p className="font-medium">{formatCurrency(allocation.currentValue)}</p>
                        <p className="text-xs text-gray-500">{allocation.currentQuantity} ações</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">% Atual</p>
                        <p className="font-medium">{allocation.currentPercentage.toFixed(2)}%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">% Alvo</p>
                        <p className="font-medium text-blue-600">{allocation.targetPercentage.toFixed(2)}%</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Comprar</p>
                        <p className="font-medium text-green-600">{allocation.quantityToAcquire} ações</p>
                        <p className="text-xs text-gray-500">
                          {formatCurrency(allocation.currentPrice)}/ação
                        </p>
                      </div>
                    </div>
                    
                    {index < simulation.allocations.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShellEnhanced>
    </AuthGuard>
  )
}
