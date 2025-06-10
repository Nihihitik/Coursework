"use client";

import { useEffect, useState } from 'react';
import { getAllCars, addCarToFavorites, removeFromFavorites, getCarById } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Интерфейс для автомобиля
interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  color: string;
  image_url: string;
  is_favorite?: boolean;
  status?: 'active' | 'inactive' | 'sold';
}

// Интерфейс для фильтров
interface Filters {
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  min_year?: number;
  max_year?: number;
  transmission?: string;
  fuel_type?: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const router = useRouter();

  // Получаем список производителей для фильтра
  const makes = cars.length ? [...new Set(cars.map(car => car.brand).filter(Boolean))].sort() : [];

  // Получаем минимальную и максимальную цены для фильтра
  const minPriceAvailable = cars.length ? Math.min(...cars.map(car => car.price || 0)) : 0;
  const maxPriceAvailable = cars.length ? Math.max(...cars.map(car => car.price || 0)) : 5000000;

  // Получаем минимальный и максимальный года для фильтра
  const minYearAvailable = cars.length ? Math.min(...cars.map(car => car.year || 2000)) : 2000;
  const maxYearAvailable = cars.length ? Math.max(...cars.map(car => car.year || new Date().getFullYear())) : new Date().getFullYear();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);

        // Преобразование фильтров для соответствия API
        const apiFilters = {
          brand: filters.brand,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          min_year: filters.min_year,
          max_year: filters.max_year,
          transmission: filters.transmission,
          fuel_type: filters.fuel_type
        };

        // Удаление неопределенных значений
        Object.keys(apiFilters).forEach(key => {
          if (apiFilters[key] === undefined || apiFilters[key] === '') {
            delete apiFilters[key];
          }
        });

        const carsData = await getAllCars(apiFilters);
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
    // Проверяем, не пустое ли значение для числовых полей
    if ((name === 'minPrice' || name === 'maxPrice' || name === 'min_year' || name === 'max_year') &&
        (value === '' || value === undefined)) {
      setFilters(prevFilters => {
        const newFilters = { ...prevFilters };
        delete newFilters[name];
        return newFilters;
      });
    } else {
      setFilters(prevFilters => ({
        ...prevFilters,
        [name]: value
      }));
    }
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

  // Функция для получения бейджа статуса
  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">В продаже</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400">Неактивен</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Продан</Badge>;
      default:
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">В продаже</Badge>;
    }
  };

  const openCarDetails = async (carId: number) => {
    try {
      setModalLoading(true);
      setIsModalOpen(true);

      // Получаем полную информацию об автомобиле
      const carDetails = await getCarById(carId);
      setSelectedCar(carDetails);
    } catch (error) {
      console.error('Ошибка при загрузке данных автомобиля:', error);
      toast.error("Не удалось загрузить данные автомобиля");
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Нет данных';
    return new Date(dateString).toLocaleDateString('ru-RU');
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
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                    Марка
                  </label>
                  <select
                    id="brand"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={filters.brand || ''}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                  >
                    <option value="">Все марки</option>
                    {makes.map((make, index) => (
                      <option key={make || `empty-${index}`} value={make}>
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
                        value={filters.min_year || ''}
                        onChange={(e) => handleFilterChange('min_year', e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="До"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={filters.max_year || ''}
                        onChange={(e) => handleFilterChange('max_year', e.target.value ? parseInt(e.target.value) : undefined)}
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
                  <div key={car.id || `car-${Math.random()}`} className="bg-white shadow-sm rounded-lg overflow-hidden hover:shadow-md transition">
                    <div className="relative h-48 bg-gray-200">
                      {car.image_url ? (
                        <img
                          src={car.image_url}
                          alt={`${car.brand} ${car.model}`}
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
                      <button
                        onClick={() => openCarDetails(car.id)}
                        className="text-left w-full"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {car.brand} {car.model}
                        </h3>
                      </button>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xl font-bold text-gray-900">
                          {car.price ? car.price.toLocaleString() : 'Цена не указана'} ₽
                        </p>
                        {getStatusBadge(car.status)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <p className="text-sm text-gray-500">Год выпуска</p>
                          <p className="text-sm font-medium">{car.year || 'Не указан'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Пробег</p>
                          <p className="text-sm font-medium">{car.mileage ? car.mileage.toLocaleString() : 'Не указан'} км</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">КПП</p>
                          <p className="text-sm font-medium">
                            {car.transmission === 'automatic' ? 'Автомат' :
                             car.transmission === 'manual' ? 'Механика' :
                             car.transmission === 'robot' ? 'Робот' :
                             car.transmission === 'variator' ? 'Вариатор' : car.transmission || 'Не указана'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Топливо</p>
                          <p className="text-sm font-medium">
                            {car.fuel_type === 'petrol' ? 'Бензин' :
                             car.fuel_type === 'diesel' ? 'Дизель' :
                             car.fuel_type === 'gas' ? 'Газ' :
                             car.fuel_type === 'hybrid' ? 'Гибрид' :
                             car.fuel_type === 'electric' ? 'Электро' : car.fuel_type || 'Не указано'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => openCarDetails(car.id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Подробнее
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Модальное окно с подробностями */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {modalLoading ? (
            <>
              <DialogHeader>
                <DialogTitle>Загрузка</DialogTitle>
              </DialogHeader>
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              </div>
            </>
          ) : selectedCar ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedCar.brand} {selectedCar.model}, {selectedCar.year}</DialogTitle>
                <DialogDescription className="flex items-center gap-3 mt-2">
                  <span className="text-xl font-bold">{selectedCar.price.toLocaleString()} ₽</span>
                  {getStatusBadge(selectedCar.status)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                    {selectedCar.image_url ? (
                      <img
                        src={selectedCar.image_url}
                        alt={`${selectedCar.brand} ${selectedCar.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Фото отсутствует
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-2">Характеристики</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Год выпуска</p>
                      <p className="font-medium">{selectedCar.year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Пробег</p>
                      <p className="font-medium">{selectedCar.mileage.toLocaleString()} км</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">КПП</p>
                      <p className="font-medium">
                        {selectedCar.transmission === 'automatic' ? 'Автомат' :
                         selectedCar.transmission === 'manual' ? 'Механика' :
                         selectedCar.transmission === 'robot' ? 'Робот' :
                         selectedCar.transmission === 'variator' ? 'Вариатор' : selectedCar.transmission}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Топливо</p>
                      <p className="font-medium">
                        {selectedCar.fuel_type === 'petrol' ? 'Бензин' :
                         selectedCar.fuel_type === 'diesel' ? 'Дизель' :
                         selectedCar.fuel_type === 'gas' ? 'Газ' :
                         selectedCar.fuel_type === 'hybrid' ? 'Гибрид' :
                         selectedCar.fuel_type === 'electric' ? 'Электро' : selectedCar.fuel_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Состояние</p>
                      <p className="font-medium">
                        {selectedCar.condition === 'new' ? 'Новый' :
                         selectedCar.condition === 'used' ? 'Б/у' : selectedCar.condition || 'Не указано'}
                      </p>
                    </div>
                    {selectedCar.power && (
                      <div>
                        <p className="text-sm text-gray-500">Мощность</p>
                        <p className="font-medium">{selectedCar.power} л.с.</p>
                      </div>
                    )}
                    {selectedCar.color && (
                      <div>
                        <p className="text-sm text-gray-500">Цвет</p>
                        <p className="font-medium">{selectedCar.color}</p>
                      </div>
                    )}
                  </div>

                  {selectedCar.features && selectedCar.features.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold text-lg mb-2">Особенности</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedCar.features.map((feature, index) => (
                          <li key={index} className="text-sm">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Закрыть
                </Button>
                <Button
                  variant={selectedCar.is_favorite ? "destructive" : "default"}
                  onClick={() => {
                    toggleFavorite(selectedCar.id);
                    // Обновляем и выбранный автомобиль
                    setSelectedCar({
                      ...selectedCar,
                      is_favorite: !selectedCar.is_favorite
                    });
                  }}
                >
                  {selectedCar.is_favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Информация об автомобиле</DialogTitle>
              </DialogHeader>
              <div className="p-4 text-center text-gray-500">
                Не удалось загрузить информацию об автомобиле
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}