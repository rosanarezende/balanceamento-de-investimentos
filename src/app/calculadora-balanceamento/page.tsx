"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { CalculadoraHeader } from '@/components/calculadora/CalculadoraHeader'
import { StepIndicator } from '@/components/calculadora/StepIndicator'
import { InvestmentInput } from '@/components/calculadora/InvestmentInput'
import { SimulationResults } from '@/components/calculadora/SimulationResults'
import { mockPortfolioData } from '@/core/utils/development'
import { calculatePortfolioDetails, calculateBalanceRecommendations, calculateSimulationResult } from '@/core/utils/calculator'
import { portfolioColors } from "@/styles/portfolio-theme"

/**
 * Página da calculadora de balanceamento com suporte aos novos campos
 * (preço teto, preço médio e notas fundamentais)
 */
export default function CalculadoraBalanceamento() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Função para simular o balanceamento
  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simula uma chamada de API com delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Preços simulados para desenvolvimento
      const mockPrices: Record<string, number> = {
        'AAPL': 20.50,
        'GOOGL': 32.75,
        'MSFT': 38.20,
        'AMZN': 42.30,
        'TSLA': 65.40
      };
      
      // Calcula detalhes do portfólio
      const portfolioWithDetails = calculatePortfolioDetails(mockPortfolioData, mockPrices);
      
      // Calcula recomendações de balanceamento
      const recommendations = calculateBalanceRecommendations(portfolioWithDetails, investmentAmount);
      
      // Calcula resultado da simulação
      const result = calculateSimulationResult(portfolioWithDetails, recommendations, investmentAmount);
      
      setSimulationResult(result);
      setStep(2);
    } catch (err) {
      console.error('Erro ao simular balanceamento:', err);
      setError('Ocorreu um erro ao processar a simulação. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para resetar a simulação
  const handleReset = () => {
    setStep(1);
    setInvestmentAmount(0);
    setSimulationResult(null);
    setError(null);
  };

  return (
    <div className="container py-6 space-y-8">
      <CalculadoraHeader 
        title="Calculadora de Balanceamento"
        description="Simule o balanceamento ideal da sua carteira com base no valor que deseja investir"
      />
      
      <StepIndicator 
        steps={['Valor a Investir', 'Resultado da Simulação']}
        currentStep={step}
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {step === 1 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-bold ${portfolioColors.title}`}>
                  Informe o valor a investir
                </h2>
                <p className="text-muted-foreground mt-1">
                  Este valor será distribuído entre os ativos da sua carteira de acordo com as metas de alocação
                </p>
              </div>
              
              <InvestmentInput
                value={investmentAmount}
                onChange={setInvestmentAmount}
                onSubmit={handleSimulate}
                isLoading={isLoading}
              />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/dashboard')}
                >
                  Voltar para Dashboard
                </Button>
                
                <Button 
                  onClick={handleSimulate}
                  disabled={investmentAmount <= 0 || isLoading}
                >
                  {isLoading ? "Calculando..." : "Calcular Balanceamento"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <SimulationResults 
          result={simulationResult}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
