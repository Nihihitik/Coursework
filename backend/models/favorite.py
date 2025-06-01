from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class FavoriteBase(BaseModel):
    """Базовая модель избранного"""
    buyer_id: UUID
    car_id: UUID

class FavoriteCreate(FavoriteBase):
    """Модель для создания избранного"""
    pass

class FavoriteInDB(FavoriteBase):
    """Модель избранного в базе данных"""
    id: UUID
    added_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class Favorite(FavoriteBase):
    """Модель избранного для ответа API"""
    id: UUID
    added_at: datetime

    class Config:
        from_attributes = True