"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { clearStockPriceCache } from "@/lib/cache"

interface StockDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  ticker: string
}

export function StockDeleteModal({ open, onClose, onConfirm, ticker }: StockDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)

    try {
      setLoading(true)
      await onConfirm()
      onClose()
    } catch (err) {
      console.error("Erro ao excluir ativo:", err)
      setError("Ocorreu um erro ao excluir o ativo. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open && ticker) {
      clearStockPriceCache(ticker)
    }
  }, [open, ticker])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background-secondary border border-border-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-state-error" size={20} />
            Excluir Ativo
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="p-3 mb-4 rounded-md bg-state-error/10 border border-state-error/20 text-state-error text-sm">
              {error}
            </div>
          )}

          <p className="text-text-secondary">
            Tem certeza que deseja excluir o ativo <span className="font-bold text-text-primary">{ticker}</span> da sua
            carteira? Esta ação não pode ser desfeita.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
