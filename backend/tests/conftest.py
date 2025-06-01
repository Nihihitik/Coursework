import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime
import json

from backend.schemas.base import Base
from backend.schemas.database import get_db
from backend.main import app
from backend.schemas import Buyer, Seller, Car, Store, Deal, Favorite
from backend.auth import get_password_hash

# Создание тестовой БД
TEST_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    # Создание таблиц в тестовой БД
    Base.metadata.create_all(bind=engine)

    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()
        # Удаление всех таблиц после тестов
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    # Переопределяем зависимость для получения сессии БД
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    # Подменяем функцию get_db на нашу тестовую
    app.dependency_overrides[get_db] = override_get_db

    # Создаем тестовый клиент
    with TestClient(app) as client:
        yield client

    # Удаляем переопределение зависимости
    app.dependency_overrides = {}

@pytest.fixture(scope="function")
def test_seller(db_session):
    """Фикстура для создания тестового продавца"""
    seller = Seller(
        email="seller@test.com",
        password_hash=get_password_hash("password"),
        full_name="Test Seller",
        contact_info="123456789"
    )
    db_session.add(seller)
    db_session.commit()
    db_session.refresh(seller)
    return seller

@pytest.fixture(scope="function")
def test_buyer(db_session):
    """Фикстура для создания тестового покупателя"""
    buyer = Buyer(
        email="buyer@test.com",
        password_hash=get_password_hash("password"),
        full_name="Test Buyer",
        contact_info="987654321",
        preferred_brand="Toyota",
        preferred_model="Camry",
        min_year=2018,
        max_year=2022,
        preferred_transmission="automatic",
        preferred_condition="new",
        max_price=50000
    )
    db_session.add(buyer)
    db_session.commit()
    db_session.refresh(buyer)
    return buyer

@pytest.fixture(scope="function")
def test_store(db_session):
    """Фикстура для создания тестового магазина"""
    store = Store(
        name="Test Store",
        address="123 Test Street"
    )
    db_session.add(store)
    db_session.commit()
    db_session.refresh(store)
    return store

@pytest.fixture(scope="function")
def test_car(db_session, test_seller, test_store):
    """Фикстура для создания тестового автомобиля"""
    features = json.dumps(["leather seats", "navigation", "bluetooth"])

    car = Car(
        brand="Toyota",
        model="Camry",
        year=2020,
        power=180,
        transmission="automatic",
        condition="new",
        mileage=5000,
        features=features,
        price=30000,
        seller_id=test_seller.id,
        store_id=test_store.id
    )
    db_session.add(car)
    db_session.commit()
    db_session.refresh(car)
    return car

@pytest.fixture(scope="function")
def test_favorite(db_session, test_buyer, test_car):
    """Фикстура для создания тестового избранного"""
    favorite = Favorite(
        buyer_id=test_buyer.id,
        car_id=test_car.id,
        added_at=datetime.utcnow()
    )
    db_session.add(favorite)
    db_session.commit()
    db_session.refresh(favorite)
    return favorite

@pytest.fixture(scope="function")
def test_deal(db_session, test_buyer, test_car):
    """Фикстура для создания тестовой сделки"""
    deal = Deal(
        buyer_id=test_buyer.id,
        car_id=test_car.id,
        price=test_car.price,
        status="pending",
        deal_date=datetime.utcnow()
    )
    db_session.add(deal)
    db_session.commit()
    db_session.refresh(deal)
    return deal

@pytest.fixture(scope="function")
def buyer_auth_header(client, test_buyer):
    """Фикстура для получения заголовка авторизации покупателя"""
    response = client.post(
        "/auth/token",
        data={"username": test_buyer.email, "password": "password"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def seller_auth_header(client, test_seller):
    """Фикстура для получения заголовка авторизации продавца"""
    response = client.post(
        "/auth/token",
        data={"username": test_seller.email, "password": "password"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}