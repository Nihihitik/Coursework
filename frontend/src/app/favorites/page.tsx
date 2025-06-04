"use client";

import { useEffect, useState } from 'react';
import { getUserFavorites, removeFromFavorites, getCarById } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
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

// Определение типа автомобиля, соответствующее структуре бэкенда
interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type?: string;
  transmission: string;
  condition?: string;
  power?: number;
  features?: string[];
  color?: string;
  image_url?: string;
  is_favorite?: boolean;
  status?: 'active' | 'inactive' | 'sold';
  added_at?: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
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
        console.log("Избранные автомобили:", favoritesData);
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
      toast.success("Удалено из избранного");

      // Обновляем состояние списка избранного
      setFavorites(prevFavorites =>
        prevFavorites.filter(car => car.id !== carId)
      );
    } catch (error) {
      console.error('Ошибка при удалении из избранного:', error);
      toast.error("Не удалось удалить из избранного");
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

  const userRole = typeof localStorage !== 'undefined' ? localStorage.getItem('user_role') : null;

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Нет данных';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

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
                        alt={`${car.brand} ${car.model}`}
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
                      <button
                        onClick={() => openCarDetails(car.id)}
                        className="text-left text-lg font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {car.brand} {car.model}, {car.year}
                      </button>
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

                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xl font-bold text-gray-900">
                        {car.price ? car.price.toLocaleString() : 'Цена не указана'} ₽
                      </p>
                      {getStatusBadge(car.status)}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
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
                        <p className="text-sm text-gray-500">Состояние</p>
                        <p className="text-sm font-medium">
                          {car.condition === 'new' ? 'Новый' :
                           car.condition === 'used' ? 'Б/у' : car.condition || 'Не указано'}
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
          </div>
        )}
      </main>

      {/* Модальное окно с подробностями */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {modalLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            </div>
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
                    <div>
                      <p className="text-sm text-gray-500">Добавлен в избранное</p>
                      <p className="font-medium">{formatDate(selectedCar.added_at)}</p>
                    </div>
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
                  variant="destructive"
                  onClick={() => {
                    handleRemoveFromFavorites(selectedCar.id);
                    setIsModalOpen(false);
                  }}
                >
                  Удалить из избранного
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Не удалось загрузить информацию об автомобиле
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}