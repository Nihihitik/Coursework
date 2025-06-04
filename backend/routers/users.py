from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any
from sqlalchemy.orm import Session

from backend.schemas.database import get_db
from backend.schemas import Buyer, Seller
from backend.models import BuyerUpdate, SellerUpdate

from backend.auth import get_current_user

router = APIRouter(tags=["users"])

@router.get("/profile", response_model=Dict[str, Any])
async def get_profile(current_user = Depends(get_current_user)):
    """Получить информацию о текущем пользователе"""
    if hasattr(current_user, 'favorites'):  # Покупатель
        return {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "contact_info": current_user.contact_info,
            "role": "buyer",
            "preferences": {
                "preferred_brand": current_user.preferred_brand,
                "preferred_model": current_user.preferred_model,
                "min_year": current_user.min_year,
                "max_year": current_user.max_year,
                "min_power": current_user.min_power,
                "max_power": current_user.max_power,
                "preferred_transmission": current_user.preferred_transmission,
                "preferred_condition": current_user.preferred_condition,
                "max_price": current_user.max_price
            }
        }
    else:  # Продавец
        return {
            "id": current_user.id,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "contact_info": current_user.contact_info,
            "role": "seller",
            "cars_count": len(current_user.cars)
        }

@router.put("/profile", response_model=Dict[str, Any])
async def update_profile(
    user_update: BuyerUpdate | SellerUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Обновить данные текущего пользователя"""

    if hasattr(current_user, 'favorites'):  # Покупатель
        buyer: Buyer = db.query(Buyer).filter(Buyer.id == current_user.id).first()
        if not buyer:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(buyer, field, value)
        db.commit()
        db.refresh(buyer)
        current = buyer
        role = "buyer"
    else:
        seller: Seller = db.query(Seller).filter(Seller.id == current_user.id).first()
        if not seller:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(seller, field, value)
        db.commit()
        db.refresh(seller)
        current = seller
        role = "seller"

    return {
        "message": "Профиль успешно обновлен",
        "id": current.id,
        "email": current.email,
        "full_name": current.full_name,
        "contact_info": current.contact_info,
        "role": role
    }


@router.delete("/profile", response_model=Dict[str, Any])
async def delete_profile(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Удалить текущий аккаунт"""

    if hasattr(current_user, 'favorites'):
        user = db.query(Buyer).filter(Buyer.id == current_user.id).first()
    else:
        user = db.query(Seller).filter(Seller.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    db.delete(user)
    db.commit()

    return {"message": "Пользователь удален"}
