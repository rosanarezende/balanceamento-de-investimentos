"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Plus, Save, Trash } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { saveStockToDatabase, validateUserInput, verifyStockExists } from "@/lib/firestore"

// Tipo para representar uma ação na carteira
interface Stock {
  ticker: string
  quantity: number
  targetPercentage: number
}

// Dados iniciais da carteira
const initialStocks: Stock[] = [
  { ticker: "RANI3", quantity: 26, targetPercentage: 11.0 },
  { ticker: "ITUB4", quantity: 40, targetPercentage: 10.0 },
  { ticker: "PETR4", quantity: 32, targetPercentage: 15.0 },
  { ticker: "VALE3", quantity: 18, targetPercentage: 12.0 },
  { ticker: "BBDC4", quantity: 55, targetPercentage: 9.0 },
  { ticker: "MGLU3", quantity: 300, targetPercentage: 8.0 },
  { ticker: "WEGE3", quantity: 25, targetPercentage: 20.0 },
  { ticker: "BBAS3", quantity: 30, targetPercentage: 15.0 },
]

export default function EditarAtivos() {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks)
  const [newStock, setNewStock] = useState<Stock>({ ticker: "", quantity: 0, targetPercentage: 0 })
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleSave = async () => {
    // Verificar se a soma dos percentuais é 100%
    const totalPercentage = stocks.reduce((sum, stock) => sum + stock.targetPercentage, 0)

    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError(`A soma dos percentuais META deve ser 100%. Atualmente é ${totalPercentage.toFixed(2)}%.`)
      return
    }

    try {
      await Promise.all(stocks.map(stock => saveStockToDatabase(stock)))
      router.push("/")
    } catch (err) {
      console.error("Erro ao salvar ações no banco de dados:", err)
      setError("Ocorreu um erro ao salvar as ações. Por favor, tente novamente.")
    }
  }

  const handleStockChange = async (index: number, field: keyof Stock, value: string) => {
    const updatedStocks = [...stocks]

    if (field === "ticker") {
      updatedStocks[index].ticker = value.toUpperCase()
    } else if (field === "quantity") {
      const quantity = Number.parseInt(value) || 0
      if (quantity <= 0) {
        setError("A quantidade deve ser maior que zero.")
        return
      }
      updatedStocks[index].quantity = quantity
    } else if (field === "targetPercentage") {
      updatedStocks[index].targetPercentage = Number.parseFloat(value) || 0
    }

    setStocks(updatedStocks)

    try {
      await saveStockToDatabase(updatedStocks[index])
    } catch (err) {
      console.error("Erro ao salvar ação no banco de dados:", err)
      setError("Ocorreu um erro ao salvar a ação. Por favor, tente novamente.")
    }
  }

  const handleRemoveStock = (index: number) => {
    try {
      const updatedStocks = [...stocks]
      updatedStocks.splice(index, 1)
      setStocks(updatedStocks)
    } catch (err) {
      console.error("Erro ao remover ação:", err)
      setError("Ocorreu um erro ao remover a ação. Por favor, tente novamente.")
    }
  }

  const handleNewStockChange = (field: keyof Stock, value: string) => {
    const updatedNewStock = { ...newStock }

    if (field === "ticker") {
      updatedNewStock.ticker = value.toUpperCase()
    } else if (field === "quantity") {
      updatedNewStock.quantity = Number.parseInt(value) || 0
    } else if (field === "targetPercentage") {
      updatedNewStock.targetPercentage = Number.parseFloat(value) || 0
    }

    setNewStock(updatedNewStock)
  }

  const handleAddStock = async () => {
    if (!newStock.ticker) {
      setError("Por favor, insira o código do ativo.")
      return
    }

    if (stocks.some((stock) => stock.ticker === newStock.ticker)) {
      setError("Este ativo já existe na sua carteira.")
      return
    }

    if (newStock.quantity <= 0) {
      setError("A quantidade deve ser maior que zero.")
      return
    }

    try {
      const stockExists = await verifyStockExists(newStock.ticker)
      if (!stockExists) {
        setError("O ativo não existe.")
        return
      }

      validateUserInput(newStock)
      setStocks([...stocks, newStock])
      setNewStock({ ticker: "", quantity: 0, targetPercentage: 0 })
      setError(null)
    } catch (validationError) {
      console.error("Erro ao adicionar novo ativo:", validationError)
      setError(validationError.message)
    }
  }

  // Calcular o total dos percentuais META
  const totalTargetPercentage = stocks.reduce((sum, stock) => sum + stock.targetPercentage, 0)

  return (
    <AppShell>
      <div className="container max-w-md mx-auto px-4 py-6">
        <Button variant="ghost" size="icon" className="mb-4" onClick={handleBack} aria-label="Voltar">
          <ArrowLeft className="h-6 w-6" />
        </Button>

        <h1 className="text-2xl font-bold mb-6">Editar Ativos Manualmente</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          {stocks.map((stock, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-[1fr,auto] gap-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Código do Ativo</label>
                      <Input
                        value={stock.ticker}
                        onChange={(e) => handleStockChange(index, "ticker", e.target.value)}
                        placeholder="Ex: PETR4"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantidade</label>
                        <Input
                          type="number"
                          value={stock.quantity}
                          onChange={(e) => handleStockChange(index, "quantity", e.target.value)}
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">META (%)</label>
                        <Input
                          type="number"
                          value={stock.targetPercentage}
                          onChange={(e) => handleStockChange(index, "targetPercentage", e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start pt-8">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveStock(index)}
                      aria-label="Remover ativo"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Adicionar Novo Ativo</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código do Ativo</label>
                <Input
                  value={newStock.ticker}
                  onChange={(e) => handleNewStockChange("ticker", e.target.value)}
                  placeholder="Ex: PETR4"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade</label>
                  <Input
                    type="number"
                    value={newStock.quantity || ""}
                    onChange={(e) => handleNewStockChange("quantity", e.target.value)}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">META (%)</label>
                  <Input
                    type="number"
                    value={newStock.targetPercentage || ""}
                    onChange={(e) => handleNewStockChange("targetPercentage", e.target.value)}
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <Button className="w-full" variant="outline" onClick={handleAddStock}>
                <Plus className="mr-2 h-4 w-4" />
                ADICIONAR ATIVO
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total META:</span>
            <span
              className={`font-bold ${Math.abs(totalTargetPercentage - 100) > 0.01 ? "text-red-600" : "text-green-600"}`}
            >
              {totalTargetPercentage.toFixed(2)}%
            </span>
          </div>
          {Math.abs(totalTargetPercentage - 100) > 0.01 && (
            <p className="text-red-600 text-sm mt-2">A soma dos percentuais META deve ser 100%.</p>
          )}
        </div>

        <Button className="w-full" size="lg" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          SALVAR ALTERAÇÕES
        </Button>

        <div className="mt-4">
          <Button className="w-full" size="lg" onClick={() => router.push("/editar-ativos")}>
            <Save className="mr-2 h-4 w-4" />
            Acessar Edição de Ativos
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
