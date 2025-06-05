"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { usePortfolio } from "@/core/state/portfolio-context"
import { ErrorBoundary, ErrorDisplay } from "@/core/state/error-handling"
import { isValidNumber } from "@/core/utils"

export function AddStockForm({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addStockToPortfolio, hasPendingOperations } = usePortfolio()
  const [ticker, setTicker] = useState("")
  const [quantity, setQuantity] = useState("")
  const [targetPercentage, setTargetPercentage] = useState("")
  const [recommendation, setRecommendation] = useState<"Comprar" | "Vender" | "Aguardar">("Comprar")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  console.log({ formError })

  // Validação para submissão com mensagens de erro
  const validateForSubmission = () => {
    setFormError(null)

    console.log({ ticker, quantity, targetPercentage, recommendation })

    if (!ticker.trim()) {
      setFormError("Código do ativo é obrigatório");
      return false;
    }

    const quantityNum = Number(quantity);
    if (!isValidNumber(quantityNum) || quantityNum <= 0) {
      setFormError("Quantidade deve ser um número positivo");
      return false;
    }

    const targetNum = Number(targetPercentage);
    if (!isValidNumber(targetNum) || targetNum <= 0 || targetNum > 100) {
      setFormError("Meta deve ser um número entre 0 e 100");
      return false;
    }

    return true;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("entrou no submit")

    if (!validateForSubmission()) return

    try {
      setIsSubmitting(true)

      const success = await addStockToPortfolio(ticker.toUpperCase(), {
        quantity: Number(quantity),
        targetPercentage: Number(targetPercentage),
        userRecommendation: recommendation,
      })

      if (success) {
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error("Erro ao adicionar ativo:", error)
      setFormError("Ocorreu um erro ao adicionar o ativo. Tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setTicker("")
    setQuantity("")
    setTargetPercentage("")
    setRecommendation("Comprar")
    setFormError(null)
  }

  const handleClose = () => {
    if (!isSubmitting && !hasPendingOperations) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ativo</DialogTitle>
        </DialogHeader>
        <ErrorBoundary fallback={
          <ErrorDisplay 
            message="Erro ao carregar formulário" 
            onRetry={() => window.location.reload()} 
          />
        }>
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <ErrorDisplay 
                message={formError} 
                onRetry={() => setFormError(null)} 
              />
            )}
            <div className="space-y-2">
              <Label htmlFor="ticker">Código do Ativo</Label>
              <Input
                id="ticker"
                placeholder="Ex: PETR4"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target">META (%)</Label>
              <Input
                id="target"
                type="number"
                placeholder="0.00"
                value={targetPercentage}
                onChange={(e) => setTargetPercentage(e.target.value)}
                disabled={isSubmitting}
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Minha Recomendação</Label>
              <RadioGroup
                value={recommendation}
                onValueChange={(value) => setRecommendation(value as "Comprar" | "Vender" | "Aguardar")}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Comprar" id="comprar" disabled={isSubmitting} />
                  <Label htmlFor="comprar">Comprar</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Vender" id="vender" disabled={isSubmitting} />
                  <Label htmlFor="vender">Vender</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Aguardar" id="aguardar" disabled={isSubmitting} />
                  <Label htmlFor="aguardar">Aguardar</Label>
                </div>
              </RadioGroup>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting || !!ticker.trim()}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  )
}
