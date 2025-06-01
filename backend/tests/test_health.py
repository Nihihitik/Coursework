import pytest

def test_health_check(client):
    """Тест проверки работоспособности API"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data