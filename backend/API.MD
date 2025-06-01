# API Документация

Автодилерский центр - API для взаимодействия с системой управления автомобилями, покупателями и продавцами.

## Общая информация

- **Базовый URL**: `/`
- **Формат ответов**: JSON
- **Аутентификация**: JWT Bearer токен (`Authorization: Bearer {token}`)

## Статусы ответов

- **200 OK**: Запрос выполнен успешно
- **201 Created**: Ресурс успешно создан
- **400 Bad Request**: Ошибка в запросе
- **401 Unauthorized**: Требуется аутентификация
- **403 Forbidden**: Доступ запрещен
- **404 Not Found**: Ресурс не найден
- **422 Unprocessable Entity**: Ошибка валидации

## Здоровье системы

### Проверка работоспособности API

```
GET /health
```

**Ответ** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

## Аутентификация

### Регистрация покупателя

```
POST /auth/register/buyer
```

**Тело запроса**:
```json
{
  "email": "email@example.com",
  "password": "secure_password",
  "full_name": "Иван Иванов",
  "contact_info": "123-456-789",
  "preferred_brand": "Toyota",
  "preferred_model": "Camry",
  "min_year": 2019,
  "max_year": 2023,
  "min_power": 150,
  "max_power": 300,
  "preferred_transmission": "АКП",
  "preferred_condition": "new",
  "max_price": 40000
}
```

**Примечания**:
- `preferred_brand`, `preferred_model`, `min_year`, `max_year`, `min_power`, `max_power`, `preferred_transmission`, `preferred_condition`, `max_price` - опциональные поля
- `preferred_transmission` может быть "АКП" или "МКП"
- `preferred_condition` может быть "new" или "used"

**Ответ** (200 OK):
```json
{
  "message": "Покупатель успешно зарегистрирован",
  "id": 1
}
```

### Регистрация продавца

```
POST /auth/register/seller
```

**Тело запроса**:
```json
{
  "email": "seller@example.com",
  "password": "secure_password",
  "full_name": "Петр Петров",
  "contact_info": "987-654-321"
}
```

**Ответ** (200 OK):
```json
{
  "message": "Продавец успешно зарегистрирован",
  "id": 1
}
```

### Получение токена (Вход)

```
POST /auth/token
```

**Тело запроса** (form-data):
```
username: email@example.com
password: secure_password
```

**Ответ** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "role": "buyer" // или "seller"
}
```

## Профиль пользователя

### Получение информации о текущем пользователе

```
GET /users/profile
```

**Заголовки**:
```
Authorization: Bearer {token}
```

**Ответ для покупателя** (200 OK):
```json
{
  "id": 1,
  "email": "buyer@example.com",
  "full_name": "Иван Иванов",
  "contact_info": "123-456-789",
  "role": "buyer",
  "preferences": {
    "preferred_brand": "Toyota",
    "preferred_model": "Camry",
    "min_year": 2019,
    "max_year": 2023,
    "min_power": 150,
    "max_power": 300,
    "preferred_transmission": "АКП",
    "preferred_condition": "new",
    "max_price": 40000
  }
}
```

**Ответ для продавца** (200 OK):
```json
{
  "id": 1,
  "email": "seller@example.com",
  "full_name": "Петр Петров",
  "contact_info": "987-654-321",
  "role": "seller",
  "cars_count": 5
}
```

## Автомобили

### Получение списка всех автомобилей

```
GET /cars
```

**Параметры запроса**:
- `skip` (int, по умолчанию 0): Сколько автомобилей пропустить
- `limit` (int, по умолчанию 100): Максимальное количество автомобилей в ответе
- `brand` (string): Фильтр по бренду
- `model` (string): Фильтр по модели
- `min_year` (int): Минимальный год выпуска
- `max_year` (int): Максимальный год выпуска
- `min_price` (float): Минимальная цена
- `max_price` (float): Максимальная цена
- `condition` (string): Фильтр по состоянию ("new" или "used")
- `transmission` (string): Фильтр по коробке передач ("АКП" или "МКП")
- `max_mileage` (int): Максимальный пробег

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "year": 2021,
    "power": 180,
    "transmission": "АКП",
    "condition": "new",
    "mileage": 5000,
    "features": ["leather seats", "navigation", "bluetooth"],
    "price": 30000,
    "seller_name": "Петр Петров",
    "store_name": "Главный автосалон"
  },
  // ...другие автомобили
]
```

