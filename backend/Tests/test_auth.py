from fastapi.testclient import TestClient
from stocksage_api.main import app
from unittest.mock import patch
import uuid

client = TestClient(app)

# Generate a dummy user id
mock_user_id = str(uuid.uuid4())
mock_token_data = {
    "uid": mock_user_id,
    "email": "testuser@example.com"
}

# Mocked user profile
mock_profile = {
    "id": mock_user_id,
    "email": "testuser@example.com",
    "name": "Test User",
    "created_at": 1712234567890,
    "preferences": {
        "theme": "light",
        "notifications_enabled": True,
        "default_view": "dashboard"
    }
}

def test_register_user():
    response = client.post("/api/auth/register", json={
        "email": "testuser@example.com",
        "password": "SecurePass123",
        "name": "Test User"
    })
    assert response.status_code in [201, 400]
    if response.status_code == 201:
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert "user_id" in data
        assert "profile" in data

@patch("stocksage_api.routes.auth.get_current_user", return_value=mock_token_data)
@patch("stocksage_api.services.firebase_service.firebase_service.get_user_profile", return_value=mock_profile)
def test_get_profile(mock_get_user_profile, mock_get_current_user):
    response = client.get("/api/auth/profile", headers={
        "Authorization": "Bearer FAKE.TOKEN.HERE"
    })
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"

@patch("stocksage_api.routes.auth.get_current_user", return_value=mock_token_data)
@patch("stocksage_api.services.firebase_service.firebase_service.update_user_profile")
@patch("stocksage_api.services.firebase_service.firebase_service.get_user_profile", return_value=mock_profile)
@patch("stocksage_api.services.firebase_service.firebase_service.update_user")
def test_update_profile(mock_update_user, mock_get_user_profile, mock_update_user_profile, mock_get_current_user):
    updated_name = "Updated Test User"
    response = client.put("/api/auth/profile", headers={
        "Authorization": "Bearer FAKE.TOKEN.HERE"
    }, json={
        "name": updated_name
    })
    assert response.status_code == 200
    assert response.json()["name"] == updated_name

@patch("stocksage_api.routes.auth.get_current_user", return_value=mock_token_data)
@patch("stocksage_api.services.firebase_service.firebase_service.delete_user_profile")
def test_delete_profile(mock_delete_user_profile, mock_get_current_user):
    response = client.delete("/api/auth/profile", headers={
        "Authorization": "Bearer FAKE.TOKEN.HERE"
    })
    assert response.status_code == 204

@patch("stocksage_api.routes.auth.get_current_user", return_value=mock_token_data)
def test_verify_token(mock_get_current_user):
    response = client.get("/api/auth/verify", headers={
        "Authorization": "Bearer FAKE.TOKEN.HERE"
    })
    assert response.status_code == 200
    assert response.json()["valid"] is True
    assert response.json()["user_id"] == mock_user_id
