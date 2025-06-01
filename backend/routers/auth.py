from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Dict, Any
import logging

from backend.schemas.database import get_db
from backend.schemas import Buyer, Seller
from backend.models import BuyerCreate, SellerCreate
from backend.auth import (
    get_password_hash, verify_password, create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from pydantic import BaseModel

# Настройка логирования
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

router = APIRouter(tags=["authentication"])

# Модели для токена аутентификации
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str

class TokenData(BaseModel):
    email: str
    role: str

@router.post("/register/buyer", response_model=Dict[str, Any])
async def register_buyer(buyer: BuyerCreate, db: Session = Depends(get_db)):
    """Регистрация нового покупателя"""
    # Логирование начала обработки регистрации
    logger.info(f"Начата регистрация покупателя с email: {buyer.email}")

    # Проверка существования email
    existing_buyer = db.query(Buyer).filter(Buyer.email == buyer.email).first()
    existing_seller = db.query(Seller).filter(Seller.email == buyer.email).first()

    if existing_buyer or existing_seller:
        logger.warning(f"Попытка регистрации с уже существующим email: {buyer.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )

    try:
        # Создание нового покупателя
        db_buyer = Buyer(
            email=buyer.email,
            password_hash=get_password_hash(buyer.password),
            full_name=buyer.full_name,
            contact_info=buyer.contact_info,
            preferred_brand=buyer.preferred_brand or None,
            preferred_model=buyer.preferred_model or None,
            min_year=buyer.min_year or None,
            max_year=buyer.max_year or None,
            min_power=buyer.min_power or None,
            max_power=buyer.max_power or None,
            preferred_transmission=buyer.preferred_transmission or None,
            preferred_condition=buyer.preferred_condition or None,
            max_price=buyer.max_price or None
        )
        db.add(db_buyer)
        db.commit()
        db.refresh(db_buyer)

        logger.info(f"Покупатель успешно зарегистрирован: {buyer.email}, ID: {db_buyer.id}")
        return {"message": "Покупатель успешно зарегистрирован", "id": db_buyer.id}
    except Exception as e:
        logger.error(f"Ошибка при регистрации покупателя: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации: {str(e)}"
        )

@router.post("/register/seller", response_model=Dict[str, Any])
async def register_seller(seller: SellerCreate, db: Session = Depends(get_db)):
    """Регистрация нового продавца/админа"""
    # Логирование начала обработки регистрации
    logger.info(f"Начата регистрация продавца с email: {seller.email}")

    # Проверка существования email
    existing_buyer = db.query(Buyer).filter(Buyer.email == seller.email).first()
    existing_seller = db.query(Seller).filter(Seller.email == seller.email).first()

    if existing_buyer or existing_seller:
        logger.warning(f"Попытка регистрации с уже существующим email: {seller.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже зарегистрирован"
        )

    try:
        # Создание нового продавца
        db_seller = Seller(
            email=seller.email,
            password_hash=get_password_hash(seller.password),
            full_name=seller.full_name,
            contact_info=seller.contact_info
        )
        db.add(db_seller)
        db.commit()
        db.refresh(db_seller)

        logger.info(f"Продавец успешно зарегистрирован: {seller.email}, ID: {db_seller.id}")
        return {"message": "Продавец успешно зарегистрирован", "id": db_seller.id}
    except Exception as e:
        logger.error(f"Ошибка при регистрации продавца: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка при регистрации: {str(e)}"
        )

@router.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Авторизация пользователя"""
    logger.info(f"Попытка авторизации пользователя: {form_data.username}")

    # Сначала ищем пользователя как покупателя
    user = db.query(Buyer).filter(Buyer.email == form_data.username).first()
    role = "buyer"

    # Если не найден, ищем как продавца
    if not user:
        user = db.query(Seller).filter(Seller.email == form_data.username).first()
        role = "seller"  # Может быть и админом, но обрабатываем одинаково

    # Логирование результатов поиска пользователя
    if not user:
        logger.warning(f"Пользователь не найден: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Проверка пароля
    if not verify_password(form_data.password, user.password_hash):
        logger.warning(f"Неверный пароль для пользователя: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": role}, expires_delta=access_token_expires
    )

    logger.info(f"Пользователь успешно авторизован: {form_data.username}, роль: {role}")
    return {"access_token": access_token, "token_type": "bearer", "role": role}