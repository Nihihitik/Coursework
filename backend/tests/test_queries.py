import pytest

def test_buyers_for_car(client, test_car, test_buyer):
    """Тест поиска покупателей для автомобиля с заданными параметрами"""
    response = client.get(
        "/queries/buyers-for-car",
        params={
            "brand": test_car.brand,
            "model": test_car.model,
            "year": test_car.year,
            "transmission": test_car.transmission,
            "condition": test_car.condition,
            "price": test_car.price
        }
    )
    assert response.status_code == 200
    buyers = response.json()
    assert len(buyers) >= 1
    assert any(buyer["id"] == test_buyer.id for buyer in buyers)

def test_buyers_by_model(client, test_buyer):
    """Тест получения покупателей по предпочитаемой модели"""
    response = client.get(
        f"/queries/buyers-by-model",
        params={"model": test_buyer.preferred_model}
    )
    assert response.status_code == 200
    buyers = response.json()
    assert len(buyers) >= 1
    assert any(buyer["id"] == test_buyer.id for buyer in buyers)

def test_cars_low_mileage(client, test_car, db_session):
    """Тест получения автомобилей с низким пробегом"""
    # Обновляем тестовый автомобиль, чтобы гарантировать низкий пробег
    test_car.mileage = 10000
    db_session.commit()

    response = client.get("/queries/cars-low-mileage")
    assert response.status_code == 200
    cars = response.json()
    assert len(cars) >= 1
    assert any(car["id"] == test_car.id for car in cars)

def test_new_cars(client, test_car):
    """Тест получения новых автомобилей"""
    response = client.get("/queries/new-cars")
    assert response.status_code == 200
    cars = response.json()
    if test_car.condition == "new":
        assert len(cars) >= 1
        assert any(car["id"] == test_car.id for car in cars)

def test_market_analysis(client):
    """Тест анализа рынка"""
    response = client.get("/queries/market-analysis")
    assert response.status_code == 200
    analysis = response.json()
    assert "total_buying_power" in analysis
    assert "total_car_value" in analysis
    assert "ratio" in analysis
    assert "average_buyer_budget" in analysis
    assert "average_car_price" in analysis
    assert "buyers_count" in analysis
    assert "cars_count" in analysis

def test_most_expensive_car(client, test_car, db_session):
    """Тест получения самого дорогого автомобиля"""
    # Устанавливаем высокую цену для тестового автомобиля
    test_car.price = 1000000
    db_session.commit()

    response = client.get("/queries/most-expensive-car")
    assert response.status_code == 200
    car = response.json()
    assert car["id"] == test_car.id
    assert car["price"] == test_car.price