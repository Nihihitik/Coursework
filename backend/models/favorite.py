from pydantic import BaseModel, Field
from datetime import datetime

class FavoriteBase(BaseModel):
    """Базовая модель избранного"""
    buyer_id: int
    car_id: int

class FavoriteCreate(FavoriteBase):
    """Модель для создания избранного"""
    pass

class FavoriteInDB(FavoriteBase):
    """Модель избранного в базе данных"""
    id: int
    added_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class Favorite(FavoriteBase):
    """Модель избранного для ответа API"""
    id: int
    added_at: datetime

    class Config:
        from_attributes = True