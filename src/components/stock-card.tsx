import { formatCurrency } from "@/core/utils";
import { UserRecommendationSelector } from "@/components/user-recommendation-selector";
import { type Stock } from "@/core/schemas/stock";

interface StockCardProps {
  stock: Stock & {
    name: string;
    price: number;
    currentRecommendation: string;
    onUpdate: (recommendation: string) => void
  };
}

export function StockCard({ stock }: StockCardProps) {
  return (
    <div className="stock-card">
      <h3>{stock.name}</h3>
      <p>{formatCurrency(stock.price)}</p>
      <UserRecommendationSelector
        ticker={stock.ticker}
        currentRecommendation={stock.currentRecommendation}
        onUpdate={stock.onUpdate}
      />
    </div>
  );
}
