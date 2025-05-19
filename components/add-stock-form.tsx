"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { RECOMMENDATION_TYPES } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface AddStockFormProps {
  onAddStock: (ticker: string, quantity: number, targetPercentage: number, userRecommendation: string) => Promise<void>
}

export function AddStockForm({ onAddStock }: AddStockFormProps) {
  const [newStock, setNewStock] = useState({
    ticker: "",
    quantity: 0,
    targetPercentage: 0,
    userRecommendation: RECOMMENDATION_TYPES[0],
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: string | number) => {
    setNewStock((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddStock = async () => {
    if (!newStock.ticker) {
      alert("Por favor, insira o código do ativo.")
      return
    }

    if (newStock.quantity <= 0) {
      alert("A quantidade deve ser maior que zero.")
      return
    }

    if (newStock.targetPercentage <= 0 || newStock.targetPercentage > 100) {
      alert("O percentual META deve estar entre 0 e 100.")
      return
    }

    setLoading(true)
    try {
      await onAddStock(
        newStock.ticker.toUpperCase(),
        newStock.quantity,
        newStock.targetPercentage,
        newStock.userRecommendation,
      )

      // Limpar o formulário após adicionar
      setNewStock({
        ticker: "",
        quantity: 0,
        targetPercentage: 0,
        userRecommendation: RECOMMENDATION_TYPES[0],
      })
    } catch (error) {
      console.error("Erro ao adicionar ação:", error)
      alert("Não foi possível adicionar a ação. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-medium mb-4">Adicionar Novo Ativo</h3>

        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-1">Código do Ativo</Label>
            <Input
              value={newStock.ticker}
              onChange={(e) => handleChange("ticker", e.target.value.toUpperCase())}
              placeholder="Ex: PETR4"
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
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium mb-1">Minha Recomendação</Label>
            <Select
              value={newStock.userRecommendation}
              onValueChange={(value) => handleChange("userRecommendation", value)}
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

          <Button className="w-full" variant="outline" onClick={handleAddStock} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            {loading ? "ADICIONANDO..." : "ADICIONAR ATIVO"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
