import StockPortfolio from "./portfolio";
import PageLoader from "../condtionalRender";
import PortfolioContainer from "./portfolio_selection_card";

/**
 * Renders the stock portfolio if the user has a selected portfolio;
 * otherwise, displays the portfolio selection screen.
 *
 * @requires userHasPortfolios - The user must have at least one portfolio
 * @returns {JSX.Element} The StockPortfolio component if userHasPortfolios is met, 
 *                        otherwise the portfolio selection screen.
 */
export default function Portfolio() {

    /**
     * 
     * @todo Delete this and replace with actual function
     */
    let userHasSelectedPortfolio = () => {
        return false;
    };


    return (
    <PageLoader
        fallback={
            <PortfolioContainer/>
        }
        condition={
            userHasSelectedPortfolio
        }>
        <div>
            <StockPortfolio  cashBalance={12500.75} stocks = {[]}  />
        </div>
    </PageLoader>
    );

}