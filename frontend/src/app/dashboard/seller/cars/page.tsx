"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, getSellerCars, updateCarStatus, getCarById } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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

export default function SellerCars() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const router = useRouter();

  const fetchCars = async () => {
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

  useEffect(() => {
    // Проверяем токен авторизации
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'seller') {
      router.push('/auth/login');
    } else {
      fetchCars();
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

        <div className="mt-6">
          <Button variant="link" asChild className="px-0">
            <Link href="/dashboard/seller">
              ← Назад в панель управления
            </Link>
          </Button>
        </div>
      </div>

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
                variant="outline"
                asChild
              >
                <Link href={`/cars/${selectedCar?.id}`} target="_blank">
                  Открыть страницу
                </Link>
              </Button>
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