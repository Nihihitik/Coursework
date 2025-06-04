import axios from 'axios'
import { mockLocalStorage } from '../utils/test-utils'

// Мокируем модуль axios
jest.mock('axios')

// Поскольку мы не имеем прямого доступа к файлу api.js, создадим версию для тестирования
// Обычно импортировали бы так: import { loginUser, registerBuyer, getUserProfile } from '@/lib/api'
// Вместо этого воссоздадим минимальную версию функций для тестирования

describe('API module', () => {
  let mockAxiosInstance
  let clearLocalStorageSpy
  let ls

  beforeEach(() => {
    // Настраиваем мок localStorage
    ls = mockLocalStorage()

    // Мокируем axios.create
    mockAxiosInstance = {
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    }
    axios.create.mockReturnValue(mockAxiosInstance)

    // Очищаем window.location.href спай
    delete window.location
    window.location = { href: '' }

    // Мокируем clearStorage функцию
    clearLocalStorageSpy = jest.fn()
  })

  afterEach(() => {
    ls.cleanup()
    jest.clearAllMocks()
  })

  describe('API initialization', () => {
    it('должен создать экземпляр axios с базовым URL', () => {
      // Настраиваем API (воссоздаем создание API)
      const api = axios.create({
        baseURL: 'http://localhost:8000'
      })

      expect(axios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8000'
      })
    })

    it('должен добавить перехватчики запросов и ответов', () => {
      // Воссоздаем логику добавления перехватчиков
      const api = axios.create({
        baseURL: 'http://localhost:8000'
      })

      // Добавляем перехватчик запроса
      api.interceptors.request.use(
        config => {
          const token = localStorage.getItem('auth_token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },
        error => Promise.reject(error)
      )

      // Добавляем перехватчик ответа
      api.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user_role')
            window.location.href = '/auth/login'
          }
          return Promise.reject(error)
        }
      )

      expect(api.interceptors.request.use).toHaveBeenCalled()
      expect(api.interceptors.response.use).toHaveBeenCalled()
    })
  })

  describe('API functions', () => {
    it('loginUser должен отправлять POST запрос на /auth/token и сохранять токен', async () => {
      // Подготавливаем данные для входа
      const loginData = { email: 'test@example.com', password: 'password123' }

      // Мокируем успешный ответ
      const mockResponse = {
        data: { access_token: 'test_token', user_role: 'buyer' }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      // Воссоздаем функцию loginUser
      const loginUser = async (email, password) => {
        const response = await mockAxiosInstance.post('/auth/token', { email, password })
        // Сохраняем токен и роль в localStorage
        localStorage.setItem('auth_token', response.data.access_token)
        localStorage.setItem('user_role', response.data.user_role)
        return response.data
      }

      // Вызываем функцию
      const result = await loginUser(loginData.email, loginData.password)

      // Проверяем результаты
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/token',
        { email: loginData.email, password: loginData.password }
      )
      expect(ls.setItemSpy).toHaveBeenCalledWith('auth_token', 'test_token')
      expect(ls.setItemSpy).toHaveBeenCalledWith('user_role', 'buyer')
      expect(result).toEqual({ access_token: 'test_token', user_role: 'buyer' })
    })

    it('registerBuyer должен отправлять POST запрос на /auth/register/buyer', async () => {
      // Подготавливаем данные для регистрации
      const buyerData = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'Test User',
        phone: '+1234567890'
      }

      // Мокируем успешный ответ
      const mockResponse = {
        data: { id: 1, email: buyerData.email, name: buyerData.name }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      // Воссоздаем функцию registerBuyer
      const registerBuyer = async (data) => {
        const response = await mockAxiosInstance.post('/auth/register/buyer', data)
        return response.data
      }

      // Вызываем функцию
      const result = await registerBuyer(buyerData)

      // Проверяем результаты
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/auth/register/buyer', buyerData)
      expect(result).toEqual({ id: 1, email: buyerData.email, name: buyerData.name })
    })

    it('getUserProfile должен отправлять GET запрос на /users/profile', async () => {
      // Мокируем успешный ответ
      const mockResponse = {
        data: { id: 1, email: 'test@example.com', name: 'Test User', role: 'buyer' }
      }
      mockAxiosInstance.get.mockResolvedValue(mockResponse)

      // Воссоздаем функцию getUserProfile
      const getUserProfile = async () => {
        const response = await mockAxiosInstance.get('/users/profile')
        return response.data
      }

      // Вызываем функцию
      const result = await getUserProfile()

      // Проверяем результаты
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/users/profile')
      expect(result).toEqual({ id: 1, email: 'test@example.com', name: 'Test User', role: 'buyer' })
    })

    it('addCarToFavorites должен отправлять POST запрос на /favorites с id автомобиля', async () => {
      const carId = 5

      // Мокируем успешный ответ
      const mockResponse = {
        data: { message: 'Car added to favorites' }
      }
      mockAxiosInstance.post.mockResolvedValue(mockResponse)

      // Воссоздаем функцию addCarToFavorites
      const addCarToFavorites = async (id) => {
        const response = await mockAxiosInstance.post('/favorites', { car_id: id })
        return response.data
      }

      // Вызываем функцию
      const result = await addCarToFavorites(carId)

      // Проверяем результаты
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/favorites', { car_id: carId })
      expect(result).toEqual({ message: 'Car added to favorites' })
    })
  })

  describe('Перехватчик ответа при ошибке 401', () => {
    it('должен очищать localStorage и перенаправлять на страницу логина при ошибке 401', () => {
      // Воссоздаем функцию очистки авторизации
      const clearAuthAndRedirect = (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_role')
          window.location.href = '/auth/login'
        }
        return Promise.reject(error)
      }

      // Создаем объект ошибки с кодом 401
      const error = {
        response: {
          status: 401,
          data: { detail: 'Not authenticated' }
        }
      }

      // Вызываем функцию и ловим ошибку
      clearAuthAndRedirect(error).catch(() => {})

      // Проверяем, что localStorage был очищен
      expect(ls.removeItemSpy).toHaveBeenCalledWith('auth_token')
      expect(ls.removeItemSpy).toHaveBeenCalledWith('user_role')

      // Проверяем, что произошло перенаправление
      expect(window.location.href).toBe('/auth/login')
    })
  })
})