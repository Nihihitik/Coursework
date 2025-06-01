from fastapi import APIRouter, Depends
from typing import Dict, Any

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