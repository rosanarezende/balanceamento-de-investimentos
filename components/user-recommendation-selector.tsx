"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Edit } from "lucide-react"
import { RECOMMENDATION_TYPES } from "@/lib/api"

interface UserRecommendationSelectorProps {
  ticker: string
  currentRecommendation: string
  onUpdate: (recommendation: string) => void
}

export function UserRecommendationSelector({
  ticker,
  currentRecommendation,
  onUpdate,
}: UserRecommendationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>(
    currentRecommendation || RECOMMENDATION_TYPES[0],
  )

  const handleSave = () => {
    onUpdate(selectedRecommendation)
    setOpen(false)
  }

  // Determinar a cor com base na recomendação
  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Comprar":
        return "bg-green-100 text-green-600"
      case "Manter":
        return "bg-yellow-100 text-yellow-600"
      case "Evitar Aporte":
        return "bg-red-100 text-red-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center">
          <div
            className={`flex items-center text-xs px-2 py-1 rounded-full mr-1 ${getRecommendationColor(currentRecommendation)}`}
          >
            {currentRecommendation}
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full" aria-label="Editar recomendação">
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Minha Recomendação para {ticker}</DialogTitle>
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
                <Label
                  htmlFor={`recommendation-${type}`}
                  className={`font-normal ${
                    type === "Comprar" ? "text-green-600" : type === "Manter" ? "text-yellow-600" : "text-red-600"
                  }`}
                >
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
