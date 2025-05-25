"use client"

import { usePortfolio } from "@/hooks/use-portfolio"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"
import { RECOMMENDATION_TYPES, fetchStockPrice } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert } from "@/components/ui/alert"

interface AddStockFormProps {
  onAddStock: (ticker: string, quantity: number, targetPercentage: number, userRecommendation: string) => Promise<void>
}

export function AddStockForm({ onAddStock }: AddStockFormProps) {
  const { addOrUpdateStock, refreshPortfolio, hasEligibleStocks } = usePortfolio()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newStock, setNewStock] = useState({
    ticker: "",
    quantity: 0,
    targetPercentage: 0,
    userRecommendation: RECOMMENDATION_TYPES[0],
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleChange = (field: string, value: string | number) => {
    // Limpar mensagens de status ao editar
    if (success) setSuccess(false)
    if (error) setError(null)
    
    setNewStock((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = (): boolean => {
    if (!newStock.ticker) {
      setError("Por favor, insira o código do ativo.")
      return false
    }

    if (newStock.quantity <= 0) {
      setError("A quantidade deve ser maior que zero.")
      return false
    }

    if (newStock.targetPercentage <= 0 || newStock.targetPercentage > 100) {
      setError("O percentual META deve estar entre 0 e 100.")
      return false
    }

    return true
  }

  const handleAddStock = async () => {
    // Limpar mensagens de status
    setSuccess(false)
    setError(null)
    
    // Validar formulário
    if (!validateForm()) return
    
    // Iniciar processo de adição
    setIsSubmitting(true)
    
    try {
      // 1. Adicionar o ativo usando a função do componente pai
      await onAddStock(
        newStock.ticker.toUpperCase(),
        newStock.quantity,
        newStock.targetPercentage,
        newStock.userRecommendation,
      )
      
      // 2. Forçar a atualização da carteira para garantir sincronização
      setIsRefreshing(true)
      await refreshPortfolio()
      
      // 3. Mostrar mensagem de sucesso
      setSuccess(true)
      
      // 4. Limpar o formulário após adicionar com sucesso
      setNewStock({
        ticker: "",
        quantity: 0,
        targetPercentage: 0,
        userRecommendation: RECOMMENDATION_TYPES[0],
      })
      
      // 5. Manter a mensagem de sucesso por um tempo antes de limpar
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
      
    } catch (error) {
      console.error("Erro ao adicionar ação:", error)
      setError("Não foi possível adicionar a ação. Por favor, tente novamente.")
    } finally {
      setIsSubmitting(false)
      setIsRefreshing(false)
    }
  }

  // Função para forçar a atualização da carteira
  const handleRefreshPortfolio = async () => {
    setIsRefreshing(true)
    try {
      await refreshPortfolio()
    } catch (error) {
      console.error("Erro ao atualizar carteira:", error)
      setError("Não foi possível atualizar a carteira. Por favor, tente novamente.")
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (newStock.ticker) {
      const fetchPrice = async () => {
        try {
          const price = await fetchStockPrice(newStock.ticker)
          console.log(`Preço da ação ${newStock.ticker}: ${price}`)
        } catch (error) {
          console.error("Erro ao buscar preço da ação:", error)
        }
      }
      fetchPrice()
    }
  }, [newStock.ticker])

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Adicionar Novo Ativo</h3>
          
          {/* Botão para atualizar a carteira manualmente */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshPortfolio} 
            disabled={isRefreshing}
            title="Atualizar carteira"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Mensagem de sucesso */}
        {success && (
          <Alert className="mb-4 bg-green-500/10 text-green-500 border-green-500/50">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>Ativo adicionado com sucesso! Carteira atualizada.</span>
          </Alert>
        )}

        {/* Mensagem de erro */}
        {error && (
          <Alert className="mb-4 bg-destructive/10 text-destructive border-destructive/50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>{error}</span>
          </Alert>
        )}

        {/* Mensagem se não há ativos elegíveis */}
        {!hasEligibleStocks && (
          <Alert className="mb-4 bg-yellow-500/10 text-yellow-500 border-yellow-500/50">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span>Não há ativos elegíveis para investimento. Adicione recomendações aos seus ativos.</span>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Código do Ativo</Label>
            <Input
              value={newStock.ticker}
              onChange={(e) => handleChange("ticker", e.target.value.toUpperCase())}
              placeholder="Ex: PETR4"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="block text-sm font-medium mb-1">Quantidade</Label>
              <Input
                type="number"
                value={newStock.quantity || ""}
                onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
                min="0"
                placeholder="0"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label className="block text-sm font-medium mb-1">META (%)</Label>
              <Input
                type="number"
                value={newStock.targetPercentage || ""}
                onChange={(e) => handleChange("targetPercentage", Number.parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Minha Recomendação</Label>
            <Select
              value={newStock.userRecommendation}
              onValueChange={(value) => handleChange("userRecommendation", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma recomendação" />
              </SelectTrigger>
              <SelectContent>
                {RECOMMENDATION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full" 
            variant="outline" 
            onClick={handleAddStock} 
            disabled={isSubmitting || isRefreshing}
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ADICIONANDO...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                ADICIONAR ATIVO
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
