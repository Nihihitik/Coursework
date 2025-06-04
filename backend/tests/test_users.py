import pytest

def test_get_buyer_profile(client, test_buyer, buyer_auth_header):
    """Тест получения профиля покупателя"""
    response = client.get(
        "/users/profile",
        headers=buyer_auth_header
    )
    assert response.status_code == 200
    profile = response.json()
    assert profile["id"] == test_buyer.id
    assert profile["email"] == test_buyer.email
    assert profile["full_name"] == test_buyer.full_name
    assert profile["role"] == "buyer"
    assert "preferences" in profile
    assert profile["preferences"]["preferred_brand"] == test_buyer.preferred_brand
    assert profile["preferences"]["preferred_model"] == test_buyer.preferred_model
    assert profile["preferences"]["max_price"] == test_buyer.max_price

def test_get_seller_profile(client, test_seller, seller_auth_header):
    """Тест получения профиля продавца"""
    response = client.get(
        "/users/profile",
        headers=seller_auth_header
    )
    assert response.status_code == 200
    profile = response.json()
    assert profile["id"] == test_seller.id
    assert profile["email"] == test_seller.email
    assert profile["full_name"] == test_seller.full_name
    assert profile["role"] == "seller"
    assert "cars_count" in profile

def test_get_profile_unauthorized(client):
    """Тест получения профиля без авторизации"""
    response = client.get("/users/profile")
    assert response.status_code == 401


def test_update_buyer_profile(client, test_buyer, buyer_auth_header):
    """Тест обновления данных покупателя"""
    response = client.put(
        "/users/profile",
        json={"full_name": "Updated Buyer", "contact_info": "000"},
        headers=buyer_auth_header,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Профиль успешно обновлен"

    # Проверяем изменения
    response = client.get("/users/profile", headers=buyer_auth_header)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Buyer"
    assert response.json()["contact_info"] == "000"


def test_update_seller_profile(client, test_seller, seller_auth_header):
    """Тест обновления данных продавца"""
    response = client.put(
        "/users/profile",
        json={"full_name": "Updated Seller"},
        headers=seller_auth_header,
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Профиль успешно обновлен"

    response = client.get("/users/profile", headers=seller_auth_header)
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Seller"


def test_delete_buyer_profile(client, test_buyer, buyer_auth_header):
    """Тест удаления аккаунта покупателя"""
    response = client.delete("/users/profile", headers=buyer_auth_header)
    assert response.status_code == 200
    assert response.json()["message"] == "Пользователь удален"

    # После удаления профиль недоступен
    response = client.get("/users/profile", headers=buyer_auth_header)
    assert response.status_code == 401


def test_delete_seller_profile(client, test_seller, seller_auth_header):
    """Тест удаления аккаунта продавца"""
    response = client.delete("/users/profile", headers=seller_auth_header)
    assert response.status_code == 200
    assert response.json()["message"] == "Пользователь удален"

    response = client.get("/users/profile", headers=seller_auth_header)
    assert response.status_code == 401