# Car Dealership API

API для автосалона, разработанное с использованием FastAPI и SQLAlchemy.

## Структура проекта

```
backend/
│
├── routers/                 # Маршруты API по категориям
│   ├── __init__.py
│   ├── auth.py              # Авторизация и регистрация
│   ├── cars.py              # Управление автомобилями
│   ├── deals.py             # Управление сделками
│   ├── favorites.py         # Управление избранным
│   ├── users.py             # Профили пользователей
│   ├── stores.py            # Управление магазинами
│   └── queries.py           # Специальные запросы
│
├── models/                  # Pydantic модели для API
│   └── __init__.py
│
├── schemas/                 # Модели SQLAlchemy для БД
│   ├── __init__.py
│   ├── database.py          # Настройки БД
│   └── base.py              # Базовая модель
│
├── tests/                   # Тесты
│   ├── __init__.py
│   ├── conftest.py          # Фикстуры для тестов
│   ├── test_auth.py         # Тесты авторизации
│   ├── test_cars.py         # Тесты управления автомобилями
│   ├── test_deals.py        # Тесты управления сделками
│   ├── test_favorites.py    # Тесты избранного
│   ├── test_users.py        # Тесты профилей пользователей
│   ├── test_stores.py       # Тесты магазинов
│   ├── test_queries.py      # Тесты специальных запросов
│   └── test_health.py       # Базовый тест работоспособности
│
├── auth.py                  # Функции аутентификации
├── main.py                  # Основной файл приложения
├── __init__.py
├── requirements.txt         # Зависимости проекта
└── alembic.ini              # Конфигурация миграций
```

## Настройка проекта

### Создание виртуальной среды

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

### Установка зависимостей

```bash
pip install -r requirements.txt
```

### Настройка переменных окружения

Создайте файл `.env` на основе примера `env.example`:

```bash
cp env.example .env
```

Откройте файл `.env` и укажите свои значения для переменных окружения:

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=car_dealership
DB_HOST=localhost
DB_PORT=5432
SECRET_KEY=your_secret_key
```

### Миграции базы данных

```bash
alembic upgrade head
```

## Запуск сервера

```bash
uvicorn backend.main:app --reload
```

После запуска сервер будет доступен по адресу: http://localhost:8000

## Запуск тестов

```bash
pytest -v
```

## API документация

После запуска сервера, документация API доступна по адресам:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Основные эндпоинты API

### Аутентификация

- `POST /auth/register/buyer` - Регистрация нового покупателя
- `POST /auth/register/seller` - Регистрация нового продавца
- `POST /auth/token` - Получение токена авторизации

### Автомобили

- `GET /cars` - Список всех автомобилей (с фильтрацией)
- `GET /cars/{car_id}` - Детальная информация об автомобиле
- `POST /cars` - Добавление нового автомобиля (только для продавцов)
- `PUT /cars/{car_id}` - Обновление информации об автомобиле
- `DELETE /cars/{car_id}` - Удаление автомобиля

### Избранное

- `GET /favorites` - Список избранных автомобилей
- `POST /favorites/{car_id}` - Добавление автомобиля в избранное
- `DELETE /favorites/{car_id}` - Удаление автомобиля из избранного

### Сделки

- `POST /deals` - Создание заявки на покупку
- `GET /deals/my` - Список своих сделок
- `PUT /deals/{deal_id}/status` - Обновление статуса сделки

### Пользователи

- `GET /users/profile` - Получение информации о текущем пользователе

### Магазины

- `GET /stores` - Список всех магазинов
- `POST /stores` - Создание нового магазина

### Специальные запросы

- `GET /queries/buyers-for-car` - Покупатели для автомобиля с заданными параметрами
- `GET /queries/buyers-by-model` - Покупатели, желающие приобрести автомобиль заданной модели
- `GET /queries/cars-low-mileage` - Автомобили с пробегом меньше 30 тыс. км
- `GET /queries/new-cars` - Новые автомобили
- `GET /queries/market-analysis` - Анализ рынка
- `GET /queries/most-expensive-car` - Самый дорогой автомобиль

### Системные

- `GET /health` - Проверка работоспособности API