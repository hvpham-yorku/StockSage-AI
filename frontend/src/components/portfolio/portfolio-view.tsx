import StockPortfolio from "./portfolio";

export default function Portfolio() {
    return (
        <div className="md:mx-28">
            <StockPortfolio  cashBalance={12500.75} stocks = {[]}  />
        </div>
    );
}