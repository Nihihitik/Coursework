"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, getSellerCars } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Мои автомобили</h1>
          <Button asChild>
            <Link href="/dashboard/seller/cars/add">
              Добавить автомобиль
            </Link>
          </Button>
        </div>

        {cars.length === 0 ? (
          <Card className="text-center p-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">У вас пока нет добавленных автомобилей</h2>
              <p className="text-muted-foreground mb-6">Добавьте свой первый автомобиль для продажи.</p>
              <Button asChild>
                <Link href="/dashboard/seller/cars/add">
                  Добавить первый автомобиль
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Автомобиль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Характеристики
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cars.map((car) => (
                  <tr key={car.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{car.brand} {car.model}</div>
                      <div className="text-sm text-muted-foreground">{car.year} г.</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">{car.transmission}, {car.condition}</div>
                      <div className="text-sm text-muted-foreground">Пробег: {car.mileage} км</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{car.price?.toLocaleString()} ₽</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Активно
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" className="mr-2" asChild>
                        <Link href={`/dashboard/seller/cars/${car.id}/edit`}>
                          Редактировать
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href={`/cars/${car.id}`}>
                          Просмотр
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Button variant="link" asChild className="px-0">
            <Link href="/dashboard/seller">
              ← Назад в панель управления
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}