# Car Dealership API

Бэкенд-сервис для системы продажи автомобилей на базе FastAPI.

## Требования

- Python 3.8+
- PostgreSQL

## Установка

1. Клонировать репозиторий:

```bash
git clone <repository-url>
cd Coursework/backend
```

2. Создать и активировать виртуальное окружение:

```bash
python -m venv venv
source venv/bin/activate  # для Linux/Mac
venv\Scripts\activate     # для Windows
```

3. Установить зависимости:

```bash
pip install -r requirements.txt
```

4. Создать файл конфигурации `.env`:

```bash
cp env.example .env
```

5. Отредактировать файл `.env`, указав свои настройки базы данных и безопасности.

6. Создать базу данных в PostgreSQL:

```bash
createdb car_dealership  # или создать через GUI
```

## Миграции базы данных

1. Инициализировать Alembic (если еще не инициализирован):

```bash
alembic init migrations
```

2. Настроить миграции в файле `alembic.ini`, указав правильный URL базы данных.

3. Создать и применить миграции:

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Запуск

```bash
python main.py
```

или

```bash
uvicorn main:app --reload
```

API будет доступен по адресу http://localhost:8000

## Документация API

После запуска API, документация доступна по следующим адресам:
- OpenAPI спецификация: http://localhost:8000/openapi.json
- Swagger UI: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

## Структура проекта

```
backend/
├── migrations/     # Миграции Alembic
├── models/         # Модели Pydantic
├── schemas/        # Схемы SQLAlchemy
├── alembic.ini     # Конфигурация Alembic
├── auth.py         # Функции аутентификации
├── main.py         # Точка входа, определения маршрутов API
└── requirements.txt # Зависимости проекта
```

## Основные функции API

- Регистрация и авторизация пользователей (покупателей и продавцов)
- Управление автомобилями (добавление, просмотр, обновление, удаление)
- Управление избранными автомобилями
- Создание и управление сделками по покупке автомобилей
- Управление автосалонами
- Специальные запросы для анализа рынка