### Получение информации об отдельном автомобиле

```
GET /cars/{car_id}
```

**Ответ** (200 OK):
```json
{
  "id": 1,
  "brand": "Toyota",
  "model": "Camry",
  "year": 2021,
  "power": 180,
  "transmission": "АКП",
  "condition": "new",
  "mileage": 5000,
  "features": ["leather seats", "navigation", "bluetooth"],
  "price": 30000,
  "seller": {
    "name": "Петр Петров",
    "contact_info": "987-654-321"
  },
  "store": {
    "name": "Главный автосалон",
    "address": "ул. Автомобильная, 1"
  }
}
```

### Добавление нового автомобиля

```
POST /cars
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для продавцов
```

**Тело запроса**:
```json
{
  "brand": "Honda",
  "model": "Civic",
  "year": 2021,
  "power": 150,
  "transmission": "АКП",
  "condition": "new",
  "mileage": 1000,
  "features": ["bluetooth", "camera", "heated seats"],
  "price": 25000,
  "store_id": 1
}
```

**Ответ** (200 OK):
```json
{
  "message": "Автомобиль успешно добавлен",
  "id": 2
}
```

### Обновление информации об автомобиле

```
PUT /cars/{car_id}
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для продавцов, владеющих этим автомобилем
```

**Тело запроса**:
```json
{
  "brand": "Honda",
  "model": "Civic",
  "year": 2021,
  "power": 150,
  "transmission": "АКП",
  "condition": "new",
  "mileage": 1500,
  "features": ["bluetooth", "camera", "heated seats", "parking sensors"],
  "price": 26000,
  "store_id": 1
}
```

**Ответ** (200 OK):
```json
{
  "message": "Информация об автомобиле успешно обновлена"
}
```

### Удаление автомобиля

```
DELETE /cars/{car_id}
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для продавцов, владеющих этим автомобилем
```

**Ответ** (200 OK):
```json
{
  "message": "Автомобиль успешно удален"
}
```

## Избранное

### Добавление автомобиля в избранное

```
POST /favorites/{car_id}
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для покупателей
```

**Ответ** (200 OK):
```json
{
  "message": "Автомобиль добавлен в избранное"
}
```

### Удаление автомобиля из избранного

```
DELETE /favorites/{car_id}
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для покупателей
```

**Ответ** (200 OK):
```json
{
  "message": "Автомобиль удален из избранного"
}
```

### Получение списка избранных автомобилей

