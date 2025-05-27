import { formatCurrency } from "@/lib/utils";
import { UserRecommendationSelector } from "@/components/user-recommendation-selector";

interface StockCardProps {
  stock: {
    name: string;
    price: number;
    ticker: string;
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
