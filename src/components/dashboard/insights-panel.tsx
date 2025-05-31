"use client"

import { CardGlass } from "@/components/ui/card-glass"
import { SectionTitle } from "@/components/ui/section-title"
import { Lightbulb, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/core/utils"
import { ErrorBoundary } from "@/core/state/error-handling"

interface Insight {
  id: string
  message: string
  type: "info" | "warning" | "success"
}

interface InsightsPanelProps {
  insights: Insight[]
}

export function InsightsPanel({ insights: initialInsights }: InsightsPanelProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights)

  const dismissInsight = (id: string) => {
    setInsights(insights.filter((insight) => insight.id !== id))
  }

  if (insights.length === 0) return null

  return (
    <div className="mb-6 animate-fade-in">
      <ErrorBoundary fallback={null}>
        <CardGlass>
          <SectionTitle
            title="Equilibra Insights"
            subtitle="Dicas personalizadas para sua carteira"
            icon={<Lightbulb size={20} className="text-accent-quaternary" />}
          />

          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={cn(
                  "relative p-4 rounded-lg border-l-4 animate-slide-up",
                  insight.type === "info" && "bg-accent-primary/10 border-accent-primary",
                  insight.type === "warning" && "bg-accent-quaternary/10 border-accent-quaternary",
                  insight.type === "success" && "bg-accent-secondary/10 border-accent-secondary",
                )}
              >
                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-background-tertiary text-text-secondary"
                  aria-label="Dispensar"
                >
                  <X size={16} />
                </button>
                <p className="pr-6 text-sm">{insight.message}</p>
              </div>
            ))}
          </div>
        </CardGlass>
      </ErrorBoundary>
    </div>
  )
}
