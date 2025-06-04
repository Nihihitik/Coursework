"use client";

import { useEffect, useState } from 'react';
import { getCarById, addCarToFavorites, removeFromFavorites } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
  description?: string;
  engine_capacity?: number;
  power?: number;
  drive_type?: string;
  body_type?: string;
  vin?: string;
  registration_number?: string;
  image_url: string;
  additional_images?: string[];
  is_favorite?: boolean;
  seller_id: number;
  seller_name?: string;
  seller_phone?: string;
  created_at: string;
  isProcessing?: boolean; // Флаг для отслеживания состояния обработки запроса
  status?: 'active' | 'inactive' | 'sold';
}

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        const carData = await getCarById(parseInt(params.id));
        setCar(carData);
      } catch (error) {
        console.error('Ошибка при загрузке данных автомобиля:', error);
        router.push('/cars');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    setIsLoggedIn(!!token);
    setUserRole(role);

    fetchCar();
  }, [params.id, router]);

  const toggleFavorite = async () => {
    if (!car) return;

    try {
      if (!isLoggedIn) {
        router.push('/auth/login');
        return;
      }

      // Предотвращаем множественные клики добавлением временного состояния
      setCar({
        ...car,
        isProcessing: true // Временный флаг для предотвращения повторного нажатия
      });

      if (car.is_favorite) {
        await removeFromFavorites(car.id);
        toast.success("Удалено из избранного", {
          description: `${car.brand} ${car.model} удален из избранного`,
        });
      } else {
        await addCarToFavorites(car.id);
        toast.success("Добавлено в избранное", {
          description: `${car.brand} ${car.model} добавлен в избранное`,
        });
      }

      setCar({
        ...car,
        is_favorite: !car.is_favorite,
        isProcessing: false
      });
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
      setCar({
        ...car,
        isProcessing: false
      });

      toast.error("Не удалось обновить избранное", {
        description: "Пожалуйста, попробуйте еще раз позднее",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Автомобиль не найден</h1>
        <Link href="/cars" className="text-blue-600 hover:text-blue-800">
          Вернуться к списку автомобилей
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <Link href="/cars" className="text-sm text-gray-600 hover:text-gray-900 transition inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              К списку автомобилей
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">{car.brand} {car.model}</h1>
          </div>
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
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
          {/* Изображение и основная информация */}
          <div className="flex flex-col md:flex-row">
            {/* Изображение */}
            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-200">
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
            </div>

            {/* Основная информация */}
            <div className="w-full md:w-3/5 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{car.brand} {car.model}, {car.year}</h2>
                  <div className="flex items-center gap-3 mt-2 mb-4">
                    <p className="text-3xl font-bold text-gray-900">{car.price.toLocaleString()} ₽</p>
                    {getStatusBadge(car.status)}
                  </div>
                </div>
                <button
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${car.is_favorite ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-500'} hover:bg-opacity-80`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill={car.is_favorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-gray-500">Год выпуска</p>
                  <p className="font-medium">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Пробег</p>
                  <p className="font-medium">{car.mileage.toLocaleString()} км</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">КПП</p>
                  <p className="font-medium">
                    {car.transmission === 'automatic' ? 'Автоматическая' :
                     car.transmission === 'manual' ? 'Механическая' :
                     car.transmission === 'robot' ? 'Роботизированная' :
                     car.transmission === 'variator' ? 'Вариатор' : car.transmission}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Топливо</p>
                  <p className="font-medium">
                    {car.fuel_type === 'petrol' ? 'Бензин' :
                     car.fuel_type === 'diesel' ? 'Дизель' :
                     car.fuel_type === 'gas' ? 'Газ' :
                     car.fuel_type === 'hybrid' ? 'Гибрид' :
                     car.fuel_type === 'electric' ? 'Электро' : car.fuel_type}
                  </p>
                </div>
                {car.drive_type && (
                  <div>
                    <p className="text-sm text-gray-500">Привод</p>
                    <p className="font-medium">
                      {car.drive_type === 'front' ? 'Передний' :
                       car.drive_type === 'rear' ? 'Задний' :
                       car.drive_type === 'all' ? 'Полный' : car.drive_type}
                    </p>
                  </div>
                )}
                {car.body_type && (
                  <div>
                    <p className="text-sm text-gray-500">Тип кузова</p>
                    <p className="font-medium">{car.body_type}</p>
                  </div>
                )}
                {car.color && (
                  <div>
                    <p className="text-sm text-gray-500">Цвет</p>
                    <p className="font-medium">{car.color}</p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Контактная информация</h3>
                <p className="font-medium">{car.seller_name || 'Автосалон'}</p>
                {car.seller_phone && (
                  <a href={`tel:${car.seller_phone}`} className="text-blue-600 hover:text-blue-800 text-lg font-bold block mt-1">
                    {car.seller_phone}
                  </a>
                )}
                <p className="text-sm text-gray-500 mt-2">Автомобиль размещен: {new Date(car.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Дополнительные изображения */}
        {car.additional_images && car.additional_images.length > 0 && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Фотографии ({car.additional_images.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {car.additional_images.map((image, index) => (
                <div key={index} className="h-32 bg-gray-200">
                  <img
                    src={image}
                    alt={`${car.brand} ${car.model} - фото ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Описание */}
        {car.description && (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Описание</h3>
            <p className="whitespace-pre-line">{car.description}</p>
          </div>
        )}

        {/* Технические характеристики */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Технические характеристики</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">Марка</p>
              <p className="font-medium">{car.brand}</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">Модель</p>
              <p className="font-medium">{car.model}</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">Год выпуска</p>
              <p className="font-medium">{car.year}</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">Пробег</p>
              <p className="font-medium">{car.mileage.toLocaleString()} км</p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">КПП</p>
              <p className="font-medium">
                {car.transmission === 'automatic' ? 'Автоматическая' :
                 car.transmission === 'manual' ? 'Механическая' :
                 car.transmission === 'robot' ? 'Роботизированная' :
                 car.transmission === 'variator' ? 'Вариатор' : car.transmission}
              </p>
            </div>
            <div className="border-b pb-2">
              <p className="text-sm text-gray-500">Топливо</p>
              <p className="font-medium">
                {car.fuel_type === 'petrol' ? 'Бензин' :
                 car.fuel_type === 'diesel' ? 'Дизель' :
                 car.fuel_type === 'gas' ? 'Газ' :
                 car.fuel_type === 'hybrid' ? 'Гибрид' :
                 car.fuel_type === 'electric' ? 'Электро' : car.fuel_type}
              </p>
            </div>
            {car.engine_capacity && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Объем двигателя</p>
                <p className="font-medium">{car.engine_capacity} л</p>
              </div>
            )}
            {car.power && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Мощность</p>
                <p className="font-medium">{car.power} л.с.</p>
              </div>
            )}
            {car.drive_type && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Привод</p>
                <p className="font-medium">
                  {car.drive_type === 'front' ? 'Передний' :
                   car.drive_type === 'rear' ? 'Задний' :
                   car.drive_type === 'all' ? 'Полный' : car.drive_type}
                </p>
              </div>
            )}
            {car.body_type && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Тип кузова</p>
                <p className="font-medium">{car.body_type}</p>
              </div>
            )}
            {car.color && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Цвет</p>
                <p className="font-medium">{car.color}</p>
              </div>
            )}
            {car.vin && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">VIN</p>
                <p className="font-medium">{car.vin}</p>
              </div>
            )}
            {car.registration_number && (
              <div className="border-b pb-2">
                <p className="text-sm text-gray-500">Регистрационный номер</p>
                <p className="font-medium">{car.registration_number}</p>
              </div>
            )}
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <button
            onClick={toggleFavorite}
            className={`flex items-center justify-center py-3 px-4 rounded-md transition ${
              car.is_favorite
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
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
              className="mr-2"
            >
              <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
            </svg>
            {car.is_favorite ? 'Удалить из избранного' : 'Добавить в избранное'}
          </button>

          {car.seller_phone && (
            <a
              href={`tel:${car.seller_phone}`}
              className="flex items-center justify-center py-3 px-4 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Позвонить продавцу
            </a>
          )}

          <Link
            href="/cars"
            className="flex items-center justify-center py-3 px-4 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            К списку автомобилей
          </Link>
        </div>
      </main>
    </div>
  );
}