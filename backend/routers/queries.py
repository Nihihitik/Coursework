from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi import Depends

from backend.schemas.database import get_db
from backend.schemas import Buyer, Car

router = APIRouter(tags=["queries"])

@router.get("/buyers-for-car", response_model=List[Dict[str, Any]])
async def find_buyers_for_car(
    brand: str,
    model: str,
    year: int,
    transmission: str,
    condition: str,
    price: float,
    db: Session = Depends(get_db)
):
    """Найти покупателей для автомобиля с заданными параметрами"""
    query = db.query(Buyer)

    # Фильтрация по предпочтениям
    if brand:
        query = query.filter(
            (Buyer.preferred_brand == None) | (Buyer.preferred_brand == brand)
        )
    if model:
        query = query.filter(
            (Buyer.preferred_model == None) | (Buyer.preferred_model == model)
        )

    query = query.filter(
        (Buyer.min_year == None) | (Buyer.min_year <= year),
        (Buyer.max_year == None) | (Buyer.max_year >= year),
        (Buyer.preferred_transmission == None) | (Buyer.preferred_transmission == transmission),
        (Buyer.preferred_condition == None) | (Buyer.preferred_condition == condition),
        (Buyer.max_price == None) | (Buyer.max_price >= price)
    )

    buyers = query.all()

    return [
        {
            "id": buyer.id,
            "full_name": buyer.full_name,
            "contact_info": buyer.contact_info,
            "max_price": buyer.max_price
        }
        for buyer in buyers
    ]

@router.get("/buyers-by-model", response_model=List[Dict[str, Any]])
async def get_buyers_by_model(model: str, db: Session = Depends(get_db)):
    """Покупатели, желающие приобрести автомобиль заданной модели"""
    buyers = db.query(Buyer).filter(Buyer.preferred_model == model).all()

    return [
        {
            "id": buyer.id,
            "full_name": buyer.full_name,
            "contact_info": buyer.contact_info,
            "preferences": {
                "brand": buyer.preferred_brand,
                "year_range": f"{buyer.min_year or 'любой'}-{buyer.max_year or 'любой'}",
                "max_price": buyer.max_price
            }
        }
        for buyer in buyers
    ]

@router.get("/cars-low-mileage", response_model=List[Dict[str, Any]])
async def get_cars_low_mileage(db: Session = Depends(get_db)):
    """Вывести список автомобилей с пробегом меньше 30 тыс. км"""
    cars = db.query(Car).filter(Car.mileage < 30000).all()

    return [
        {
            "id": car.id,
            "brand": car.brand,
            "model": car.model,
            "year": car.year,
            "mileage": car.mileage,
            "price": car.price,
            "condition": car.condition
        }
        for car in cars
    ]

@router.get("/new-cars", response_model=List[Dict[str, Any]])
async def get_new_cars(db: Session = Depends(get_db)):
    """Вывести список новых автомобилей"""
    cars = db.query(Car).filter(Car.condition == "new").all()

    return [
        {
            "id": car.id,
            "brand": car.brand,
            "model": car.model,
            "year": car.year,
            "power": car.power,
            "transmission": car.transmission,
            "price": car.price,
            "seller_name": car.seller.full_name if car.seller else None
        }
        for car in cars
    ]

@router.get("/market-analysis", response_model=Dict[str, Any])
async def get_market_analysis(db: Session = Depends(get_db)):
    """Соотношение покупательной способности и суммарной стоимости автомобилей"""
    # Получение общей покупательной способности
    buyers = db.query(Buyer).filter(Buyer.max_price != None).all()
    total_buying_power = sum(buyer.max_price for buyer in buyers if buyer.max_price)

    # Получение общей стоимости автомобилей
    cars = db.query(Car).all()
    total_car_value = sum(car.price for car in cars)

    # Получение средних значений
    avg_buyer_budget = total_buying_power / len(buyers) if buyers else 0
    avg_car_price = total_car_value / len(cars) if cars else 0

    return {
        "total_buying_power": total_buying_power,
        "total_car_value": total_car_value,
        "ratio": total_buying_power / total_car_value if total_car_value > 0 else 0,
        "average_buyer_budget": avg_buyer_budget,
        "average_car_price": avg_car_price,
        "buyers_count": len(buyers),
        "cars_count": len(cars)
    }

@router.get("/most-expensive-car", response_model=Dict[str, Any])
async def get_most_expensive_car(db: Session = Depends(get_db)):
    """Самый дорогой автомобиль"""
    car = db.query(Car).order_by(Car.price.desc()).first()

    if not car:
        raise HTTPException(status_code=404, detail="Автомобили не найдены")

    return {
        "id": car.id,
        "brand": car.brand,
        "model": car.model,
        "year": car.year,
        "power": car.power,
        "transmission": car.transmission,
        "condition": car.condition,
        "mileage": car.mileage,
        "price": car.price,
        "seller": {
            "name": car.seller.full_name,
            "contact": car.seller.contact_info
        } if car.seller else None,
        "store": {
            "name": car.store.name,
            "address": car.store.address
        } if car.store else None
    }