"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
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

    // Navegar diretamente para o resultado
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
      <div className="container mx-auto max-w-md">
        <Card className="border-none shadow-none bg-card">
          <div className="p-4 flex items-center border-b border-border">
            <button onClick={handleBack} className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="font-medium text-foreground">Calculadora De Balanceamento</h1>
              <p className="text-xs text-muted-foreground">Calcule como reorganizar seus investimentos</p>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center gap-6">
              <h2 className="text-3xl font-bold text-center text-foreground">2º Passo</h2>

              <p className="text-lg text-muted-foreground text-center">
                Para iniciar a projeção de balanceamento você deve informar abaixo o valor que deseja investir
              </p>

              <div className="w-full">
                <div className="bg-background border border-input rounded-lg p-4 flex items-center">
                  <span className="text-muted-foreground text-2xl mr-2">R$</span>
                  <input
                    type="text"
                    className="flex-1 text-2xl outline-none bg-transparent text-foreground"
                    value={investmentValue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button className="w-full py-6 text-xl" size="lg" onClick={handleCalculate}>
                Calcular
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
