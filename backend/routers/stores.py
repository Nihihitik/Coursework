from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.schemas.database import get_db
from backend.schemas import Store
from backend.auth import get_current_seller

router = APIRouter(tags=["stores"])

@router.post("", response_model=Dict[str, Any])
async def create_store(
    name: str,
    address: str,
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Создать новый магазин (только для продавцов/админов)"""
    store = Store(name=name, address=address)
    db.add(store)
    db.commit()
    db.refresh(store)

    return {"message": "Магазин успешно создан", "id": store.id}

@router.get("", response_model=List[Dict[str, Any]])
async def get_stores(db: Session = Depends(get_db)):
    """Получить список всех магазинов"""
    stores = db.query(Store).all()

    return [
        {
            "id": store.id,
            "name": store.name,
            "address": store.address,
            "cars_count": len(store.cars)
        }
        for store in stores
    ]