"use client"

import React, { useState } from 'react'
import { BalanceSimulationResult } from '@/core/types/portfolio'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockDetailCard } from '@/components/calculadora/StockDetailCard'
import { RecommendationCard } from '@/components/calculadora/RecommendationCard'
import { SimulationSummaryCard } from '@/components/calculadora/SimulationSummaryCard'
import { portfolioColors } from "@/styles/portfolio-theme"

interface SimulationResultsProps {
  result: BalanceSimulationResult;
  onReset: () => void;
}

/**
 * Componente de exibição dos resultados da simulação de balanceamento
 * com suporte aos novos campos (preço teto, preço médio e notas fundamentais)
 */
export const SimulationResults: React.FC<SimulationResultsProps> = ({ 
  result,
  onReset
}) => {
  const [activeTab, setActiveTab] = useState<string>("recomendacoes");
  
  // Ordena as recomendações por valor de investimento (decrescente)
  const sortedRecommendations = [...result.recommendations].sort(
    (a, b) => b.recommendedInvestment - a.recommendedInvestment
  );
  
  // Filtra recomendações com investimento > 0
  const activeRecommendations = sortedRecommendations.filter(
    rec => rec.recommendedInvestment > 0
  );
  
  // Filtra recomendações com investimento = 0
  const inactiveRecommendations = sortedRecommendations.filter(
    rec => rec.recommendedInvestment === 0
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${portfolioColors.title}`}>
            Resultado da Simulação
          </h2>
          <p className="text-muted-foreground mt-1">
            Confira as recomendações de balanceamento para sua carteira
          </p>
        </div>
        
        <Button variant="outline" onClick={onReset}>
          Nova Simulação
        </Button>
      </div>
      
      <SimulationSummaryCard result={result} />
      
      <Tabs 
        defaultValue="recomendacoes" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="recomendacoes">Recomendações</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes da Carteira</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recomendacoes" className="mt-6">
          <div className="space-y-6">
            {activeRecommendations.length > 0 ? (
              <>
                <h3 className={`text-lg font-semibold ${portfolioColors.subtitle}`}>
                  Ativos Recomendados para Aporte
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecommendations.map(recommendation => (
                    <RecommendationCard
                      key={recommendation.ticker}
                      recommendation={recommendation}
                      investmentAmount={result.totalInvestment}
                    />
                  ))}
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Não há recomendações de aporte para os critérios atuais.
                  </p>
                </CardContent>
              </Card>
            )}
            
            {inactiveRecommendations.length > 0 && (
              <>
                <h3 className={`text-lg font-semibold ${portfolioColors.subtitle} mt-8`}>
                  Ativos Sem Recomendação de Aporte
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inactiveRecommendations.map(recommendation => (
                    <RecommendationCard
                      key={recommendation.ticker}
                      recommendation={recommendation}
                      investmentAmount={result.totalInvestment}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="detalhes" className="mt-6">
          <div className="space-y-6">
            <h3 className={`text-lg font-semibold ${portfolioColors.subtitle}`}>
              Detalhes dos Ativos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.values(result.recommendations).map(rec => {
                const stock = {
                  ticker: rec.ticker,
                  quantity: 0, // Placeholder
                  targetPercentage: rec.targetAllocation,
                  currentPercentage: rec.currentAllocation,
                  currentPrice: 0, // Placeholder
                  currentValue: 0, // Placeholder
                  difference: 0, // Placeholder
                  userRecommendation: rec.userRecommendation,
                  // Novos campos
                  precoTetoUsuario: rec.precoTetoUsuario,
                  precoMedioCompra: rec.precoMedioCompra,
                  notasFundamentos: '', // Placeholder
                  isAboveCeilingPrice: rec.isAboveCeilingPrice,
                  yieldOnCost: rec.yieldOnCost
                };
                
                return (
                  <StockDetailCard
                    key={rec.ticker}
                    stock={stock}
                  />
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationResults;
