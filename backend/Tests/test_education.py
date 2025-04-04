from fastapi.testclient import TestClient
from stocksage_api.main import app

client = TestClient(app)

def test_get_all_terms():
    response = client.get("/api/education/terms")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any("term" in item for item in data)

def test_get_specific_term():
    response = client.get("/api/education/terms/stock")
    assert response.status_code == 200
    data = response.json()
    assert data["term"].lower() == "stock"
    assert "definition" in data
    assert "related_terms" in data
    assert "equity" in data["related_terms"]

def test_get_nonexistent_term():
    response = client.get("/api/education/terms/fake-term")
    assert response.status_code == 404
    assert "detail" in response.json()

def test_get_trading_tips():
    response = client.get("/api/education/tips")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("title" in tip and "content" in tip for tip in data)