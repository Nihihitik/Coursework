from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

# Импорт схем и моделей
from backend.schemas.database import engine
from backend.schemas.base import Base

# Импорт роутеров
from backend.routers import auth, cars, users, favorites, deals, stores, queries

# Создание всех таблиц при запуске приложения
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Dealership API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Адрес фронтенда
    allow_credentials=True,
    allow_methods=["*"],  # Все HTTP-методы
    allow_headers=["*"],  # Все заголовки
)

# Подключение роутеров
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(cars.router, prefix="/cars", tags=["cars"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
app.include_router(deals.router, prefix="/deals", tags=["deals"])
app.include_router(stores.router, prefix="/stores", tags=["stores"])
app.include_router(queries.router, prefix="/queries", tags=["queries"])

@app.get("/health")
async def health_check():
    """Проверка работоспособности API"""
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
