import React, { memo, useMemo } from 'react';
import { StockWithDetails } from '@/hooks/use-portfolio';

/**
 * Componente de item de ação memoizado para evitar renderizações desnecessárias
 * Implementa memoização para melhorar a performance
 */
interface StockItemProps {
  stock: StockWithDetails;
  onSelect?: (ticker: string) => void;
}

/**
 * Componente memoizado para exibir um item de ação individual
 * Só será renderizado novamente se as props mudarem
 */
export const StockItem = memo(function StockItem({ stock, onSelect }: StockItemProps) {
  // Calcular classes CSS com base na diferença entre percentual atual e meta
  const percentageDiff = stock.currentPercentage - stock.targetPercentage;
  const diffClass = useMemo(() => {
    if (Math.abs(percentageDiff) < 1) return 'text-gray-600'; // Próximo da meta
    return percentageDiff > 0 ? 'text-green-600' : 'text-red-600'; // Acima ou abaixo da meta
  }, [percentageDiff]);

  // Calcular classe para recomendação
  const recommendationClass = useMemo(() => {
    switch (stock.userRecommendation) {
      case 'Comprar': return 'bg-green-100 text-green-800';
      case 'Vender': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }, [stock.userRecommendation]);

  // Handler memoizado para o clique
  const handleClick = useMemo(() => {
    return onSelect ? () => onSelect(stock.ticker) : undefined;
  }, [stock.ticker, onSelect]);

  return (
    <div
      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{stock.ticker}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${recommendationClass}`}>
          {stock.userRecommendation}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-500">Quantidade</p>
          <p>{stock.quantity}</p>
        </div>
        <div>
          <p className="text-gray-500">Preço Atual</p>
          <p>R$ {stock.currentPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Valor Total</p>
          <p>R$ {stock.currentValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Meta</p>
          <p>{stock.targetPercentage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Alocação Atual</span>
          <span className={`text-xs font-medium ${diffClass}`}>
            {stock.currentPercentage.toFixed(1)}%
            {percentageDiff > 0 ? ' (+' : ' ('}
            {percentageDiff.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${Math.abs(percentageDiff) < 1 ? 'bg-blue-500' :
                percentageDiff > 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
            style={{ width: `${Math.min(100, stock.currentPercentage)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
});

export default StockItem;
