from fastapi import FastAPI, Depends
import uvicorn
from sqlalchemy.orm import Session

# Импорт схем и зависимостей для базы данных
from schemas.database import get_db, engine
from schemas.base import Base

# Создание таблиц при запуске приложения
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Car Dealership API")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
