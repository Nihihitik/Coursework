from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
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
    id: int
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class User(UserBase):
    """Модель пользователя для ответа API"""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True