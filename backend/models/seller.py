from pydantic import BaseModel
from typing import Optional

class SellerBase(BaseModel):
    """Базовая модель продавца"""
    full_name: str
    contact_info: str

class SellerCreate(SellerBase):
    """Модель для создания продавца"""
    email: str
    password: str

class SellerInDB(SellerBase):
    """Модель продавца в базе данных"""
    id: int

    class Config:
        from_attributes = True

class Seller(SellerBase):
    """Модель продавца для ответа API"""
    id: int

    class Config:
        from_attributes = True