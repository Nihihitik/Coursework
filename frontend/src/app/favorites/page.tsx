"use client";

import { useEffect, useState } from 'react';
import { getUserFavorites, removeFromFavorites } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Интерфейс для автомобиля
interface Car {
  id: number;
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  image_url?: string;
  is_favorite?: boolean;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        // Проверяем токен авторизации
        const token = localStorage.getItem('auth_token');

        if (!token) {
          router.push('/auth/login');
          return;
        }

        setLoading(true);
        const favoritesData = await getUserFavorites();
        setFavorites(favoritesData);
      } catch (error) {
        console.error('Ошибка при загрузке избранного:', error);
        if ((error as any)?.response?.status === 401) {
          router.push('/auth/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  const handleRemoveFromFavorites = async (carId: number) => {
    try {
      await removeFromFavorites(carId);

      // Обновляем состояние списка избранного
      setFavorites(prevFavorites =>
        prevFavorites.filter(car => car.id !== carId)
      );
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
    }
  };

  const userRole = typeof localStorage !== 'undefined' ? localStorage.getItem('user_role') : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Избранное</h1>
          <div className="flex gap-4">
            <Link href={`/dashboard/${userRole}`} className="text-sm text-gray-600 hover:text-gray-900 transition">
              Личный кабинет
            </Link>
            <Link href="/cars" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Все автомобили
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">У вас пока нет избранных автомобилей</h2>
            <p className="text-gray-500 mb-6">Отмечайте понравившиеся автомобили, чтобы они появились здесь</p>
            <Link href="/cars" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
              Перейти к каталогу
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold">Избранные автомобили ({favorites.length})</h2>
            </div>

            <div className="divide-y divide-gray-200">
              {favorites.map((car) => (
                <div key={car.id} className="flex flex-col md:flex-row p-6 hover:bg-gray-50">
                  {/* Изображение */}
                  <div className="w-full md:w-1/4 h-48 md:h-32 bg-gray-200 flex-shrink-0 mb-4 md:mb-0 md:mr-6">
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
                  </div>

                  {/* Информация */}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <Link href={`/cars/${car.id}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                          {car.make} {car.model}, {car.year}
                        </h3>
                      </Link>
                      <button
                        onClick={() => handleRemoveFromFavorites(car.id)}
                        className="text-gray-400 hover:text-red-500 transition"
                        title="Удалить из избранного"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                        </svg>
                      </button>
                    </div>

                    <p className="text-xl font-bold text-gray-900 mt-2">
                      {car.price ? car.price.toLocaleString() : 'Цена не указана'} ₽
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
                      <div>
                        <p className="text-sm text-gray-500">Год выпуска</p>
                        <p className="text-sm font-medium">{car.year}</p>
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
          </div>
        )}
      </main>
    </div>
  );
}