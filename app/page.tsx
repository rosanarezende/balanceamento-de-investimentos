"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Info, LogOut } from "lucide-react"
import { StockCard } from "@/components/stock-card"
import { AddStockForm } from "@/components/add-stock-form"
import { usePortfolio } from "@/hooks/use-portfolio"
import { useAuth } from "@/contexts/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"
import AuthGuard from "@/components/auth-guard"

export default function Home() {
  const router = useRouter()
  const { signOut, user } = useAuth()
  const {
    stocksWithDetails,
    loading,
    error,
    totalPortfolioValue,
    addOrUpdateStock,
    removeStockFromPortfolio,
    updateRecommendation,
  } = usePortfolio()
  const [showAddForm, setShowAddForm] = useState(false)

  const handleCalculatorClick = () => {
    router.push("/calculadora-balanceamento")
  }

  const handleEditClick = () => {
    setShowAddForm(!showAddForm)
  }

  const handleHistoryClick = () => {
    router.push("/historico")
  }

  const handleResetClick = () => {
    if (confirm("Tem certeza que deseja resetar todos os ativos? Esta ação não pode ser desfeita.")) {
      // Implementar lógica de reset
      alert("Funcionalidade não implementada")
    }
  }

  const handleRetry = () => {
    window.location.reload()
  }

  const handleLogout = () => {
    signOut()
  }

  return (
    <AuthGuard>
      <div className="bg-background min-h-screen">
        <div className="max-w-md mx-auto bg-card pb-4">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h1 className="font-medium text-card-foreground">EquilibraInvest</h1>
              <p className="text-xs text-muted-foreground">Olá, {user?.displayName?.split(" ")[0] || "Usuário"}</p>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-card-foreground">Meus Ativos</h2>
              <button className="text-primary">
                <Info size={20} />
              </button>
            </div>

            {error && (
              <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleRetry}>
                  Tentar Novamente
                </Button>
              </div>
            )}

            {loading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Carregando dados das ações...</p>
              </div>
            ) : stocksWithDetails.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">Você ainda não possui ações na sua carteira.</p>
                <Button className="mt-4" onClick={() => setShowAddForm(true)}>
                  Adicionar Ações
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {stocksWithDetails.map((stock) => (
                  <div key={stock.ticker} className="relative">
                    <StockCard
                      ticker={stock.ticker}
                      quantity={stock.quantity}
                      currentValue={stock.currentValue}
                      currentPercentage={stock.currentPercentage}
                      targetPercentage={stock.targetPercentage}
                      toBuy={stock.toBuy}
                      excess={stock.excess}
                      currentPrice={stock.currentPrice}
                      userRecommendation={stock.userRecommendation}
                      onUpdateRecommendation={updateRecommendation}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                      onClick={() => removeStockFromPortfolio(stock.ticker)}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {showAddForm && (
              <div className="mt-6">
                <AddStockForm onAddStock={addOrUpdateStock} />
              </div>
            )}
          </div>

          <div className="px-4 space-y-3 mt-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleCalculatorClick}
            >
              CALCULADORA DE BALANCEAMENTO
            </Button>

            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={() => router.push("/dashboard")}
            >
              DASHBOARD E GRÁFICOS
            </Button>

            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={handleEditClick}
            >
              {showAddForm ? "OCULTAR FORMULÁRIO" : "ADICIONAR ATIVOS"}
            </Button>

            <Button
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={handleHistoryClick}
            >
              HISTÓRICO DE SIMULAÇÕES
            </Button>

            <Button
              variant="destructive"
              className="w-full bg-destructive hover:bg-destructive/90"
              onClick={handleResetClick}
            >
              RESETAR TODOS OS ATIVOS
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
