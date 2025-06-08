"use client"

import { ChevronUp, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/core/utils"
import { MetricasCards } from "./MetricasCards"
import { GraficosCarteira } from "./GraficosCarteira"

interface ResumoCarteiraProps {
  isExpanded: boolean
  onToggleExpanded: () => void
}

export function ResumoCarteira({
  isExpanded,
  onToggleExpanded
}: ResumoCarteiraProps) {
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <CardHeader
        className="cursor-pointer"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl text-white">Resumo da Carteira</CardTitle>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>

      <CardContent className={cn("transition-all duration-300", !isExpanded ? "hidden" : "")}>
        {/* Métricas principais */}
        <MetricasCards />

        {/* Gráficos */}
        <GraficosCarteira />
      </CardContent>
    </Card>
  )
}
