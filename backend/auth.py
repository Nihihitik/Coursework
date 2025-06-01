from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.schemas.database import get_db
from backend.schemas import Buyer, Seller

# Настройка через переменные окружения
from os import environ

# Конфигурация
SECRET_KEY = environ.get("SECRET_KEY", "your-secret-key-here")  # Переменная окружения или значение по умолчанию
ALGORITHM = environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def verify_password(plain_password, hashed_password):
    """Проверка пароля по хешу"""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except:
        return False

def get_password_hash(password):
    """Генерация хеша пароля"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Создание JWT токена доступа"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Получение текущего пользователя из JWT токена"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить учетные данные",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Поиск пользователя по email и роли
    if role == "buyer":
        user = db.query(Buyer).filter(Buyer.email == email).first()
    elif role in ["seller", "admin"]:
        user = db.query(Seller).filter(Seller.email == email).first()
    else:
        raise credentials_exception

    if user is None:
        raise credentials_exception

    # Добавление роли к объекту пользователя
    user.role = role
    return user

async def get_current_buyer(current_user = Depends(get_current_user)):
    """Проверка, что текущий пользователь - покупатель"""
    if not hasattr(current_user, 'favorites'):  # У покупателей есть избранное
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ ограничен только для покупателей"
        )
    return current_user

async def get_current_seller(current_user = Depends(get_current_user)):
    """Проверка, что текущий пользователь - продавец или админ"""
    if not hasattr(current_user, 'cars'):  # У продавцов есть машины
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ ограничен только для продавцов/админов"
        )
    return current_user