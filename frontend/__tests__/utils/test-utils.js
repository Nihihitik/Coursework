import React from 'react'
import { render as rtlRender } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Функция для создания кастомного рендера с провайдерами, если это необходимо
function render(ui, options = {}) {
  // Оберните компоненты необходимыми провайдерами здесь
  const Wrapper = ({ children }) => {
    return <>{children}</>
  }

  return {
    user: userEvent.setup(),
    ...rtlRender(ui, { wrapper: Wrapper, ...options })
  }
}

// Повторно экспортируем все из testing-library
export * from '@testing-library/react'

// Переопределяем функцию рендера
export { render }

// Вспомогательные функции для тестов
export const mockLocalStorage = (items = {}) => {
  // Сохраняем оригинальные методы
  const getItemSpy = jest.spyOn(window.localStorage, 'getItem')
  const setItemSpy = jest.spyOn(window.localStorage, 'setItem')
  const removeItemSpy = jest.spyOn(window.localStorage, 'removeItem')

  // Настраиваем нужные данные
  for (const [key, value] of Object.entries(items)) {
    getItemSpy.mockImplementation((name) => {
      if (name === key) return value
      return null
    })
  }

  return {
    getItemSpy,
    setItemSpy,
    removeItemSpy,
    cleanup: () => {
      getItemSpy.mockRestore()
      setItemSpy.mockRestore()
      removeItemSpy.mockRestore()
    }
  }
}

// Мокирование Axios
export const mockAxios = (response = {}) => {
  const axiosMock = {
    get: jest.fn().mockResolvedValue(response),
    post: jest.fn().mockResolvedValue(response),
    put: jest.fn().mockResolvedValue(response),
    delete: jest.fn().mockResolvedValue(response),
    patch: jest.fn().mockResolvedValue(response),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    create: jest.fn().mockReturnThis()
  }

  return axiosMock
}

// Простые тесты для вспомогательных функций
describe('Test Utils', () => {
  test('mockLocalStorage корректно мокирует localStorage', () => {
    const mockLS = mockLocalStorage({ testKey: 'testValue' })

    expect(localStorage.getItem('testKey')).toBe('testValue')
    expect(localStorage.getItem('nonExistentKey')).toBeNull()

    mockLS.cleanup()
  })

  test('mockAxios создает корректный мок объект', () => {
    const mockAxiosInstance = mockAxios({ data: { foo: 'bar' } })

    expect(mockAxiosInstance.get).toBeDefined()
    expect(mockAxiosInstance.post).toBeDefined()
    expect(mockAxiosInstance.put).toBeDefined()
    expect(mockAxiosInstance.delete).toBeDefined()
    expect(mockAxiosInstance.patch).toBeDefined()

    expect(typeof mockAxiosInstance.get).toBe('function')
  })
})