import pytest
from fastapi.testclient import TestClient

def test_register_buyer(client):
    """Тест регистрации нового покупателя"""
    response = client.post(
        "/auth/register/buyer",
        json={
            "email": "new_buyer@example.com",
            "password": "password123",
            "full_name": "New Buyer",
            "contact_info": "555-123-4567",
            "preferred_brand": "Honda",
            "preferred_model": "Accord",
            "min_year": 2019,
            "max_year": 2023,
            "min_power": 150,
            "max_power": 300,
            "preferred_transmission": "automatic",
            "preferred_condition": "new",
            "max_price": 40000
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert "id" in result
    assert result["message"] == "Покупатель успешно зарегистрирован"

def test_register_seller(client):
    """Тест регистрации нового продавца"""
    response = client.post(
        "/auth/register/seller",
        json={
            "email": "new_seller@example.com",
            "password": "password123",
            "full_name": "New Seller",
            "contact_info": "555-987-6543"
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert "id" in result
    assert result["message"] == "Продавец успешно зарегистрирован"

def test_register_duplicate_email(client, test_buyer):
    """Тест регистрации с уже существующим email"""
    response = client.post(
        "/auth/register/buyer",
        json={
            "email": test_buyer.email,  # Используем email из фикстуры test_buyer
            "password": "password123",
            "full_name": "Another Buyer",
            "contact_info": "555-111-2222"
        }
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email уже зарегистрирован"

def test_login_buyer(client, test_buyer):
    """Тест авторизации покупателя"""
    response = client.post(
        "/auth/token",
        data={
            "username": test_buyer.email,
            "password": "password"  # соответствует хешу в фикстуре
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert "access_token" in result
    assert result["token_type"] == "bearer"
    assert result["role"] == "buyer"

def test_login_seller(client, test_seller):
    """Тест авторизации продавца"""
    response = client.post(
        "/auth/token",
        data={
            "username": test_seller.email,
            "password": "password"  # соответствует хешу в фикстуре
        }
    )
    assert response.status_code == 200
    result = response.json()
    assert "access_token" in result
    assert result["token_type"] == "bearer"
    assert result["role"] == "seller"

def test_login_invalid_credentials(client):
    """Тест авторизации с неверными учетными данными"""
    response = client.post(
        "/auth/token",
        data={
            "username": "nonexistent@example.com",
            "password": "wrong_password"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Неверный email или пароль"