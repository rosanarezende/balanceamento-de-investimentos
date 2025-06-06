"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { usePortfolio } from "@/core/state/portfolio-context"

// Cores inspiradas no design Behance - tema dark com acentos vibrantes
const COLORS = [
  '#00D4FF', // Azul elétrico
  '#7C3AED', // Roxo vibrante  
  '#10B981', // Verde neon
  '#F59E0B', // Amarelo dourado
  '#EF4444', // Vermelho vibrante
  '#8B5CF6', // Lilás
  '#06B6D4', // Ciano
  '#F97316', // Laranja
]

export function GraficosCarteira() {
  const { stocksWithDetails } = usePortfolio()
  // Dados para o gráfico de pizza (composição atual)
  const pieData = stocksWithDetails.map((stock, index) => ({
    name: stock.ticker,
    value: stock.currentPercentage || 0,
    fill: COLORS[index % COLORS.length]
  }))

  // Dados para o gráfico de barras (atual vs meta)
  const barData = stocksWithDetails.map(stock => ({
    ticker: stock.ticker,
    atual: stock.currentPercentage || 0,
    meta: stock.targetPercentage,
    recomendacao: stock.userRecommendation
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Gráfico de Pizza - Composição Atual */}
      <div className="p-6 rounded-lg bg-slate-800/50">
        <h3 className="text-xl font-semibold text-white mb-4">Composição Atual</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Participação']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Barras - Atual vs Meta */}
      <div className="p-6 rounded-lg bg-slate-800/50">
        <h3 className="text-xl font-semibold text-white mb-4">Atual vs Meta</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="ticker" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
              />
              <Legend />
              <Bar dataKey="atual" name="% Atual" fill="#00D4FF" />
              <Bar dataKey="meta" name="% Meta" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
