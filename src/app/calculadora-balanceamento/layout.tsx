import React from 'react';
import { PortfolioProvider } from '@/core/state/portfolio-context';

export default function CalculadoraBalanceamentoLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <PortfolioProvider>
      {children}
    </PortfolioProvider>
  );
}
