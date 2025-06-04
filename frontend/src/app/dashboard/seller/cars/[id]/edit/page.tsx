"use client";

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { getCarById, updateCar, getAllStores, createStore } from '@/lib/api';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Определяем интерфейс для магазина
interface Store {
  id: number;
  name: string;
  address: string;
}

// Схема для создания магазина
const storeFormSchema = z.object({
  name: z.string().min(1, { message: "Введите название магазина" }),
  address: z.string().min(1, { message: "Введите адрес магазина" }),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

// Определяем схему валидации для автомобиля
const formSchema = z.object({
  brand: z.string().min(1, { message: "Введите марку автомобиля" }),
  model: z.string().min(1, { message: "Введите модель автомобиля" }),
  year: z.coerce.number()
    .int()
    .min(1900, { message: "Год должен быть не ранее 1900" })
    .max(new Date().getFullYear(), { message: "Год не может быть в будущем" }),
  price: z.coerce.number().min(1, { message: "Введите цену автомобиля" }),
  power: z.coerce.number().min(1, { message: "Введите мощность автомобиля" }),
  transmission: z.enum(["АКП", "МКП"]),
  condition: z.enum(["new", "used"]),
  mileage: z.coerce.number().min(0, { message: "Пробег не может быть отрицательным" }),
  features: z.array(z.string()).default([]),
  store_id: z.number()
});

type FormValues = z.infer<typeof formSchema>;

interface EditCarPageProps {
  params: Promise<{ id: string }> | { id: string }
}

export default function EditCarPage({ params }: EditCarPageProps) {
  const carId = parseInt(use(params).id);

  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [storeError, setStoreError] = useState('');
  const [createStoreLoading, setCreateStoreLoading] = useState(false);

  // Инициализация формы с использованием react-hook-form и zod
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      price: 0,
      power: 0,
      transmission: 'АКП',
      condition: 'new',
      mileage: 0,
      features: [],
      store_id: undefined as any
    },
  });

  // Инициализация формы для создания магазина
  const storeForm = useForm<StoreFormValues>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: '',
      address: ''
    }
  });

  // Загрузка данных об автомобиле и магазинах при монтировании компонента
  useEffect(() => {
    // Проверка авторизации
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'seller') {
      router.push('/auth/login');
      return;
    }

    // Загрузка списка магазинов
    const fetchStores = async () => {
      try {
        const storesData = await getAllStores();
        setStores(storesData);
        setStoresLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке магазинов:', error);
        setStoresLoading(false);
      }
    };

    // Загрузка данных автомобиля
    const fetchCarData = async () => {
      try {
        const carData = await getCarById(carId);

        // Заполняем форму данными автомобиля
        form.reset({
          brand: carData.brand,
          model: carData.model,
          year: carData.year,
          price: carData.price,
          power: carData.power,
          transmission: carData.transmission,
          condition: carData.condition,
          mileage: carData.mileage,
          features: carData.features || [],
          store_id: carData.store_id
        });

        setDataLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке данных автомобиля:', error);
        setError('Не удалось загрузить данные автомобиля');
        setDataLoading(false);
      }
    };

    fetchStores();
    fetchCarData();
  }, [carId, router, form]);

  // Функция для создания нового магазина
  async function handleCreateStore(values: StoreFormValues) {
    setCreateStoreLoading(true);
    setStoreError('');

    try {
      const response = await createStore(values);

      // Добавляем новый магазин в список и выбираем его
      const newStore: Store = {
        id: response.id,
        name: values.name,
        address: values.address
      };

      setStores([...stores, newStore]);
      form.setValue('store_id', response.id);

      // Закрываем диалог
      setStoreDialogOpen(false);
      storeForm.reset();
    } catch (error: any) {
      console.error('Ошибка при создании магазина:', error);

      // Улучшенная обработка ошибок
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          setStoreError(detail.map((err: any) => err.msg || String(err)).join('. '));
        } else if (typeof detail === 'object' && detail !== null) {
          setStoreError(JSON.stringify(detail));
        } else {
          setStoreError(String(detail));
        }
      } else {
        setStoreError('Произошла ошибка при создании магазина');
      }
    } finally {
      setCreateStoreLoading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError('');

    try {
      await updateCar(carId, values);
      router.push('/dashboard/seller/cars');
    } catch (error: any) {
      console.error('Ошибка при обновлении автомобиля:', error);

      // Обработка ошибки
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((err: any) => err.msg || String(err)).join('. '));
        } else if (typeof detail === 'object' && detail !== null) {
          setError(JSON.stringify(detail));
        } else {
          setError(String(detail));
        }
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Произошла ошибка при обновлении автомобиля');
      }
    } finally {
      setLoading(false);
    }
  }

  if (dataLoading || storesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Редактирование автомобиля</h1>
        <p className="text-muted-foreground mt-2">Внесите изменения в информацию об автомобиле</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Данные автомобиля</CardTitle>
          <CardDescription>
            Заполните все поля для обновления информации об автомобиле
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 bg-destructive/15 text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Марка автомобиля */}
                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Марка</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Модель автомобиля */}
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Модель</FormLabel>
                      <FormControl>
                        <Input placeholder="Camry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Год выпуска */}
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Год выпуска</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Цена */}
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Цена (₽)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Мощность */}
                <FormField
                  control={form.control}
                  name="power"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Мощность (л.с.)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Пробег */}
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Пробег (км)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Трансмиссия */}
                <FormField
                  control={form.control}
                  name="transmission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Трансмиссия</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите тип трансмиссии" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="АКП">Автоматическая</SelectItem>
                          <SelectItem value="МКП">Механическая</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Состояние */}
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Состояние</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите состояние автомобиля" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">Новый</SelectItem>
                          <SelectItem value="used">С пробегом</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Выбор магазина */}
                <FormField
                  control={form.control}
                  name="store_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Магазин</FormLabel>
                      <div className="flex space-x-2">
                        <Select
                          defaultValue={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Выберите магазин" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store.id} value={store.id.toString()}>
                                {store.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setStoreDialogOpen(true)}
                        >
                          +
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/seller/cars')}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Сохранить изменения
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Диалог создания нового магазина */}
      <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новый магазин</DialogTitle>
            <DialogDescription>
              Заполните информацию о новом магазине
            </DialogDescription>
          </DialogHeader>

          {storeError && (
            <Alert className="bg-destructive/15 text-destructive">
              <AlertDescription>{storeError}</AlertDescription>
            </Alert>
          )}

          <Form {...storeForm}>
            <form onSubmit={storeForm.handleSubmit(handleCreateStore)} className="space-y-4">
              <FormField
                control={storeForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Название магазина</FormLabel>
                    <FormControl>
                      <Input placeholder="Мой автосалон" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={storeForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Адрес</FormLabel>
                    <FormControl>
                      <Input placeholder="ул. Примерная, 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStoreDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button type="submit" disabled={createStoreLoading}>
                  {createStoreLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Создать
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}