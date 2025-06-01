from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Хардкод URL для базы данных с явным портом
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/university"

# Создаем подключение к базе данных
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency для FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Это код для создания всех таблиц при запуске приложения
# from .base import Base
# Base.metadata.create_all(bind=engine)