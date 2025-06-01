from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Можно настроить на чтение из переменных окружения или конфигурационного файла
SQLALCHEMY_DATABASE_URL = "sqlite:///./car_dealership.db"
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@localhost/car_dealership"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
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