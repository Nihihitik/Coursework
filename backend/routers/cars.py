from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import json

from backend.schemas.database import get_db
from backend.schemas import Car, Store, Deal
from backend.models import CarCreate
from backend.auth import get_current_seller

router = APIRouter(tags=["cars"])

@router.get("", response_model=List[Dict[str, Any]])
async def get_all_cars(
    skip: int = 0,
    limit: int = 100,
    brand: Optional[str] = None,
    model: Optional[str] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    condition: Optional[str] = None,
    transmission: Optional[str] = None,
    max_mileage: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Получить список всех автомобилей с фильтрацией (доступно без авторизации)"""
    query = db.query(Car)

    # Применяем фильтры
    if brand:
        query = query.filter(Car.brand.ilike(f"%{brand}%"))
    if model:
        query = query.filter(Car.model.ilike(f"%{model}%"))
    if min_year:
        query = query.filter(Car.year >= min_year)
    if max_year:
        query = query.filter(Car.year <= max_year)
    if min_price:
        query = query.filter(Car.price >= min_price)
    if max_price:
        query = query.filter(Car.price <= max_price)
    if condition:
        query = query.filter(Car.condition == condition)
    if transmission:
        query = query.filter(Car.transmission == transmission)
    if max_mileage:
        query = query.filter(Car.mileage <= max_mileage)

    cars = query.offset(skip).limit(limit).all()

    # Преобразуем в словарь с дополнительной информацией
    result = []
    for car in cars:
        # Десериализуем features из JSON строки в список
        features = None
        if car.features:
            try:
                features = json.loads(car.features)
            except json.JSONDecodeError:
                features = car.features

        car_dict = {
            "id": car.id,
            "brand": car.brand,
            "model": car.model,
            "year": car.year,
            "power": car.power,
            "transmission": car.transmission,
            "condition": car.condition,
            "mileage": car.mileage,
            "features": features,
            "price": car.price,
            "seller_name": car.seller.full_name if car.seller else None,
            "store_name": car.store.name if car.store else None
        }
        result.append(car_dict)

    return result

@router.get("/{car_id}", response_model=Dict[str, Any])
async def get_car_details(car_id: int, db: Session = Depends(get_db)):
    """Получить детальную информацию об автомобиле (доступно без авторизации)"""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    # Десериализуем features из JSON строки в список
    features = None
    if car.features:
        try:
            features = json.loads(car.features)
        except json.JSONDecodeError:
            features = car.features

    return {
        "id": car.id,
        "brand": car.brand,
        "model": car.model,
        "year": car.year,
        "power": car.power,
        "transmission": car.transmission,
        "condition": car.condition,
        "mileage": car.mileage,
        "features": features,
        "price": car.price,
        "seller": {
            "name": car.seller.full_name,
            "contact_info": car.seller.contact_info
        } if car.seller else None,
        "store": {
            "name": car.store.name,
            "address": car.store.address
        } if car.store else None
    }

@router.post("", response_model=Dict[str, Any])
async def add_car(
    car: CarCreate,
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Добавить новый автомобиль (только для продавцов/админов)"""
    # Проверка существования магазина
    if car.store_id:
        store = db.query(Store).filter(Store.id == car.store_id).first()
        if not store:
            raise HTTPException(status_code=404, detail="Магазин не найден")

    # Преобразуем список features в JSON строку
    features_json = json.dumps(car.features) if car.features else None

    db_car = Car(
        brand=car.brand,
        model=car.model,
        year=car.year,
        power=car.power,
        transmission=car.transmission,
        condition=car.condition,
        mileage=car.mileage,
        features=features_json,
        price=car.price,
        seller_id=current_user.id,
        store_id=car.store_id
    )
    db.add(db_car)
    db.commit()
    db.refresh(db_car)

    return {"message": "Автомобиль успешно добавлен", "id": db_car.id}

@router.put("/{car_id}", response_model=Dict[str, Any])
async def update_car(
    car_id: int,
    car_update: CarCreate,
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Обновить информацию об автомобиле (только владелец автомобиля)"""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    # Проверка, что текущий пользователь - владелец
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="У вас нет прав на обновление этого автомобиля")

    # Преобразуем список features в JSON строку
    features_json = json.dumps(car_update.features) if car_update.features else None

    # Обновление полей автомобиля
    car.brand = car_update.brand
    car.model = car_update.model
    car.year = car_update.year
    car.power = car_update.power
    car.transmission = car_update.transmission
    car.condition = car_update.condition
    car.mileage = car_update.mileage
    car.features = features_json
    car.price = car_update.price
    car.store_id = car_update.store_id

    db.commit()
    db.refresh(car)

    return {"message": "Информация об автомобиле успешно обновлена"}

@router.delete("/{car_id}", response_model=Dict[str, Any])
async def delete_car(
    car_id: int,
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Удалить автомобиль (только владелец)"""
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    # Проверка, что текущий пользователь - владелец
    if car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="У вас нет прав на удаление этого автомобиля")

    # Проверка активных сделок
    active_deals = db.query(Deal).filter(
        Deal.car_id == car_id,
        Deal.status.in_(["pending", "approved"])
    ).first()

    if active_deals:
        raise HTTPException(status_code=400, detail="Нельзя удалить автомобиль с активными сделками")

    db.delete(car)
    db.commit()

    return {"message": "Автомобиль успешно удален"}

# Функция для получения автомобилей продавца, доступная для импорта
async def get_seller_cars(
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Получить список автомобилей текущего продавца"""
    cars = db.query(Car).filter(Car.seller_id == current_user.id).all()

    # Преобразуем в словарь с дополнительной информацией
    result = []
    for car in cars:
        # Десериализуем features из JSON строки в список
        features = None
        if car.features:
            try:
                features = json.loads(car.features)
            except json.JSONDecodeError:
                features = car.features

        car_dict = {
            "id": car.id,
            "brand": car.brand,
            "model": car.model,
            "year": car.year,
            "power": car.power,
            "transmission": car.transmission,
            "condition": car.condition,
            "mileage": car.mileage,
            "features": features,
            "price": car.price,
            "store_name": car.store.name if car.store else None
        }
        result.append(car_dict)

    return result