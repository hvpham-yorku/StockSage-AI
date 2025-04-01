import StockPortfolio from "./portfolio";
import { Portfolio, PortfolioPerformance } from "@/lib/api";

interface PortfolioViewProps {
    portfolio: Portfolio;
    performance: PortfolioPerformance | null;
}

export default function PortfolioView({ portfolio, performance }: PortfolioViewProps) {
    return (
        <div className="md:mx-28">
            <StockPortfolio
                cashBalance={portfolio.initial_balance}
                stocks={[]} // 나중에 실제 주식 데이터를 넣으면 됨
            />
            {/* performance 데이터는 여기서 활용하여 추가로 성과를 보여줄 수 있어 */}
        </div>
    );
}