```
GET /favorites
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для покупателей
```

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "year": 2021,
    "price": 30000,
    "added_at": "2023-06-15T14:30:15.123456"
  },
  // ...другие автомобили
]
```

## Сделки

### Создание заявки на покупку автомобиля

```
POST /deals
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для покупателей
```

**Параметры запроса**:
- `car_id` (int): ID автомобиля

**Ответ** (200 OK):
```json
{
  "message": "Заявка успешно создана",
  "deal_id": 1
}
```

### Получение списка сделок пользователя

```
GET /deals/my
```

**Заголовки**:
```
Authorization: Bearer {token} // Для покупателей и продавцов
```

**Ответ для покупателя** (200 OK):
```json
[
  {
    "id": 1,
    "car": {
      "id": 1,
      "brand": "Toyota",
      "model": "Camry",
      "year": 2021
    },
    "price": 30000,
    "status": "pending",
    "deal_date": "2023-06-15T15:45:30.123456",
    "seller_name": "Петр Петров"
  },
  // ...другие сделки
]
```

**Ответ для продавца** (200 OK):
```json
[
  {
    "id": 1,
    "car": {
      "id": 1,
      "brand": "Toyota",
      "model": "Camry",
      "year": 2021
    },
    "buyer": {
      "name": "Иван Иванов",
      "contact": "123-456-789"
    },
    "price": 30000,
    "status": "pending",
    "deal_date": "2023-06-15T15:45:30.123456"
  },
  // ...другие сделки
]
```

### Обновление статуса сделки

```
PUT /deals/{deal_id}/status
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для продавцов
```

**Параметры запроса**:
- `status` (string): Новый статус сделки. Возможные значения: "pending", "approved", "rejected", "completed"

**Ответ** (200 OK):
```json
{
  "message": "Статус сделки обновлен на approved"
}
```

## Магазины

### Создание нового магазина

```
POST /stores
```

**Заголовки**:
```
Authorization: Bearer {token} // Только для продавцов
```

**Параметры запроса**:
- `name` (string): Название магазина
- `address` (string): Адрес магазина

**Ответ** (200 OK):
```json
{
  "message": "Магазин успешно создан",
  "id": 1
}
```

### Получение списка всех магазинов

```
GET /stores
```

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "name": "Главный автосалон",
    "address": "ул. Автомобильная, 1",
    "cars_count": 10
  },
  // ...другие магазины
]
```

## Аналитические запросы

### Поиск покупателей для автомобиля

```
GET /queries/buyers-for-car
```

**Параметры запроса**:
- `brand` (string): Бренд автомобиля
- `model` (string): Модель автомобиля
- `year` (int): Год выпуска
- `transmission` (string): Тип коробки передач ("АКП" или "МКП")
- `condition` (string): Состояние ("new" или "used")
- `price` (float): Цена

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "full_name": "Иван Иванов",
    "contact_info": "123-456-789",
    "max_price": 40000
  },
  // ...другие покупатели
]
```

### Покупатели, желающие приобрести конкретную модель

```
GET /queries/buyers-by-model
```

**Параметры запроса**:
- `model` (string): Модель автомобиля

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "full_name": "Иван Иванов",
    "contact_info": "123-456-789",
    "preferences": {
      "brand": "Toyota",
      "year_range": "2019-2023",
      "max_price": 40000
    }
  },
  // ...другие покупатели
]
```

### Автомобили с малым пробегом

```
GET /queries/cars-low-mileage
```

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "year": 2021,
    "mileage": 5000,
    "price": 30000,
    "condition": "new"
  },
  // ...другие автомобили с пробегом менее 30 000 км
]
```

### Список новых автомобилей

```
GET /queries/new-cars
```

**Ответ** (200 OK):
```json
[
  {
    "id": 1,
    "brand": "Toyota",
    "model": "Camry",
    "year": 2021,
    "power": 180,
    "transmission": "АКП",
    "price": 30000,
    "seller_name": "Петр Петров"
  },
  // ...другие новые автомобили
]
```

### Анализ рынка

```
GET /queries/market-analysis
```

**Ответ** (200 OK):
```json
{
  "total_buying_power": 500000,
  "total_car_value": 450000,
  "ratio": 1.11,
  "average_buyer_budget": 35000,
  "average_car_price": 30000,
  "buyers_count": 15,
  "cars_count": 15
}
```

### Самый дорогой автомобиль

```
GET /queries/most-expensive-car
```

**Ответ** (200 OK):
```json
{
  "id": 3,
  "brand": "Mercedes-Benz",
  "model": "S-Class",
  "year": 2022,
  "power": 320,
  "transmission": "АКП",
  "condition": "new",
  "mileage": 0,
  "price": 90000,
  "seller": {
    "name": "Александр Сидоров",
    "contact": "111-222-333"
  },
  "store": {
    "name": "Премиум Авто",
    "address": "пр. Элитный, 10"
  }
}
```

## Коды ошибок

- **400** - Неверный запрос (например, автомобиль уже в избранном, email уже зарегистрирован)
- **401** - Требуется авторизация
- **403** - Доступ запрещен (недостаточно прав)
- **404** - Ресурс не найден
- **422** - Ошибка валидации данных
