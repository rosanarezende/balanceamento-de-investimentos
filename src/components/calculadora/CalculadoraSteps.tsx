"use client"

import React from 'react'
import { StepIndicator } from './StepIndicator'
import { Card, CardContent } from "@/components/ui/card"
import { portfolioColors } from "@/styles/portfolio-theme"

interface CalculadoraStepsProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}

/**
 * Componente que encapsula o conteúdo de cada etapa da calculadora
 * com indicador de progresso, título e descrição padronizados
 */
export const CalculadoraSteps: React.FC<CalculadoraStepsProps> = ({
  currentStep,
  totalSteps,
  title,
  description,
  children
}) => {
  return (
    <Card className="border-none shadow-none bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center gap-6">
          <StepIndicator 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />

          <h2 className={`text-2xl font-bold text-center ${portfolioColors.title}`}>
            {title}
          </h2>

          {description && (
            <p className={`text-base text-center ${portfolioColors.subtitle}`}>
              {description}
            </p>
          )}

          {children}
        </div>
      </CardContent>
    </Card>
  )
}

export default CalculadoraSteps
