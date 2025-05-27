"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "@/contexts/theme-context"

// Registrar os componentes necessários do Chart.js
Chart.register(...registerables)

interface PortfolioChartProps {
  data: {
    ticker: string
    currentPercentage: number
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
    const percentages = data.map((item) => item.currentPercentage)

    // Cores para o tema claro e escuro
    const colors = {
      light: [
        "rgba(59, 130, 246, 0.6)",
        "rgba(16, 185, 129, 0.6)",
        "rgba(139, 92, 246, 0.6)",
        "rgba(245, 158, 11, 0.6)",
        "rgba(236, 72, 153, 0.6)",
        "rgba(6, 182, 212, 0.6)",
        "rgba(239, 68, 68, 0.6)",
        "rgba(167, 139, 250, 0.6)",
      ],
      dark: [
        "rgba(96, 165, 250, 0.6)",
        "rgba(52, 211, 153, 0.6)",
        "rgba(165, 105, 246, 0.6)",
        "rgba(245, 158, 11, 0.6)",
        "rgba(236, 72, 153, 0.6)",
        "rgba(6, 182, 212, 0.6)",
        "rgba(239, 68, 68, 0.6)",
        "rgba(167, 139, 250, 0.6)",
      ],
    }

    // Selecionar cores com base no tema
    const themeColors = theme === "dark" ? colors.dark : colors.light

    // Criar o gráfico
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            data: percentages,
            backgroundColor: themeColors,
            borderColor: themeColors,
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
              color: theme === "dark" ? "#f3f4f6" : "#1f2937",
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
                return `${label}: ${percentage}%`
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
  }, [data, theme, totalValue])

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4 text-card-foreground">Composição da Carteira</h3>
      <div className="h-80">
        <canvas ref={chartRef} />
      </div>
    </div>
  )
}
