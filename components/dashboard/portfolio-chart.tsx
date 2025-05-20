"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { theme } from "@/styles/theme"

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

    // Criar o gráfico
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [
          {
            label: "Composição Atual",
            data: currentValues,
            backgroundColor: theme.colors.chart,
            borderColor: "rgba(31, 41, 55, 0.8)",
            borderWidth: 1,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: theme.colors.text.primary,
              font: {
                size: 12,
              },
              padding: 20,
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            backgroundColor: theme.colors.background.tertiary,
            titleColor: theme.colors.text.primary,
            bodyColor: theme.colors.text.secondary,
            borderColor: theme.colors.border.primary,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || ""
                const value = context.raw as number
                const percentage = ((value / totalValue) * 100).toFixed(2)
                return `${label}: R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${percentage}%)`
              },
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
        },
      },
    })

    // Limpar ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data, totalValue])

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
