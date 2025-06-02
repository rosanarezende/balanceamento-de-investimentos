"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

import { ErrorBoundary, ErrorDisplay } from "@/core/state/error-handling"
import { useTheme } from "@/core/state/theme-context"

// Registrar os componentes necessários do Chart.js
Chart.register(...registerables)

interface PortfolioComparisonChartProps {
  data: {
    ticker: string
    currentValue: number
    currentPercentage: number
    targetPercentage: number
  }[]
}

function PortfolioComparisonChartContent({ data }: PortfolioComparisonChartProps) {
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
      const currentPercentages = data.map((item) => item.currentPercentage)
      const targetPercentages = data.map((item) => item.targetPercentage)

      // Cores para o tema claro e escuro
      const colors = {
        light: {
          current: "rgba(59, 130, 246, 0.6)",
          target: "rgba(16, 185, 129, 0.6)",
          text: "#1f2937",
          grid: "rgba(0, 0, 0, 0.1)",
        },
        dark: {
          current: "rgba(96, 165, 250, 0.6)",
          target: "rgba(52, 211, 153, 0.6)",
          text: "#f3f4f6",
          grid: "rgba(255, 255, 255, 0.1)",
        },
      }

      // Selecionar cores com base no tema
      const themeColors = theme === "dark" ? colors.dark : colors.light

      // Criar o gráfico
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Composição Atual (%)",
              data: currentPercentages,
              backgroundColor: themeColors.current,
              borderColor: themeColors.current,
              borderWidth: 1,
            },
            {
              label: "Meta (%)",
              data: targetPercentages,
              backgroundColor: themeColors.target,
              borderColor: themeColors.target,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: themeColors.text,
                callback: (value) => `${value}%`,
              },
              grid: {
                color: themeColors.grid,
              },
            },
            x: {
              ticks: {
                color: themeColors.text,
              },
              grid: {
                color: themeColors.grid,
              },
            },
          },
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
                  const label = context.dataset.label || ""
                  const value = context.raw as number
                  return `${label}: ${value.toFixed(2)}%`
                },
              },
            },
          },
        },
      })
    } catch (error) {
      console.error("Erro ao renderizar gráfico de comparação:", error)
    }

    // Limpar ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, theme])

  return (
    <div className="h-80">
      <canvas ref={chartRef} />
    </div>
  )
}

export function PortfolioComparisonChart({ data }: PortfolioComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-card-foreground">Comparação: Atual vs. Meta</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">Nenhum dado disponível para comparação</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4 text-card-foreground">Comparação: Atual vs. Meta</h3>
      <ErrorBoundary
        fallback={
          <ErrorDisplay 
            message="Não foi possível renderizar o gráfico de comparação. Tente novamente mais tarde." 
          />
        }
      >
        <PortfolioComparisonChartContent data={data} />
      </ErrorBoundary>
    </div>
  )
}
