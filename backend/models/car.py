from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, Dict, Any, List, Union
from .base import Transmission, Condition

class CarBase(BaseModel):
    """Базовая модель автомобиля"""
    brand: str
    model: str
    year: int
    power: int
    transmission: Union[Transmission, str]
    condition: Union[Condition, str]
    mileage: int
    features: Optional[List[str]] = None
    price: float

class CarCreate(CarBase):
    """Модель для создания автомобиля"""
    store_id: int

class CarInDB(CarBase):
    """Модель автомобиля в базе данных"""
    id: int
    seller_id: int
    store_id: int

    class Config:
        from_attributes = True

class Car(CarBase):
    """Модель автомобиля для ответа API"""
    id: int
    seller_id: int
    store_id: int

    class Config:
        from_attributes = True