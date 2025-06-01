from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from .base import DealStatus

class DealBase(BaseModel):
    """Базовая модель сделки"""
    car_id: UUID
    buyer_id: UUID
    price: float
    status: DealStatus = DealStatus.PENDING

class DealCreate(DealBase):
    """Модель для создания сделки"""
    pass

class DealInDB(DealBase):
    """Модель сделки в базе данных"""
    id: UUID
    deal_date: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class Deal(DealBase):
    """Модель сделки для ответа API"""
    id: UUID
    deal_date: datetime

    class Config:
        from_attributes = True