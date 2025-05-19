"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "@/contexts/theme-context"

// Registrar os componentes necessários do Chart.js
Chart.register(...registerables)

interface PortfolioChartProps {
  data: {
    ticker: string
    currentValue: number
    currentPercentage: number
    targetPercentage: number
  }[]
  totalValue: number
}

export function PortfolioChart({ data, totalValue }: PortfolioChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Destruir o gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Preparar dados para o gráfico
    const labels = data.map((item) => item.ticker)
    const currentValues = data.map((item) => item.currentValue)
    const targetValues = data.map((item) => (item.targetPercentage / 100) * totalValue)

    // Cores para o tema claro e escuro
    const colors = {
      light: {
        current: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(14, 165, 233, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        target: [
          "rgba(59, 130, 246, 0.4)",
          "rgba(16, 185, 129, 0.4)",
          "rgba(245, 158, 11, 0.4)",
          "rgba(239, 68, 68, 0.4)",
          "rgba(139, 92, 246, 0.4)",
          "rgba(236, 72, 153, 0.4)",
          "rgba(14, 165, 233, 0.4)",
          "rgba(168, 85, 247, 0.4)",
        ],
        text: "#1f2937",
      },
      dark: {
        current: [
          "rgba(96, 165, 250, 0.8)",
          "rgba(52, 211, 153, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(248, 113, 113, 0.8)",
          "rgba(167, 139, 250, 0.8)",
          "rgba(244, 114, 182, 0.8)",
          "rgba(56, 189, 248, 0.8)",
          "rgba(192, 132, 252, 0.8)",
        ],
        target: [
          "rgba(96, 165, 250, 0.4)",
          "rgba(52, 211, 153, 0.4)",
          "rgba(251, 191, 36, 0.4)",
          "rgba(248, 113, 113, 0.4)",
          "rgba(167, 139, 250, 0.4)",
          "rgba(244, 114, 182, 0.4)",
          "rgba(56, 189, 248, 0.4)",
          "rgba(192, 132, 252, 0.4)",
        ],
        text: "#f3f4f6",
      },
    }

    // Selecionar cores com base no tema
    const themeColors = theme === "dark" ? colors.dark : colors.light

    // Criar o gráfico
    chartInstance.current = new Chart(ctx, {
      type: "pie",
      data: {
        labels,
        datasets: [
          {
            label: "Composição Atual",
            data: currentValues,
            backgroundColor: themeColors.current,
            borderColor: "rgba(255, 255, 255, 0.8)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: themeColors.text,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const percentage = ((value / totalValue) * 100).toFixed(2)
                return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`
              },
            },
          },
        },
      },
    })

    // Limpar ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, totalValue, theme])

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4 text-card-foreground">Composição da Carteira</h3>
      <div className="aspect-square">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
