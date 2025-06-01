from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, Union
from .base import Transmission, Condition

class BuyerBase(BaseModel):
    """Базовая модель покупателя"""
    full_name: str
    contact_info: str
    preferred_brand: Optional[str] = None
    preferred_model: Optional[str] = None
    min_year: Optional[int] = None
    max_year: Optional[int] = None
    min_power: Optional[int] = None
    max_power: Optional[int] = None
    preferred_transmission: Optional[Union[Transmission, str]] = None
    preferred_condition: Optional[Union[Condition, str]] = None
    max_price: Optional[float] = None

class BuyerCreate(BuyerBase):
    """Модель для создания покупателя"""
    email: str
    password: str

class BuyerInDB(BuyerBase):
    """Модель покупателя в базе данных"""
    id: int

    class Config:
        from_attributes = True

class Buyer(BuyerBase):
    """Модель покупателя для ответа API"""
    id: int

    class Config:
        from_attributes = True