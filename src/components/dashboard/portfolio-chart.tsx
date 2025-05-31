"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { useTheme } from "next-themes"
import { generateChartColors } from "@/core/utils"
import { ErrorBoundary, ErrorDisplay } from "@/core/state/error-handling"

// Registrar os componentes necessários do Chart.js
Chart.register(...registerables)

interface PortfolioChartProps {
  data: {
    ticker: string
    currentPercentage: number
  }[]
  totalValue: number
}

function PortfolioChartContent({ data, totalValue }: PortfolioChartProps) {
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

    try {
      // Preparar dados para o gráfico
      const labels = data.map((item) => item.ticker)
      const percentages = data.map((item) => item.currentPercentage)

      // Obter cores baseadas no tema atual
      const themeColors = generateChartColors(data.length, theme === "dark")

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
                  const percentage = ((value / 100) * 100).toFixed(2)
                  return `${label}: ${percentage}%`
                },
              },
            },
          },
        },
      })
    } catch (error) {
      console.error("Erro ao renderizar gráfico:", error)
    }

    // Limpar ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, theme, totalValue])

  return (
    <div className="h-80">
      <canvas ref={chartRef} />
    </div>
  )
}

export function PortfolioChart({ data, totalValue }: PortfolioChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-card-foreground">Composição da Carteira</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível para exibição</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4 text-card-foreground">Composição da Carteira</h3>
      <ErrorBoundary
        fallback={
          <ErrorDisplay 
            message="Não foi possível renderizar o gráfico. Tente novamente mais tarde." 
          />
        }
      >
        <PortfolioChartContent data={data} totalValue={totalValue} />
      </ErrorBoundary>
    </div>
  )
}
