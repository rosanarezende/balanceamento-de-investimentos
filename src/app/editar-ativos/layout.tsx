import { ReactNode } from "react";
import { AppShellEnhanced } from "@/components/layout/app-shell-enhanced";
import { PortfolioProvider } from '@/core/state/portfolio-context';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PortfolioProvider>
      <AppShellEnhanced>{children}</AppShellEnhanced>
    </PortfolioProvider>
  );
}
