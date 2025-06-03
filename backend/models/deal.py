from pydantic import BaseModel, Field
from datetime import datetime
from .base import DealStatus

class DealBase(BaseModel):
    """Базовая модель сделки"""
    car_id: int
    buyer_id: int
    price: float
    status: DealStatus = DealStatus.PENDING

class DealCreate(DealBase):
    """Модель для создания сделки"""
    pass

class DealInDB(DealBase):
    """Модель сделки в базе данных"""
    id: int
    deal_date: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class Deal(DealBase):
    """Модель сделки для ответа API"""
    id: int
    deal_date: datetime

    class Config:
        from_attributes = True