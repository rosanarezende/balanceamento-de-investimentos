"use client"

// Adicionar a configuração dinâmica
export const dynamic = "force-dynamic"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"

export default function CalculadoraBalanceamento() {
  const [investmentValue, setInvestmentValue] = useState("00,00")
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  const handleCalculate = () => {
    const value = Number.parseFloat(investmentValue.replace(/[^\d,]/g, "").replace(",", "."))
    if (isNaN(value) || value <= 0) {
      alert("Por favor, insira um valor válido para o aporte.")
      return
    }

    // Navegar diretamente para o resultado (removemos a tela de recomendações BTG)
    router.push(`/calculadora-balanceamento/resultado?valor=${value}`)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Permitir apenas números e vírgula
    let value = e.target.value.replace(/[^\d,]/g, "")

    // Formatar como moeda
    if (value) {
      const number = Number.parseFloat(value.replace(",", "."))
      if (!isNaN(number)) {
        value = number
          .toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
          .replace(".", ",")
      }
    } else {
      value = "00,00"
    }

    setInvestmentValue(value)
  }

  return (
    <AuthGuard>
      <div className="bg-gray-100 min-h-screen">
        <div className="max-w-md mx-auto bg-white min-h-screen flex flex-col">
          <div className="p-4 flex items-center">
            <button onClick={handleBack} className="mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path
                  d="M12 19L5 12L12 5"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex-1 text-right">
              <h1 className="text-xl font-medium">Calculadora De Balanceamento</h1>
              <p className="text-sm text-gray-500">Calcule como reorganizar seus investimentos</p>
            </div>
          </div>

          <div className="flex-1 px-4 py-8 flex flex-col">
            <h2 className="text-4xl font-bold text-center mb-8">2º Passo</h2>

            <p className="text-xl text-gray-500 mb-12 text-center">
              Para iniciar a projeção de balanceamento você deve informar abaixo o valor que deseja investir no campo
              abaixo
            </p>

            <div className="mb-12">
              <div className="bg-white border rounded-lg p-4 flex items-center">
                <span className="text-gray-500 text-2xl mr-2">R$</span>
                <input
                  type="text"
                  className="flex-1 text-2xl outline-none"
                  value={investmentValue}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button className="bg-blue-600 text-white py-4 rounded-lg text-xl font-medium" onClick={handleCalculate}>
              Calcular
            </button>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
