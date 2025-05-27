import { formatCurrency } from "@/lib/utils";
import { UserRecommendationSelector } from "@/components/user-recommendation-selector";

export function StockCard({ stock }) {
  return (
    <div className="stock-card">
      <h3>{stock.name}</h3>
      <p>{formatCurrency(stock.price)}</p>
      <UserRecommendationSelector stock={stock} />
    </div>
  );
}
