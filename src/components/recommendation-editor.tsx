"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { RECOMMENDATION_TYPES, saveManualRecommendation } from "@/lib/api"

interface RecommendationEditorProps {
  ticker: string
  currentRecommendation: string
  onUpdate: (recommendation: string) => void
}

export function RecommendationEditor({ ticker, currentRecommendation, onUpdate }: RecommendationEditorProps) {
  const [open, setOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>(
    currentRecommendation || RECOMMENDATION_TYPES[0],
  )

  const handleSave = async () => {
    await saveManualRecommendation(ticker, selectedRecommendation)
    onUpdate(selectedRecommendation)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" aria-label="Editar recomendação">
          <Edit className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Recomendação BTG para {ticker}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioGroup
            value={selectedRecommendation}
            onValueChange={setSelectedRecommendation}
            className="flex flex-col space-y-3"
          >
            {RECOMMENDATION_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <RadioGroupItem value={type} id={`recommendation-${type}`} />
                <Label htmlFor={`recommendation-${type}`} className="font-normal">
                  {type}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Salvar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
