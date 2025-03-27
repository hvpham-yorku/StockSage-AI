"use client"

import PageLoader from "@/components/condtionalRender"
import Portfolio from "@/components/portfolio/portfolio-view"
import CreatePortfolio from "@/components/portfolio/create-portfolio"

export default function PortfolioView() { //TODO Rename this function

  /**
   * TODO
   * Ideally this is always shown when navigating to /portfolio
   * Plan is to delegate conditional rendering based on
   * selected portfolio to Portfolio element
   */

  return (
    <PageLoader fallback={
      <CreatePortfolio/>
    }>
      <Portfolio/>
    </PageLoader>
  )
}