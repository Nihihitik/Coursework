# Тестирование Frontend-части

Этот каталог содержит тесты для фронтенд-части проекта, реализованной с помощью Next.js.

## Структура тестов

Тесты организованы по следующим категориям:

- `components/`: Модульные тесты для UI-компонентов
- `lib/`: Тесты для вспомогательных модулей и утилит
- `pages/`: Тесты для страниц приложения
- `integration/`: Интеграционные тесты для проверки взаимодействия между компонентами и страницами
- `utils/`: Вспомогательные утилиты для тестирования

## Инструменты тестирования

- Jest: Основной фреймворк для тестирования
- React Testing Library: Библиотека для тестирования React-компонентов
- User Event: Дополнение к Testing Library для симуляции действий пользователя
- Jest DOM: Расширение Jest для тестирования DOM

## Запуск тестов

### Запуск всех тестов

```bash
npm run test
# или
yarn test
```

### Запуск тестов в режиме наблюдения

```bash
npm run test:watch
# или
yarn test:watch
```

### Запуск тестов с покрытием кода

```bash
npm run test:coverage
# или
yarn test:coverage
```

### Запуск конкретного теста или группы тестов

```bash
npm test -- -t "имя теста"
# или
yarn test -t "имя теста"
```

## Добавление новых тестов

При создании новых тестов следуйте этим рекомендациям:

1. Используйте именование файлов в формате `ИмяКомпонента.test.js`
2. Размещайте тесты в соответствующих директориях
3. Импортируйте вспомогательные функции из `utils/test-utils.js`
4. Используйте функцию `render` из наших утилит вместо стандартной
5. Применяйте `describe` и `it` для организации тестов
6. Используйте `beforeEach` и `afterEach` для настройки и очистки между тестами

## Моки

В тестах используются следующие моки:

- axios: Для имитации API-запросов
- next/navigation: Для имитации Next.js роутера
- localStorage: Для тестирования работы с локальным хранилищем

## Пример написания теста

```jsx
import React from 'react'
import { render, screen, fireEvent } from '../utils/test-utils'
import { Button } from '@/components/ui/button'

describe('Button компонент', () => {
  it('должен вызывать обработчик клика', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Тест</Button>)

    const button = screen.getByRole('button', { name: /тест/i })
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```