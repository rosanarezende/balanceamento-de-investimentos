import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePortfolio } from "@/hooks/use-portfolio";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioSummary({
  totalValue,
  stocksCount,
  dailyChange,
  dailyChangePercentage,
  stocksData,
}) {
  const { refreshPortfolio, isRefreshing } = usePortfolio();

  return (
    <Card className="mb-6">
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
              {typeof totalValue === "number" && totalValue > 0
                ? formatCurrency(totalValue)
                : "Valor inválido"}
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
            <Skeleton className="h-6 w-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
