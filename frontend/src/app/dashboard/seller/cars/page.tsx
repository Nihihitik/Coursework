"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, getSellerCars } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
}

export default function SellerCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCarsData = async () => {
      try {
        // Загружаем автомобили продавца
        const carsData = await getSellerCars();
        if (Array.isArray(carsData)) {
          setCars(carsData);
        } else {
          console.error('Данные автомобилей не являются массивом:', carsData);
          setCars([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке автомобилей:', error);
        setCars([]);
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
      fetchCarsData();
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Мои автомобили</h1>
          <Link href="/dashboard/seller/cars/add" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
            Добавить автомобиль
          </Link>
        </div>

        {cars.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">У вас пока нет добавленных автомобилей</h2>
            <p className="text-gray-500 mb-6">Добавьте свой первый автомобиль для продажи.</p>
            <Link href="/dashboard/seller/cars/add" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition">
              Добавить первый автомобиль
            </Link>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Автомобиль
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Характеристики
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
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{car.brand} {car.model}</div>
                      <div className="text-sm text-gray-500">{car.year} г.</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{car.transmission}, {car.condition}</div>
                      <div className="text-sm text-gray-500">Пробег: {car.mileage} км</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{car.price?.toLocaleString()} ₽</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Активно
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/dashboard/seller/cars/${car.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Редактировать
                      </Link>
                      <Link href={`/cars/${car.id}`} className="text-blue-600 hover:text-blue-900">
                        Просмотр
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Link href="/dashboard/seller" className="text-blue-600 hover:text-blue-800">
            ← Назад в панель управления
          </Link>
        </div>
      </div>
    </div>
  );
}