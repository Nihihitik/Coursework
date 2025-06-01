import pytest

def test_get_stores(client, test_store):
    """Тест получения списка магазинов"""
    response = client.get("/stores")
    assert response.status_code == 200
    stores = response.json()
    assert len(stores) >= 1
    assert any(store["id"] == test_store.id for store in stores)
    store = next((s for s in stores if s["id"] == test_store.id), None)
    assert store is not None
    assert store["name"] == test_store.name
    assert store["address"] == test_store.address
    assert "cars_count" in store

def test_create_store(client, seller_auth_header):
    """Тест создания нового магазина"""
    response = client.post(
        "/stores",
        params={
            "name": "New Test Store",
            "address": "456 Test Avenue"
        },
        headers=seller_auth_header
    )
    assert response.status_code == 200
    result = response.json()
    assert "id" in result
    assert result["message"] == "Магазин успешно создан"

    # Проверяем, что магазин действительно создан
    response = client.get("/stores")
    assert response.status_code == 200
    stores = response.json()
    assert any(store["name"] == "New Test Store" for store in stores)

def test_create_store_unauthorized(client):
    """Тест создания магазина без авторизации"""
    response = client.post(
        "/stores",
        params={
            "name": "Unauthorized Store",
            "address": "789 Unknown Street"
        }
    )
    assert response.status_code == 401