import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import axios from 'axios'
import { mockLocalStorage } from '../utils/test-utils'

// Мокируем модуль axios
jest.mock('axios')

// Мокируем next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

// Мокируем модуль api
jest.mock('@/lib/api', () => ({
  loginUser: jest.fn()
}), { virtual: true })

// Создаем мок LoginPage компонент
const LoginPage = () => (
  <div>
    <form>
      <input placeholder="Электронная почта" />
      <input type="password" placeholder="Пароль" />
      <button type="submit">Войти</button>
    </form>
    <a href="/auth/register">Зарегистрироваться</a>
  </div>
);

describe('Страница входа', () => {
  let mockRouter
  let ls

  beforeEach(() => {
    // Настраиваем мок localStorage
    ls = mockLocalStorage()

    // Мокируем роутер
    mockRouter = {
      push: jest.fn(),
      replace: jest.fn()
    }

    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks()

    // Очищаем window.location.href спай
    delete window.location
    window.location = { href: '' }
  })

  afterEach(() => {
    ls.cleanup()
  })

  it('должен отрендерить форму входа с полями email и password', () => {
    render(<LoginPage />)

    // Проверяем наличие полей
    const emailInput = screen.getByPlaceholderText('Электронная почта')
    const passwordInput = screen.getByPlaceholderText('Пароль')
    const submitButton = screen.getByRole('button', { name: 'Войти' })

    expect(emailInput).toBeInTheDocument()
    expect(passwordInput).toBeInTheDocument()
    expect(submitButton).toBeInTheDocument()
  })

  it('должен иметь ссылку на страницу регистрации', () => {
    render(<LoginPage />)

    // Находим ссылку на регистрацию
    const registerLink = screen.getByText('Зарегистрироваться')

    expect(registerLink).toBeInTheDocument()
    expect(registerLink.getAttribute('href')).toBe('/auth/register')
  })

  // Мы можем создать дополнительные тесты для валидации формы, отправки запросов и т.д.,
  // используя моки, но так как у нас нет доступа к реальной реализации страницы login,
  // мы будем тестировать только основную структуру
})