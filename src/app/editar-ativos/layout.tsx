import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PortfolioProvider } from '@/core/state/portfolio-context';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <PortfolioProvider>
      <AppShell>{children}</AppShell>
    </PortfolioProvider>
  );
}
