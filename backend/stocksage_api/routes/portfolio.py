from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List
from uuid import uuid4
from datetime import datetime
from stocksage_api.routes.auth import get_current_user
from stocksage_api.services.firebase_service import firebase_service

router = APIRouter(
    prefix="/api/portfolios",
    tags=["Portfolios"],
    responses={404: {"description": "Portfolio not found"}}
)

class PortfolioCreate(BaseModel):
    name: str
    start_date: datetime
    initial_balance: float

class PortfolioResponse(PortfolioCreate):
    id: str

class BuySellRequest(BaseModel):
    symbol: str
    quantity: int
    price: float

class Transaction(BaseModel):
    date: str
    symbol: str
    type: str  # buy or sell
    quantity: int
    price: float

class PortfolioPerformance(BaseModel):
    portfolio_id: str
    return_percentage: float
    profit_loss: float
    current_value: float

class PortfolioComparison(BaseModel):
    portfolio_id: str
    name: str
    return_percentage: float

@router.post("", response_model=PortfolioResponse)
async def create_portfolio(
        portfolio: PortfolioCreate,
        current_user: dict = Depends(get_current_user)
):
    data = portfolio.model_dump()
    try:
        created = firebase_service.create_portfolio(current_user["uid"], data)
        return created
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[PortfolioResponse])
async def get_all_portfolios(current_user: dict = Depends(get_current_user)):
    return firebase_service.get_portfolios(current_user["uid"])

@router.get("/{portfolio_id}", response_model=PortfolioResponse)
async def get_portfolio(
        portfolio_id: str,
        current_user: dict = Depends(get_current_user)
):
    return firebase_service.get_portfolio(current_user["uid"], portfolio_id)

@router.get("/{id}/transactions", response_model=List[Transaction])
async def get_transactions(id: str, current_user: dict = Depends(get_current_user)):
    return firebase_service.get_transactions(current_user["uid"], id)

@router.post("/{id}/buy")
async def buy_stock(id: str, request: BuySellRequest, current_user: dict = Depends(get_current_user)):
    return firebase_service.buy_stock(current_user["uid"], id, request.model_dump())

@router.post("/{id}/sell")
async def sell_stock(id: str, request: BuySellRequest, current_user: dict = Depends(get_current_user)):
    return firebase_service.sell_stock(current_user["uid"], id, request.model_dump())

@router.get("/{id}/performance", response_model=PortfolioPerformance)
async def get_performance(id: str, current_user: dict = Depends(get_current_user)):
    return firebase_service.get_performance(current_user["uid"], id)

@router.get("/compare", response_model=List[PortfolioComparison])
async def compare_portfolios(ids: str = Query(...), current_user: dict = Depends(get_current_user)):
    portfolio_ids = ids.split(",")
    return firebase_service.compare_portfolios(current_user["uid"], portfolio_ids)