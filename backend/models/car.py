from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, Dict, Any
from .base import Transmission, Condition

class CarBase(BaseModel):
    """Базовая модель автомобиля"""
    brand: str
    model: str
    year: int
    power: int
    transmission: Transmission
    condition: Condition
    mileage: int
    features: Optional[Dict[str, Any]] = None
    price: float

class CarCreate(CarBase):
    """Модель для создания автомобиля"""
    seller_id: UUID
    store_id: UUID

class CarInDB(CarBase):
    """Модель автомобиля в базе данных"""
    id: UUID
    seller_id: UUID
    store_id: UUID

    class Config:
        from_attributes = True

class Car(CarBase):
    """Модель автомобиля для ответа API"""
    id: UUID
    seller_id: UUID
    store_id: UUID

    class Config:
        from_attributes = True