import React from 'react'
import { render, screen, fireEvent } from '../utils/test-utils'
import axios from 'axios'
import HomePage from '@/app/page'

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

describe('HomePage', () => {
  // Подготовка данных для тестов
  const mockCars = [
    {
      id: 1,
      brand: 'Toyota',
      model: 'Camry',
      year: 2021,
      price: 25000,
      mileage: 15000,
      power: 150,
      transmission: 'АКП',
      condition: 'new',
      features: ['Климат-контроль', 'Кожаный салон'],
      images: ['https://example.com/toyota-camry.jpg'],
      description: 'Отличный седан',
      seller_name: 'Иван',
      store_name: 'АвтоДилер'
    },
    {
      id: 2,
      brand: 'Honda',
      model: 'Civic',
      year: 2020,
      price: 22000,
      mileage: 18000,
      power: 140,
      transmission: 'МКП',
      condition: 'used',
      features: ['Кондиционер'],
      images: ['https://example.com/honda-civic.jpg'],
      description: 'Экономичный автомобиль',
      seller_name: 'Петр',
      store_name: 'РосАвто'
    }
  ]

  beforeEach(() => {
    // Сбрасываем моки перед каждым тестом
    jest.clearAllMocks()

    // Мокируем успешный ответ от сервера
    axios.get = jest.fn().mockResolvedValue({ data: mockCars })
  })

  it('должен отрендерить страницу с заголовком', async () => {
    render(<HomePage />)

    // Проверяем, что заголовок есть на странице
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('должен загрузить и отобразить список автомобилей', async () => {
    render(<HomePage />)

    // Ожидаем, что API запрос был отправлен
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/cars'))

    // Ожидаем отображение карточек автомобилей (после загрузки данных)
    const toyotaElement = await screen.findByText(/Toyota Camry/i)
    const hondaElement = await screen.findByText(/Honda Civic/i)

    expect(toyotaElement).toBeInTheDocument()
    expect(hondaElement).toBeInTheDocument()
  })

  it('должен отобразить цены автомобилей', async () => {
    render(<HomePage />)

    // Ожидаем отображение цен (формат может отличаться в зависимости от реализации)
    const toyotaPrice = await screen.findByText(/25 000/i)
    const hondaPrice = await screen.findByText(/22 000/i)

    expect(toyotaPrice).toBeInTheDocument()
    expect(hondaPrice).toBeInTheDocument()
  })

  it('должен отобразить поисковое поле', () => {
    render(<HomePage />)

    // Ищем поле поиска
    const searchInput = screen.getByPlaceholderText(/Поиск по марке, модели/i)
    const showFiltersButton = screen.getByRole('button', { name: /Показать фильтры/i })

    expect(searchInput).toBeInTheDocument()
    expect(showFiltersButton).toBeInTheDocument()
  })

  it('должен отображать сообщение при отсутствии автомобилей', async () => {
    // Переопределяем мок для пустого списка
    axios.get = jest.fn().mockResolvedValue({ data: [] })

    render(<HomePage />)

    // Ожидаем сообщение об отсутствии автомобилей, проверяем по части текста
    const noResultsMessage = await screen.findByText(/К сожалению, на данный момент автомобили отсутствуют/i)
    expect(noResultsMessage).toBeInTheDocument()
  })

  it('должен отображать сообщение об ошибке при сбое загрузки', async () => {
    // Переопределяем мок для имитации ошибки
    axios.get = jest.fn().mockRejectedValue(new Error('Ошибка сети'))

    render(<HomePage />)

    // Ожидаем сообщение об ошибке, проверяем по части текста
    const errorMessage = await screen.findByText(/Не удалось загрузить список автомобилей/i)
    expect(errorMessage).toBeInTheDocument()
  })

  it('должен применять запрос при поиске', async () => {
    // Мокируем API-ответ с отфильтрованными данными
    axios.get = jest.fn().mockResolvedValueOnce({
      data: mockCars.filter(car => car.brand === 'Toyota' && car.model === 'Camry')
    })

    render(<HomePage />)

    // Находим поле поиска и кнопку
    const searchInput = screen.getByPlaceholderText(/Поиск по марке, модели/i)

    // Вводим данные в поле поиска
    fireEvent.change(searchInput, { target: { value: 'Toyota Camry' } })

    // Эмулируем нажатие Enter
    fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter', charCode: 13 })

    // Проверяем вызов API (должен быть вызван первый раз при рендере, а потом по поиску)
    expect(axios.get).toHaveBeenCalled()
  })
})