"use client";

import { useEffect, useState } from 'react';
import { getAllCars, addCarToFavorites, removeFromFavorites } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Интерфейс для автомобиля
interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string;
  image_url: string;
  is_favorite?: boolean;
}

// Интерфейс для фильтров
interface Filters {
  make?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  transmission?: string;
  fuel_type?: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  // Получаем список производителей для фильтра
  const makes = [...new Set(cars.map(car => car.make))].sort();

  // Получаем минимальную и максимальную цены для фильтра
  const minPriceAvailable = cars.length ? Math.min(...cars.map(car => car.price)) : 0;
  const maxPriceAvailable = cars.length ? Math.max(...cars.map(car => car.price)) : 5000000;

  // Получаем минимальный и максимальный года для фильтра
  const minYearAvailable = cars.length ? Math.min(...cars.map(car => car.year)) : 2000;
  const maxYearAvailable = cars.length ? Math.max(...cars.map(car => car.year)) : new Date().getFullYear();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        const carsData = await getAllCars(filters);
        setCars(carsData);
      } catch (error) {
        console.error('Ошибка при загрузке автомобилей:', error);
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    setIsLoggedIn(!!token);
    setUserRole(role);

    fetchCars();
  }, [filters]);

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const resetFilters = () => {
    setFilters({});
  };

  const toggleFavorite = async (carId: number) => {
    try {
      if (!isLoggedIn) {
        router.push('/auth/login');
        return;
      }

      // Находим автомобиль в списке
      const car = cars.find(car => car.id === carId);

      if (car) {
        if (car.is_favorite) {
          await removeFromFavorites(carId);
        } else {
          await addCarToFavorites(carId);
        }

        // Обновляем состояние автомобилей
        setCars(prevCars =>
          prevCars.map(c =>
            c.id === carId ? { ...c, is_favorite: !c.is_favorite } : c
          )
        );
      }
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Каталог автомобилей</h1>
          <div className="flex gap-4">
            {isLoggedIn ? (
              <Link href={`/dashboard/${userRole}`} className="text-sm text-gray-600 hover:text-gray-900 transition">
                Личный кабинет
              </Link>
            ) : (
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition">
                Войти
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Фильтры */}
          <div className="w-full md:w-1/4">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Фильтры</h2>

              <div className="space-y-4">
                {/* Марка автомобиля */}
                <div>
                  <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                    Марка
                  </label>
                  <select
                    id="make"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={filters.make || ''}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                  >
                    <option value="">Все марки</option>
                    {makes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Цена */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Цена (₽)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="От"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={filters.minPrice || ''}
                        onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="До"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={filters.maxPrice || ''}
                        onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>

                {/* Год выпуска */}
                <div>
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                    Год выпуска
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        placeholder="От"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={filters.minYear || ''}
                        onChange={(e) => handleFilterChange('minYear', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="До"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={filters.maxYear || ''}
                        onChange={(e) => handleFilterChange('maxYear', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>
                </div>

                {/* Тип коробки передач */}
                <div>
                  <label htmlFor="transmission" className="block text-sm font-medium text-gray-700">
                    Коробка передач
                  </label>
                  <select
                    id="transmission"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={filters.transmission || ''}
                    onChange={(e) => handleFilterChange('transmission', e.target.value)}
                  >
                    <option value="">Все типы</option>
                    <option value="automatic">Автоматическая</option>
                    <option value="manual">Механическая</option>
                    <option value="robot">Роботизированная</option>
                    <option value="variator">Вариатор</option>
                  </select>
                </div>

                {/* Тип топлива */}
                <div>
                  <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700">
                    Тип топлива
                  </label>
                  <select
                    id="fuel_type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={filters.fuel_type || ''}
                    onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                  >
                    <option value="">Все типы</option>
                    <option value="petrol">Бензин</option>
                    <option value="diesel">Дизель</option>
                    <option value="gas">Газ</option>
                    <option value="hybrid">Гибрид</option>
                    <option value="electric">Электро</option>
                  </select>
                </div>

                {/* Кнопка сброса фильтров */}
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition mt-4"
                >
                  Сбросить фильтры
                </button>
              </div>
            </div>
          </div>

          {/* Список автомобилей */}
          <div className="w-full md:w-3/4">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            ) : cars.length === 0 ? (
              <div className="bg-white shadow-sm rounded-lg p-12 text-center">
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Автомобили не найдены</h2>
                <p className="text-gray-500">Попробуйте изменить параметры фильтрации</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div key={car.id} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="relative h-48 bg-gray-200">
                      {car.image_url ? (
                        <img
                          src={car.image_url}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          Фото отсутствует
                        </div>
                      )}
                      <button
                        onClick={() => toggleFavorite(car.id)}
                        className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill={car.is_favorite ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={car.is_favorite ? "text-red-500" : "text-gray-400"}
                        >
                          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <Link href={`/cars/${car.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {car.make} {car.model}
                        </h3>
                      </Link>
                      <p className="text-xl font-bold text-gray-900 mt-2">
                        {car.price.toLocaleString()} ₽
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Год выпуска</p>
                          <p className="text-sm font-medium">{car.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Пробег</p>
                          <p className="text-sm font-medium">{car.mileage.toLocaleString()} км</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">КПП</p>
                          <p className="text-sm font-medium">
                            {car.transmission === 'automatic' ? 'Автомат' :
                             car.transmission === 'manual' ? 'Механика' :
                             car.transmission === 'robot' ? 'Робот' :
                             car.transmission === 'variator' ? 'Вариатор' : car.transmission}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Топливо</p>
                          <p className="text-sm font-medium">
                            {car.fuel_type === 'petrol' ? 'Бензин' :
                             car.fuel_type === 'diesel' ? 'Дизель' :
                             car.fuel_type === 'gas' ? 'Газ' :
                             car.fuel_type === 'hybrid' ? 'Гибрид' :
                             car.fuel_type === 'electric' ? 'Электро' : car.fuel_type}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href={`/cars/${car.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}