"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { verifyStockExists } from "@/lib/firestore"

interface WatchlistEditModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: WatchlistEditData) => Promise<void>
  item: {
    ticker: string
    targetPrice: number | null
    notes: string
  } | null
  isNew?: boolean
}

export interface WatchlistEditData {
  ticker: string
  targetPrice: number | null
  notes: string
}

export function WatchlistEditModal({ open, onClose, onSave, item, isNew = false }: WatchlistEditModalProps) {
  const [formData, setFormData] = useState<WatchlistEditData>({
    ticker: "",
    targetPrice: null,
    notes: "",
  })
  const [hasTargetPrice, setHasTargetPrice] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item) {
      setFormData({
        ticker: item.ticker,
        targetPrice: item.targetPrice,
        notes: item.notes,
      })
      setHasTargetPrice(item.targetPrice !== null)
    } else if (isNew) {
      setFormData({
        ticker: "",
        targetPrice: null,
        notes: "",
      })
      setHasTargetPrice(false)
    }
  }, [item, isNew])

  const handleChange = (field: keyof WatchlistEditData, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTargetPriceToggle = (checked: boolean) => {
    setHasTargetPrice(checked)
    if (!checked) {
      handleChange("targetPrice", null)
    } else {
      handleChange("targetPrice", 0)
    }
  }

  const handleSubmit = async () => {
    setError(null)

    // Validação
    if (isNew && !formData.ticker) {
      setError("O código do ativo é obrigatório")
      return
    }

    if (hasTargetPrice && (formData.targetPrice === null || formData.targetPrice <= 0)) {
      setError("O preço alvo deve ser maior que zero")
      return
    }

    try {
      setLoading(true)
      await onSave(formData)
      onClose()
    } catch (err) {
      console.error("Erro ao salvar item da watchlist:", err)
      setError("Ocorreu um erro ao salvar o item. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background-secondary border border-border-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isNew ? "Adicionar à Watchlist" : `Editar Item: ${item?.ticker}`}</DialogTitle>
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

          <div className="flex items-center justify-between">
            <Label htmlFor="hasTargetPrice" className="cursor-pointer">
              Definir Preço Alvo
            </Label>
            <Switch id="hasTargetPrice" checked={hasTargetPrice} onCheckedChange={handleTargetPriceToggle} />
          </div>

          {hasTargetPrice && (
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Preço Alvo (R$)</Label>
              <Input
                id="targetPrice"
                type="number"
                value={formData.targetPrice || ""}
                onChange={(e) => handleChange("targetPrice", Number.parseFloat(e.target.value) || 0)}
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="input-field"
              />
              <p className="text-xs text-text-tertiary">
                Você receberá um alerta visual quando o preço atual estiver próximo ou atingir este valor.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Adicione suas observações sobre este ativo..."
              className="input-field min-h-[100px]"
            />
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
