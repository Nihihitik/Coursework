from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from backend.schemas.database import get_db
from backend.schemas import Deal, Car
from backend.auth import get_current_buyer, get_current_seller, get_current_user

router = APIRouter(tags=["deals"])

@router.post("", response_model=Dict[str, Any])
async def create_deal(
    car_id: int,
    current_user = Depends(get_current_buyer),
    db: Session = Depends(get_db)
):
    """Создать заявку на покупку автомобиля (только для покупателей)"""
    # Проверка существования автомобиля
    car = db.query(Car).filter(Car.id == car_id).first()
    if not car:
        raise HTTPException(status_code=404, detail="Автомобиль не найден")

    # Проверка наличия активной сделки для этого автомобиля
    existing_deal = db.query(Deal).filter(
        Deal.car_id == car_id,
        Deal.buyer_id == current_user.id,
        Deal.status == "pending"
    ).first()

    if existing_deal:
        raise HTTPException(status_code=400, detail="У вас уже есть заявка на этот автомобиль")

    # Создание новой сделки
    deal = Deal(
        car_id=car_id,
        buyer_id=current_user.id,
        price=car.price,
        status="pending"
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)

    return {"message": "Заявка успешно создана", "deal_id": deal.id}

@router.get("/my", response_model=List[Dict[str, Any]])
async def get_my_deals(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Получить список своих сделок"""
    if hasattr(current_user, 'favorites'):  # Покупатель
        deals = db.query(Deal).filter(Deal.buyer_id == current_user.id).all()
        result = []
        for deal in deals:
            car = deal.car
            result.append({
                "id": deal.id,
                "car": {
                    "id": car.id,
                    "brand": car.brand,
                    "model": car.model,
                    "year": car.year
                },
                "price": deal.price,
                "status": deal.status,
                "deal_date": deal.deal_date.isoformat(),
                "seller_name": car.seller.full_name if car.seller else None
            })
        return result
    else:  # Продавец
        # Получаем все сделки для автомобилей этого продавца
        deals = db.query(Deal).join(Car).filter(Car.seller_id == current_user.id).all()
        result = []
        for deal in deals:
            car = deal.car
            buyer = deal.buyer
            result.append({
                "id": deal.id,
                "car": {
                    "id": car.id,
                    "brand": car.brand,
                    "model": car.model,
                    "year": car.year
                },
                "buyer": {
                    "name": buyer.full_name,
                    "contact": buyer.contact_info
                },
                "price": deal.price,
                "status": deal.status,
                "deal_date": deal.deal_date.isoformat()
            })
        return result

@router.put("/{deal_id}/status", response_model=Dict[str, Any])
async def update_deal_status(
    deal_id: int,
    status: str = Query(..., description="Статус сделки: pending, approved, rejected, completed"),
    current_user = Depends(get_current_seller),
    db: Session = Depends(get_db)
):
    """Обновить статус сделки (только для продавцов/админов)"""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Сделка не найдена")

    # Проверка, что текущий пользователь владеет автомобилем
    if deal.car.seller_id != current_user.id:
        raise HTTPException(status_code=403, detail="У вас нет прав на обновление этой сделки")

    # Проверка валидности статуса
    valid_statuses = ["pending", "approved", "rejected", "completed"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Недопустимый статус. Допустимые значения: {valid_statuses}")

    # Обновление статуса
    deal.status = status
    db.commit()

    return {"message": f"Статус сделки обновлен на {status}"}