from fastapi.testclient import TestClient
from stocksage_api.main import app

client = TestClient(app)

def test_get_popular_stocks():
    response = client.get("/api/stocks")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert "symbol" in response.json()[0]

def test_search_stocks():
    response = client.get("/api/stocks/search?query=apple")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any("AAPL" in stock["symbol"] or "Apple" in stock["name"] for stock in data)

def test_get_stock_detail():
    response = client.get("/api/stocks/AAPL")
    assert response.status_code == 200
    data = response.json()
    assert "symbol" in data and data["symbol"] == "AAPL"
    assert "price" in data
    assert "volume" in data

def test_get_stock_history():
    response = client.get("/api/stocks/AAPL/history?days=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "date" in data[0] and "price" in data[0]

def test_get_stock_recommendation():
    response = client.get("/api/stocks/AAPL/recommendation")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "AAPL"
    assert data["recommendation"] in ["Buy", "Hold", "Sell"]
    assert 0.6 <= data["confidence"] <= 0.95
