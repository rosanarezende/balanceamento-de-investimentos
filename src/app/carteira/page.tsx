"use client"

import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AppShellEnhanced } from "@/components/layout/app-shell-enhanced"

import { useToast } from "@/hooks/use-toast"
import { usePortfolio } from "@/core/state/portfolio-context"
import { StockWithDetails } from "@/core/types"

import DashboardLayout from "./layout"
import { ResumoCarteira, ListaAtivos, ModaisAtivos } from "./components"

export default function CarteiraPage() {
  const { toast } = useToast()
  const {
    loading,
    error,
    refreshPortfolio,
    addStockToPortfolio,
    removeStockFromPortfolio,
    updateStockInPortfolio
  } = usePortfolio()

  // Estados para UI
  const [isExpanded, setIsExpanded] = useState(true)

  // Estados para modais
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<StockWithDetails | null>(null)

  // Estados para formulários
  const [formData, setFormData] = useState({
    ticker: "",
    quantity: 0,
    targetPercentage: 0
  })

  // Funções para modais
  const openAddModal = () => {
    setFormData({ ticker: "", quantity: 0, targetPercentage: 0 })
    setIsAddModalOpen(true)
  }

  const openEditModal = (stock: StockWithDetails) => {
    setSelectedStock(stock)
    setFormData({
      ticker: stock.ticker,
      quantity: stock.quantity,
      targetPercentage: stock.targetPercentage
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (stock: StockWithDetails) => {
    setSelectedStock(stock)
    setIsDeleteModalOpen(true)
  }

  const closeModals = () => {
    setIsAddModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedStock(null)
    setFormData({ ticker: "", quantity: 0, targetPercentage: 0 })
  }

  const handleSaveStock = async () => {
    try {
      // Validações
      if (!formData.ticker.trim()) {
        toast({
          title: "Erro",
          description: "Ticker é obrigatório",
          variant: "destructive"
        })
        return
      }

      if (formData.quantity <= 0) {
        toast({
          title: "Erro",
          description: "Quantidade deve ser maior que zero",
          variant: "destructive"
        })
        return
      }

      if (formData.targetPercentage <= 0 || formData.targetPercentage > 100) {
        toast({
          title: "Erro",
          description: "Percentual alvo deve estar entre 0 e 100",
          variant: "destructive"
        })
        return
      }

      let success = false

      // Usar as funções do contexto
      if (isEditModalOpen && selectedStock) {
        success = await updateStockInPortfolio(selectedStock.ticker, {
          quantity: formData.quantity,
          targetPercentage: formData.targetPercentage,
          userRecommendation: selectedStock.userRecommendation || "Aguardar"
        })
      } else {
        success = await addStockToPortfolio(formData.ticker, {
          quantity: formData.quantity,
          targetPercentage: formData.targetPercentage,
          userRecommendation: "Aguardar"
        })
      }

      if (success) {
        toast({
          title: "Sucesso",
          description: isEditModalOpen ? "Ação atualizada com sucesso" : "Ação adicionada com sucesso"
        })
        closeModals()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar ação",
        variant: "destructive"
      })
    }
  }

  const handleDeleteStock = async () => {
    try {
      if (!selectedStock) return

      const success = await removeStockFromPortfolio(selectedStock.ticker)

      if (success) {
        toast({
          title: "Sucesso",
          description: "Ação removida com sucesso"
        })
        closeModals()
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover ação",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <AppShellEnhanced>
          <div className="container mx-auto p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        </AppShellEnhanced>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <AppShellEnhanced>
          <div className="container mx-auto p-6">
            <Card className="border-red-800 bg-red-900/20">
              <CardContent className="p-6 text-center">
                <div className="text-red-400 text-lg font-medium mb-2">
                  Erro ao carregar carteira
                </div>
                <div className="text-red-300 mb-4">
                  {error}
                </div>
                <Button onClick={refreshPortfolio} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              </CardContent>
            </Card>
          </div>
        </AppShellEnhanced>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <AppShellEnhanced>
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Minha Carteira
              </h1>
              <p className="text-slate-400 mt-2">
                Gerencie seus investimentos e acompanhe o desempenho
              </p>
            </div>
            <Button
              onClick={refreshPortfolio}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>

          {/* Painel de Resumo Expansível */}
          <ResumoCarteira
            isExpanded={isExpanded}
            onToggleExpanded={() => setIsExpanded(!isExpanded)}
          />

          {/* Lista de Ativos */}
          <ListaAtivos
            onAddStock={openAddModal}
            onEditStock={openEditModal}
            onDeleteStock={openDeleteModal}
          />

          {/* Modais */}
          <ModaisAtivos
            isAddModalOpen={isAddModalOpen}
            setIsAddModalOpen={setIsAddModalOpen}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            isDeleteModalOpen={isDeleteModalOpen}
            setIsDeleteModalOpen={setIsDeleteModalOpen}
            formData={formData}
            setFormData={setFormData}
            selectedStock={selectedStock}
            onSaveStock={handleSaveStock}
            onDeleteStock={handleDeleteStock}
            onCloseModals={closeModals}
          />
        </div>
      </AppShellEnhanced>
    </DashboardLayout>
  )
}
