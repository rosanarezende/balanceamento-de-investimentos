import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatCurrency } from "@/core/utils";
import { usePortfolio } from "@/core/state/portfolio-context";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary, ErrorDisplay } from "@/core/state/error-handling";

type PortfolioSummaryProps = {
  totalValue: number;
  stocksCount: number;
  dailyChange: number;
  dailyChangePercentage: number;
  stocksData: { ticker: string; currentValue: number }[];
};

function PortfolioSummaryContent({
  totalValue,
  stocksCount,
  dailyChange,
  dailyChangePercentage,
  stocksData,
}: PortfolioSummaryProps) {
  const { refreshPortfolio, isRefreshing } = usePortfolio();

  return (
    <>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Resumo da Carteira</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshPortfolio}
          disabled={isRefreshing}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          {isRefreshing ? "Atualizando..." : "Atualizar"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Valor Total</p>
            <p className="text-xl font-bold">
              {formatCurrency(totalValue)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Quantidade de Ativos</p>
            <p className="text-xl font-bold">{stocksCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Variação Diária</p>
            <p
              className={`text-xl font-bold ${
                dailyChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {dailyChange >= 0 ? "+" : ""}
              {formatCurrency(dailyChange)} ({dailyChangePercentage.toFixed(2)}%)
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">Detalhes dos Ativos</p>
          {stocksData.length > 0 ? (
            <ul className="space-y-2">
              {stocksData.map((stock) => (
                <li key={stock.ticker} className="flex justify-between">
                  <span>{stock.ticker}</span>
                  <span>{formatCurrency(stock.currentValue)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground py-2">Nenhum ativo encontrado</p>
          )}
        </div>
      </CardContent>
    </>
  );
}

export function PortfolioSummary(props: PortfolioSummaryProps) {
  return (
    <Card className="mb-6">
      <ErrorBoundary
        fallback={
          <ErrorDisplay 
            message="Não foi possível carregar o resumo da carteira" 
            onRetry={() => window.location.reload()}
          />
        }
      >
        <PortfolioSummaryContent {...props} />
      </ErrorBoundary>
    </Card>
  );
}
