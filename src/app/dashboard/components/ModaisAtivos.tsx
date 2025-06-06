"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { StockWithDetails } from "@/core/types"

interface FormData {
  ticker: string
  quantity: number
  targetPercentage: number
}

interface ModaisAtivosProps {
  // Modal de adicionar
  isAddModalOpen: boolean
  setIsAddModalOpen: (open: boolean) => void

  // Modal de editar
  isEditModalOpen: boolean
  setIsEditModalOpen: (open: boolean) => void

  // Modal de excluir
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (open: boolean) => void

  // Dados do formulário
  formData: FormData
  setFormData: (data: FormData) => void

  // Stock selecionado para edição/exclusão
  selectedStock: StockWithDetails | null

  // Funções de callback
  onSaveStock: () => void
  onDeleteStock: () => void
  onCloseModals: () => void
}

export function ModaisAtivos({
  isAddModalOpen,
  setIsAddModalOpen,
  isEditModalOpen,
  setIsEditModalOpen,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  formData,
  setFormData,
  selectedStock,
  onSaveStock,
  onDeleteStock,
  onCloseModals
}: ModaisAtivosProps) {
  return (
    <>
      {/* Modal de Adicionar Ativo */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Adicionar Ativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticker" className="text-slate-300">Ticker</Label>
              <Input
                id="ticker"
                placeholder="Ex: PETR4"
                className="bg-slate-800 border-slate-700 text-white"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label htmlFor="quantity" className="text-slate-300">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                className="bg-slate-800 border-slate-700 text-white"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="targetPercentage" className="text-slate-300">Percentual Alvo (%)</Label>
              <Input
                id="targetPercentage"
                type="number"
                className="bg-slate-800 border-slate-700 text-white"
                value={formData.targetPercentage || ""}
                onChange={(e) => setFormData({ ...formData, targetPercentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseModals}>Cancelar</Button>
            <Button onClick={onSaveStock}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Ativo */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Ativo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-ticker" className="text-slate-300">Ticker</Label>
              <Input
                id="edit-ticker"
                className="bg-slate-800 border-slate-700 text-white"
                value={formData.ticker}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="edit-quantity" className="text-slate-300">Quantidade</Label>
              <Input
                id="edit-quantity"
                type="number"
                className="bg-slate-800 border-slate-700 text-white"
                value={formData.quantity || ""}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="edit-targetPercentage" className="text-slate-300">Percentual Alvo (%)</Label>
              <Input
                id="edit-targetPercentage"
                type="number"
                className="bg-slate-800 border-slate-700 text-white"
                value={formData.targetPercentage || ""}
                onChange={(e) => setFormData({ ...formData, targetPercentage: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseModals}>Cancelar</Button>
            <Button onClick={onSaveStock}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Excluir Ativo */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Excluir Ativo</DialogTitle>
          </DialogHeader>
          <p className="text-slate-300">
            Tem certeza que deseja excluir o ativo <span className="font-bold text-white">{selectedStock?.ticker}</span>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={onCloseModals}>Cancelar</Button>
            <Button variant="destructive" onClick={onDeleteStock}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
