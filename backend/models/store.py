from pydantic import BaseModel
class StoreBase(BaseModel):
    """Базовая модель магазина"""
    name: str
    address: str

class StoreCreate(StoreBase):
    """Модель для создания магазина"""
    pass

class StoreInDB(StoreBase):
    """Модель магазина в базе данных"""
    id: int

    class Config:
        from_attributes = True

class Store(StoreBase):
    """Модель магазина для ответа API"""
    id: int

    class Config:
        from_attributes = True