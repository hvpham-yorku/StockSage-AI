"use client"

import { User } from "firebase/auth";
import { api } from "@/lib/api";

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

  let userHasPortfolios = async (user: User | null) => {
    try {
      let userPortfolios = await api.portfolios.getAll();

      //Check if user has portfolios
      return userPortfolios.length != 0;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  return (
    <PageLoader 
      fallback={
        <CreatePortfolio/>
      }
      condition={
        userHasPortfolios
      }>
      <Portfolio/>
    </PageLoader>
  )
}