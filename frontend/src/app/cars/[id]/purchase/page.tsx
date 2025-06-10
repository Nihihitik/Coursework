"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getCarById, createOrder } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { toast } from "sonner";

interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  price: number;
  condition: string;
  transmission: string;
  mileage: number;
  color: string;
  fuel_type: string;
  image_url: string;
  status?: 'active' | 'inactive' | 'sold';
}

export default function PurchasePage() {
  const router = useRouter();
  const params = useParams();
  const carId = Number(params.id);

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'buyer') {
      router.push('/auth/login');
      return;
    }

    const fetchCarData = async () => {
      try {
        setLoading(true);
        const carData = await getCarById(carId);

        // Проверяем, что автомобиль в продаже
        if (carData.status !== 'active') {
          toast.error("Автомобиль недоступен для покупки", {
            description: "Данный автомобиль уже продан или снят с продажи",
          });
          router.push('/cars');
          return;
        }

        setCar(carData);
      } catch (error) {
        console.error('Ошибка при загрузке данных автомобиля:', error);
        toast.error("Не удалось загрузить данные автомобиля");
        router.push('/cars');
      } finally {
        setLoading(false);
      }
    };

    fetchCarData();
  }, [carId, router]);

  const handleOrderConfirm = async () => {
    if (!car) return;

    try {
      setOrderLoading(true);
      // Создаем заказ через API
      await createOrder(car.id);

      toast.success("Заказ оформлен успешно", {
        description: "Продавец получил ваш заказ и свяжется с вами",
      });

      setConfirmDialogOpen(false);
      router.push('/dashboard/buyer');
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      toast.error("Не удалось оформить заказ", {
        description: "Пожалуйста, попробуйте еще раз позже",
      });
    } finally {
      setOrderLoading(false);
    }
  };

  // Вспомогательные функции для отображения данных
  const getTransmissionName = (transmission?: string) => {
    switch (transmission) {
      case 'automatic': return 'Автоматическая';
      case 'manual': return 'Механическая';
      case 'robot': return 'Роботизированная';
      case 'variator': return 'Вариатор';
      default: return transmission || 'Не указана';
    }
  };

  const getFuelTypeName = (fuelType?: string) => {
    switch (fuelType) {
      case 'petrol': return 'Бензин';
      case 'diesel': return 'Дизель';
      case 'gas': return 'Газ';
      case 'hybrid': return 'Гибрид';
      case 'electric': return 'Электро';
      default: return fuelType || 'Не указан';
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Ошибка загрузки</CardTitle>
            <CardDescription>
              Не удалось загрузить информацию об автомобиле
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/cars">Вернуться в каталог</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Оформление покупки</CardTitle>
                <CardDescription>
                  Проверьте данные и подтвердите заказ
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base">
                {car.price.toLocaleString()} ₽
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
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
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">
                  {car.brand} {car.model}, {car.year}
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm text-gray-500">Год выпуска</p>
                    <p className="font-medium">{car.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Пробег</p>
                    <p className="font-medium">{car.mileage?.toLocaleString() || 'Не указан'} км</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">КПП</p>
                    <p className="font-medium">{getTransmissionName(car.transmission)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Топливо</p>
                    <p className="font-medium">{getFuelTypeName(car.fuel_type)}</p>
                  </div>
                  {car.color && (
                    <div>
                      <p className="text-sm text-gray-500">Цвет</p>
                      <p className="font-medium">{car.color}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Условия покупки</h3>
              <ul className="space-y-2 text-sm">
                <li>• После подтверждения заказа, продавец свяжется с вами для уточнения деталей</li>
                <li>• Окончательные условия покупки согласовываются с продавцом</li>
                <li>• Перед покупкой рекомендуем проверить автомобиль и документы</li>
                <li>• Оплата производится непосредственно продавцу после осмотра автомобиля</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Button variant="outline" asChild>
                <Link href="/cars">Отмена</Link>
              </Button>
              <Button
                onClick={() => setConfirmDialogOpen(true)}
              >
                Оформить заказ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Диалог подтверждения заказа */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение заказа</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите оформить заказ на покупку автомобиля {car.brand} {car.model}?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-500">
              После подтверждения заказа, продавец получит уведомление и свяжется с вами для уточнения деталей.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)} disabled={orderLoading}>
              Отмена
            </Button>
            <Button onClick={handleOrderConfirm} disabled={orderLoading}>
              {orderLoading ? 'Оформление...' : 'Подтвердить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}