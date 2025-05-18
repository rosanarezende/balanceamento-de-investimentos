"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Simulação de dados históricos
const historicalSimulations = [
  {
    id: 1,
    date: new Date(2023, 4, 15),
    investmentAmount: 5000,
    portfolioValueBefore: 18500,
    portfolioValueAfter: 23500,
  },
  {
    id: 2,
    date: new Date(2023, 5, 20),
    investmentAmount: 3000,
    portfolioValueBefore: 23500,
    portfolioValueAfter: 26500,
  },
  {
    id: 3,
    date: new Date(2023, 6, 10),
    investmentAmount: 2000,
    portfolioValueBefore: 26500,
    portfolioValueAfter: 28500,
  },
]

export default function Historico() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleViewDetails = (id: number) => {
    // Aqui seria implementada a navegação para os detalhes da simulação
    router.push(`/historico/${id}`)
  }

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <Button variant="ghost" size="icon" className="mb-4" onClick={handleBack} aria-label="Voltar">
        <ArrowLeft className="h-6 w-6" />
      </Button>

      <h1 className="text-2xl font-bold mb-6">Histórico de Simulações</h1>

      {historicalSimulations.length > 0 ? (
        <div className="space-y-4">
          {historicalSimulations.map((simulation) => (
            <Card key={simulation.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Simulação #{simulation.id}</h3>
                  <span className="text-sm text-gray-500">{formatDate(simulation.date)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div className="text-gray-600">Valor do aporte:</div>
                  <div className="font-medium text-right">{formatCurrency(simulation.investmentAmount)}</div>

                  <div className="text-gray-600">Valor anterior:</div>
                  <div className="font-medium text-right">{formatCurrency(simulation.portfolioValueBefore)}</div>

                  <div className="text-gray-600">Valor após aporte:</div>
                  <div className="font-medium text-right">{formatCurrency(simulation.portfolioValueAfter)}</div>
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={() => handleViewDetails(simulation.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhuma simulação encontrada.</p>
        </div>
      )}
    </div>
  )
}
