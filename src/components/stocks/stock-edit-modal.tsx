"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { RECOMMENDATION_TYPES, RECOMMENDATION_DESCRIPTIONS, fetchStockPrice } from "@/lib/api"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StockEditModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: StockEditData) => Promise<void>
  stock: {
    ticker: string
    quantity: number
    targetPercentage: number
    userRecommendation: string
  } | null
  isNew?: boolean
}

export interface StockEditData {
  ticker: string
  quantity: number
  targetPercentage: number
  userRecommendation: string
}

export function StockEditModal({ open, onClose, onSave, stock, isNew = false }: StockEditModalProps) {
  const [formData, setFormData] = useState<StockEditData>({
    ticker: "",
    quantity: 0,
    targetPercentage: 0,
    userRecommendation: RECOMMENDATION_TYPES[0],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (stock) {
      setFormData({
        ticker: stock.ticker,
        quantity: stock.quantity,
        targetPercentage: stock.targetPercentage,
        userRecommendation: stock.userRecommendation,
      })
    } else if (isNew) {
      setFormData({
        ticker: "",
        quantity: 0,
        targetPercentage: 0,
        userRecommendation: RECOMMENDATION_TYPES[0],
      })
    }
  }, [stock, isNew])

  useEffect(() => {
    if (open && formData.ticker) {
      const fetchPrice = async () => {
        try {
          const price = await fetchStockPrice(formData.ticker)
          // eslint-disable-next-line no-console
          console.log(`Fetched price for ${formData.ticker}: ${price}`)
        } catch (err) {
          console.error(`Failed to fetch price for ${formData.ticker}:`, err)
        }
      }
      fetchPrice()
    }
  }, [open, formData.ticker])

  const handleChange = (field: keyof StockEditData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    setError(null)

    // Validação
    if (isNew && !formData.ticker) {
      setError("O código do ativo é obrigatório")
      return
    }

    if (typeof formData.quantity !== "number") {
      setError("A quantidade deve ser um número")
      return
    }

    if (formData.quantity <= 0) {
      setError("A quantidade deve ser maior que zero")
      return
    }

    if (formData.targetPercentage <= 0 || formData.targetPercentage > 100) {
      setError("O percentual META deve estar entre 0 e 100")
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
      onClose()
    } catch (err) {
      console.error("Erro ao salvar ativo:", err)
      setError("Ocorreu um erro ao salvar o ativo. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background-secondary border border-border-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Adicionar Novo Ativo" : `Editar Ativo: ${stock?.ticker}`}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-md bg-state-error/10 border border-state-error/20 text-state-error text-sm">
              {error}
            </div>
          )}

          {isNew && (
            <div className="space-y-2">
              <Label htmlFor="ticker">Código do Ativo</Label>
              <Input
                id="ticker"
                value={formData.ticker}
                onChange={(e) => handleChange("ticker", e.target.value.toUpperCase())}
                placeholder="Ex: PETR4"
                className="input-field"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              value={formData.quantity || ""}
              onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
              min="0"
              placeholder="0"
              className="input-field"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetPercentage">META (%)</Label>
            <Input
              id="targetPercentage"
              type="number"
              value={formData.targetPercentage || ""}
              onChange={(e) => handleChange("targetPercentage", Number.parseFloat(e.target.value) || 0)}
              min="0"
              max="100"
              step="0.01"
              placeholder="0.00"
              className="input-field"
            />
          </div>

          <div className="space-y-3">
            <Label>Minha Recomendação</Label>
            <RadioGroup
              value={formData.userRecommendation}
              onValueChange={(value) => handleChange("userRecommendation", value)}
              className="flex flex-col space-y-3"
            >
              {RECOMMENDATION_TYPES.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem value={type} id={`recommendation-${type}`} />
                  <Label
                    htmlFor={`recommendation-${type}`}
                    className={`font-normal ${
                      type === "Comprar"
                        ? "text-state-success"
                        : type === "Aguardar"
                          ? "text-state-warning"
                          : "text-state-error"
                    }`}
                  >
                    {type}
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="p-1 rounded-full text-text-tertiary hover:bg-background-tertiary">
                          <HelpCircle size={14} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          {RECOMMENDATION_DESCRIPTIONS[type as keyof typeof RECOMMENDATION_DESCRIPTIONS]}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
