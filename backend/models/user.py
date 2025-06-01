from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional
from .base import UserRole

class UserBase(BaseModel):
    """Базовая модель пользователя"""
    email: EmailStr
    role: UserRole

class UserCreate(UserBase):
    """Модель для создания пользователя"""
    password: str

class UserInDB(UserBase):
    """Модель пользователя в базе данных"""
    id: UUID
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class User(UserBase):
    """Модель пользователя для ответа API"""
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True