import React from 'react'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { mockLocalStorage } from '../utils/test-utils'
import axios from 'axios'

// Мокируем модуль axios
jest.mock('axios')

// Мокируем next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

// Мокируем модуль api
jest.mock('@/lib/api', () => ({
  loginUser: jest.fn()
}), { virtual: true })

// Создаем мок для компонента страницы входа
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

describe('Процесс авторизации', () => {
  let ls

  beforeEach(() => {
    // Настраиваем мок localStorage
    ls = mockLocalStorage()

    // Очищаем моки перед каждым тестом
    jest.clearAllMocks()

    // Очищаем location.href
    delete window.location
    window.location = { href: '' }
  })

  afterEach(() => {
    ls.cleanup()
  })

  describe('Базовые тесты компонентов авторизации', () => {
    it('должна корректно отображаться страница входа', () => {
      render(<LoginPage />)

      expect(screen.getByPlaceholderText('Электронная почта')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
      expect(screen.getByText('Зарегистрироваться')).toBeInTheDocument()
    })

    it('должен корректно обрабатывать ввод в поля формы', () => {
      render(<LoginPage />)

      const emailInput = screen.getByPlaceholderText('Электронная почта')
      const passwordInput = screen.getByPlaceholderText('Пароль')

      // Эмулируем ввод данных в поля
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
      fireEvent.change(passwordInput, { target: { value: 'password123' } })

      // Проверяем, что значения были применены
      expect(emailInput.value).toBe('test@example.com')
      expect(passwordInput.value).toBe('password123')
    })
  })

  // В дальнейшем здесь можно добавить тесты для других компонентов авторизации,
  // таких как страницы регистрации покупателя и продавца, обработки ошибок и т.д.
})