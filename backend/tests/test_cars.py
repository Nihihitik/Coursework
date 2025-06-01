import pytest
import json

def test_get_all_cars(client, test_car):
    """Тест получения списка всех автомобилей"""
    response = client.get("/cars")
    assert response.status_code == 200
    cars = response.json()
    assert len(cars) >= 1
    assert any(car["id"] == test_car.id for car in cars)

def test_get_all_cars_with_filters(client, test_car):
    """Тест получения списка автомобилей с фильтрами"""
    # Фильтр по бренду
    response = client.get(f"/cars?brand={test_car.brand}")
    assert response.status_code == 200
    cars = response.json()
    assert all(car["brand"] == test_car.brand for car in cars)

    # Фильтр по году
    response = client.get(f"/cars?min_year={test_car.year}&max_year={test_car.year}")
    assert response.status_code == 200
    cars = response.json()
    assert all(car["year"] == test_car.year for car in cars)

    # Фильтр по цене
    response = client.get(f"/cars?min_price={test_car.price-1000}&max_price={test_car.price+1000}")
    assert response.status_code == 200
    cars = response.json()
    assert all(car["price"] >= test_car.price-1000 and car["price"] <= test_car.price+1000 for car in cars)

def test_get_car_details(client, test_car):
    """Тест получения детальной информации об автомобиле"""
    response = client.get(f"/cars/{test_car.id}")
    assert response.status_code == 200
    car = response.json()
    assert car["id"] == test_car.id
    assert car["brand"] == test_car.brand
    assert car["model"] == test_car.model
    assert car["year"] == test_car.year
    assert car["price"] == test_car.price
    assert car["seller"]["name"] == test_car.seller.full_name
    assert car["store"]["name"] == test_car.store.name

def test_get_car_details_not_found(client):
    """Тест получения информации о несуществующем автомобиле"""
    response = client.get("/cars/9999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Автомобиль не найден"

def test_add_car(client, seller_auth_header, test_store):
    """Тест добавления нового автомобиля"""
    response = client.post(
        "/cars",
        json={
            "brand": "Honda",
            "model": "Civic",
            "year": 2021,
            "power": 150,
            "transmission": "automatic",
            "condition": "new",
            "mileage": 1000,
            "features": ["bluetooth", "camera", "heated seats"],
            "price": 25000,
            "store_id": test_store.id
        },
        headers=seller_auth_header
    )
    assert response.status_code == 200
    result = response.json()
    assert "id" in result
    assert result["message"] == "Автомобиль успешно добавлен"

def test_add_car_unauthorized(client, test_store):
    """Тест добавления автомобиля без авторизации"""
    response = client.post(
        "/cars",
        json={
            "brand": "Honda",
            "model": "Civic",
            "year": 2021,
            "power": 150,
            "transmission": "automatic",
            "condition": "new",
            "mileage": 1000,
            "features": ["bluetooth", "camera", "heated seats"],
            "price": 25000,
            "store_id": test_store.id
        }
    )
    assert response.status_code == 401

def test_update_car(client, seller_auth_header, test_car):
    """Тест обновления информации об автомобиле"""
    updated_price = test_car.price + 5000

    # Преобразуем features из JSON-строки в список
    features = json.loads(test_car.features) if test_car.features else []

    response = client.put(
        f"/cars/{test_car.id}",
        json={
            "brand": test_car.brand,
            "model": test_car.model,
            "year": test_car.year,
            "power": test_car.power,
            "transmission": test_car.transmission,
            "condition": test_car.condition,
            "mileage": test_car.mileage,
            "features": features,
            "price": updated_price,
            "store_id": test_car.store_id
        },
        headers=seller_auth_header
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Информация об автомобиле успешно обновлена"

    # Проверяем, что цена действительно обновилась
    response = client.get(f"/cars/{test_car.id}")
    assert response.status_code == 200
    assert response.json()["price"] == updated_price

def test_delete_car(client, seller_auth_header, test_car, db_session):
    """Тест удаления автомобиля"""
    response = client.delete(
        f"/cars/{test_car.id}",
        headers=seller_auth_header
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Автомобиль успешно удален"

    # Проверяем, что автомобиль больше не доступен
    response = client.get(f"/cars/{test_car.id}")
    assert response.status_code == 404