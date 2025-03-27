"use client"

import PageLoader from "@/components/condtionalRender"
import Portfolio from "@/components/portfolio/portfolio-view"
import CreatePortfolio from "@/components/portfolio/create-portfolio"

export default function PortfolioView() { //TODO Rename this function
  return (
    <PageLoader fallback={
      <CreatePortfolio/>
    }>
      <Portfolio/>
    </PageLoader>
  )
}