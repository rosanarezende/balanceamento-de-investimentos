"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface WatchlistDeleteModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  ticker: string
}

export function WatchlistDeleteModal({ open, onClose, onConfirm, ticker }: WatchlistDeleteModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)

    try {
      setLoading(true)
      await onConfirm()
      onClose()
    } catch (err) {
      console.error("Erro ao excluir item da watchlist:", err)
      setError("Ocorreu um erro ao excluir o item. Por favor, tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background-secondary border border-border-primary sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="text-state-error" size={20} />
            Remover da Watchlist
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {error && (
            <div className="p-3 mb-4 rounded-md bg-state-error/10 border border-state-error/20 text-state-error text-sm">
              {error}
            </div>
          )}

          <p className="text-text-secondary">
            Tem certeza que deseja remover o ativo <span className="font-bold text-text-primary">{ticker}</span> da sua
            lista de observação? Esta ação não pode ser desfeita.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={loading}>
            {loading ? "Removendo..." : "Remover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
