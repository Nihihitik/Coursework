"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, getSellerCars, updateCarStatus, getCarById } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Eye, PenBox } from "lucide-react";
import { toast } from "sonner";

// Определяем типы данных
interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  transmission: string;
  mileage: number;
  features?: any[];
  store_name?: string;
  status?: 'active' | 'inactive' | 'sold';
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function SellerDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);

        // Проверяем, что пользователь действительно продавец
        if (userData.role !== 'seller') {
          router.push('/auth/login');
          return;
        }

        // Загружаем автомобили продавца
        try {
          const carsData = await getSellerCars();
          // Проверяем, что carsData - это массив
          if (Array.isArray(carsData)) {
            setCars(carsData);
          } else {
            // Если это не массив, преобразуем в пустой массив
            console.error('Данные автомобилей не являются массивом:', carsData);
            setCars([]);
          }
        } catch (carsError) {
          console.error('Ошибка при загрузке автомобилей:', carsError);
          setCars([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    // Проверяем токен авторизации
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'seller') {
      router.push('/auth/login');
    } else {
      fetchUserData();
    }
  }, [router]);

  const handlePreview = async (id: number) => {
    try {
      const car = await getCarById(id);
      setSelectedCar(car);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Ошибка при загрузке данных автомобиля:', error);
    }
  };

  const handleStatusChange = async (id: number, newStatus: 'active' | 'inactive' | 'sold') => {
    try {
      await updateCarStatus(id, newStatus);
      toast.success("Статус обновлен", {
        description: `Статус автомобиля изменен на ${newStatus === 'active' ? 'активен' : newStatus === 'inactive' ? 'неактивен' : 'продан'}`,
      });

      // Обновляем список автомобилей
      setCars(cars.map(car =>
        car.id === id ? { ...car, status: newStatus } : car
      ));
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      toast.error("Ошибка", {
        description: "Не удалось обновить статус автомобиля",
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Активен</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400">Неактивен</Badge>;
      case 'sold':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Продан</Badge>;
      default:
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Активен</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Шапка */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Панель продавца</h1>
          <div className="flex gap-4">
            <Link href="/profile" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Профиль
            </Link>
            <button
              onClick={() => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_role');
                router.push('/auth/login');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Приветствие */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200">
          <h2 className="text-2xl font-semibold mb-3">Добрый день, {user?.name || 'Продавец'}</h2>
          <p className="text-gray-600">Управляйте вашими автомобилями и следите за статистикой продаж.</p>
        </div>

        {/* Карточки с разделами */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Мои автомобили */}
          <Link href="/dashboard/seller/cars" className="block">
            <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition duration-200 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Мои автомобили</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                </svg>
              </div>
              <p className="text-gray-600">Управляйте существующими объявлениями о продаже автомобилей.</p>
            </div>
          </Link>

          {/* Добавить автомобиль */}
          <Link href="/dashboard/seller/cars/add" className="block">
            <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition duration-200 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Добавить автомобиль</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <p className="text-gray-600">Создайте новое объявление о продаже автомобиля.</p>
            </div>
          </Link>

          {/* Профиль */}
          <Link href="/profile" className="block">
            <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition duration-200 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Профиль</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <p className="text-gray-600">Управляйте вашими личными данными и настройками.</p>
            </div>
          </Link>
        </div>

        {/* Последние добавленные автомобили */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Ваши автомобили</h3>
            <Link href="/dashboard/seller/cars" className="text-gray-600 hover:text-gray-900 text-sm">
              Показать все
            </Link>
          </div>

          {cars.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">У вас пока нет добавленных автомобилей</p>
              <Link href="/dashboard/seller/cars/add" className="inline-block bg-gray-800 hover:bg-black text-white font-medium py-2 px-4 rounded-md transition">
                Добавить первый автомобиль
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Модель
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Год
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Цена
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Статус
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cars.slice(0, 5).map((car) => (
                    <tr key={car.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{car.brand} {car.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{car.year}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{car.price?.toLocaleString()} ₽</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(car.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                Статус <ChevronDown className="ml-1 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(car.id, 'active')}>
                                Активен
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(car.id, 'inactive')}>
                                Неактивен
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(car.id, 'sold')}>
                                Продан
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handlePreview(car.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            asChild
                          >
                            <Link href={`/dashboard/seller/cars/${car.id}/edit`}>
                              <PenBox className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Модальное окно предпросмотра */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Предпросмотр автомобиля</DialogTitle>
            <DialogDescription>
              {selectedCar?.brand} {selectedCar?.model}, {selectedCar?.year} г.
            </DialogDescription>
          </DialogHeader>

          {selectedCar && (
            <div className="space-y-4 py-4">
              <div className="grid gap-2">
                <h4 className="font-medium">Основная информация</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Марка и модель</p>
                    <p>{selectedCar.brand} {selectedCar.model}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Год выпуска</p>
                    <p>{selectedCar.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Цена</p>
                    <p className="font-medium">{selectedCar.price?.toLocaleString()} ₽</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Состояние</p>
                    <p>{selectedCar.condition}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <h4 className="font-medium">Технические характеристики</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Трансмиссия</p>
                    <p>{selectedCar.transmission}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Пробег</p>
                    <p>{selectedCar.mileage?.toLocaleString()} км</p>
                  </div>
                </div>
              </div>

              {selectedCar.features && selectedCar.features.length > 0 && (
                <div className="grid gap-2">
                  <h4 className="font-medium">Особенности</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCar.features.map((feature, index) => (
                      <Badge variant="outline" key={index}>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <h4 className="font-medium">Статус</h4>
                <div>{getStatusBadge(selectedCar.status)}</div>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Закрыть
            </Button>
            <div className="flex space-x-2">
              <Button
                asChild
              >
                <Link href={`/dashboard/seller/cars/${selectedCar?.id}/edit`}>
                  Редактировать
                </Link>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}