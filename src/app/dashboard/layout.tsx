import React from 'react';
import { PortfolioProvider } from '@/core/state/portfolio-context';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <PortfolioProvider>
      <div>
        <header>
          <h1>Dashboard</h1>
        </header>
        <main>{children}</main>
      </div>
    </PortfolioProvider>
  );
};

export default DashboardLayout;
