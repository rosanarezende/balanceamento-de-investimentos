import React from 'react';
import { PortfolioProvider } from '@/core/state/portfolio-context';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PortfolioProvider>
      <main>{children}</main>
    </PortfolioProvider>
  );
};

export default DashboardLayout;
