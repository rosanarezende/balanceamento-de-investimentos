"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { theme } from "@/styles/theme"

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

export function PortfolioComparisonChart({ data }: PortfolioComparisonChartProps) {
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
    const currentPercentages = data.map((item) => item.currentPercentage)
    const targetPercentages = data.map((item) => item.targetPercentage)

    // Criar o gráfico
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Composição Atual (%)",
            data: currentPercentages,
            backgroundColor: theme.colors.accent.primary,
            borderColor: theme.colors.accent.primary,
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: "Meta (%)",
            data: targetPercentages,
            backgroundColor: theme.colors.accent.secondary,
            borderColor: theme.colors.accent.secondary,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: theme.colors.border.secondary,
            },
            ticks: {
              color: theme.colors.text.secondary,
              callback: (value) => `${value}%`,
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: theme.colors.text.secondary,
            },
          },
        },
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
                const label = context.dataset.label || ""
                const value = context.raw as number
                return `${label}: ${value.toFixed(2)}%`
              },
            },
          },
        },
        animation: {
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
  }, [data])

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
