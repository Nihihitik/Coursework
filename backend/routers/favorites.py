from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import json

from backend.schemas.database import get_db
from backend.schemas import Favorite, Car
from backend.auth import get_current_buyer

router = APIRouter(tags=["favorites"])

@router.post("/{car_id}", response_model=Dict[str, Any])
async def add_to_favorites(
    car_id: int,
    current_user = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Добавить автомобиль в избранное (только для покупателей)"""
    # Проверка, что автомобиль существует
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    # Проверка, что автомобиль уже не в избранном
    existing = db.query(Favorite).filter(
        Favorite.buyer_id == current_user.id,
        Favorite.car_id == car_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Автомобиль уже в избранном")

    favorite = Favorite(buyer_id=current_user.id, car_id=car_id)
    db.add(favorite)
    db.commit()

    return {"message": "Автомобиль добавлен в избранное"}

@router.delete("/{car_id}", response_model=Dict[str, Any])
async def remove_from_favorites(
    car_id: int,
    current_user = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Удалить автомобиль из избранного"""
    favorite = db.query(Favorite).filter(
        Favorite.buyer_id == current_user.id,
        Favorite.car_id == car_id
    ).first()

    if not favorite:
        raise HTTPException(status_code=404, detail="Автомобиль не в избранном")

    db.delete(favorite)
    db.commit()

    return {"message": "Автомобиль удален из избранного"}

@router.get("", response_model=List[Dict[str, Any]])
async def get_favorites(
    current_user = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Получить список избранных автомобилей"""
    favorites = db.query(Favorite).filter(Favorite.buyer_id == current_user.id).all()

    result = []
    for fav in favorites:
        car = fav.car
        # Десериализуем features из JSON строки в список, если они есть
        features = None
        if car.features:
            try:
                features = json.loads(car.features)
            except:
                features = car.features

        result.append({
            "id": car.id,
            "brand": car.brand,
            "model": car.model,
            "year": car.year,
            "price": car.price,
            "mileage": car.mileage,
            "transmission": car.transmission,
            "condition": car.condition,
            "power": car.power,
            "features": features,
            "color": getattr(car, "color", None),
            "status": car.status,
            "added_at": fav.added_at.isoformat(),
            "is_favorite": True
        })

    return result