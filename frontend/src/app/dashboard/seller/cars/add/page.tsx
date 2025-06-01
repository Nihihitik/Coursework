"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { addCar, getAllStores, createStore } from '@/lib/api';

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// Схема для создания магазина
const storeFormSchema = z.object({
  name: z.string().min(1, { message: "Введите название магазина" }),
  address: z.string().min(1, { message: "Введите адрес магазина" }),
});

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

export default function AddCarPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [storeError, setStoreError] = useState('');
  const [createStoreLoading, setCreateStoreLoading] = useState(false);

  // Инициализация формы с использованием react-hook-form и zod
  const form = useForm<z.infer<typeof formSchema>>({
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
      store_id: undefined
    },
  });

  // Инициализация формы для создания магазина
  const storeForm = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      name: '',
      address: ''
    }
  });

  // Загрузка магазинов при монтировании компонента
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

        // Если есть магазины, устанавливаем первый по умолчанию
        if (storesData && storesData.length > 0) {
          form.setValue('store_id', storesData[0].id);
        }
      } catch (error) {
        console.error('Ошибка при загрузке магазинов:', error);
      } finally {
        setStoresLoading(false);
      }
    };

    fetchStores();
  }, [router, form]);

  // Функция для создания нового магазина
  async function handleCreateStore(values: z.infer<typeof storeFormSchema>) {
    setCreateStoreLoading(true);
    setStoreError('');

    try {
      console.log('Отправляемые данные для создания магазина:', values);
      const response = await createStore(values);

      // Добавляем новый магазин в список и выбираем его
      const newStore = { id: response.id, name: values.name, address: values.address };
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setError('');

    // Логируем отправляемые данные для отладки
    console.log('Отправляемые данные:', values);

    try {
      await addCar(values);
      router.push('/dashboard/seller/cars');
    } catch (error: any) {
      console.error('Ошибка при добавлении автомобиля:', error);

      // Вывод подробных данных об ошибке для отладки
      console.log('Детали ответа:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data
      });

      // Правильная обработка ошибки валидации
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail.map((err: any) => err.msg || JSON.stringify(err)).join('. '));
        } else if (typeof detail === 'string') {
          setError(detail);
        } else {
          setError(JSON.stringify(detail));
        }
      } else {
        setError('Произошла ошибка при добавлении автомобиля. Пожалуйста, проверьте данные и попробуйте снова.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Добавление автомобиля</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Информация об автомобиле</CardTitle>
            <CardDescription>
              Заполните все необходимые поля для добавления нового автомобиля
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Марка */}
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Марка *</FormLabel>
                        <FormControl>
                          <Input placeholder="Введите марку" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Модель */}
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Модель *</FormLabel>
                        <FormControl>
                          <Input placeholder="Введите модель" {...field} />
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
                        <FormLabel>Год выпуска *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Год выпуска"
                            min="1900"
                            max={new Date().getFullYear()}
                            {...field}
                          />
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
                        <FormLabel>Цена (₽) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Введите цену"
                            min="0"
                            {...field}
                          />
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
                        <FormLabel>Мощность (л.с.) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Введите мощность"
                            min="0"
                            {...field}
                          />
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
                        <FormLabel>Пробег (км) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Введите пробег"
                            min="0"
                            {...field}
                          />
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
                        <FormLabel>Трансмиссия *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
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
                        <FormLabel>Состояние *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите состояние" />
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

                  {/* Магазин */}
                  <FormField
                    control={form.control}
                    name="store_id"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Магазин *</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value?.toString()}
                            disabled={storesLoading || stores.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                {storesLoading ? (
                                  <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>Загрузка...</span>
                                  </div>
                                ) : (
                                  <SelectValue placeholder="Выберите магазин" />
                                )}
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stores.map((store) => (
                                <SelectItem key={store.id} value={store.id.toString()}>
                                  {store.name} - {store.address}
                                </SelectItem>
                              ))}
                              {stores.length === 0 && (
                                <div className="relative flex w-full select-none items-center py-1.5 px-2 text-sm outline-none text-muted-foreground">
                                  Нет доступных магазинов
                                </div>
                              )}
                            </SelectContent>
                          </Select>

                          <Dialog open={storeDialogOpen} onOpenChange={setStoreDialogOpen}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">
                                + Новый магазин
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Создание нового магазина</DialogTitle>
                                <DialogDescription>
                                  Введите информацию о новом магазине
                                </DialogDescription>
                              </DialogHeader>

                              {storeError && (
                                <Alert variant="destructive">
                                  <AlertDescription>{typeof storeError === 'string' ? storeError : JSON.stringify(storeError)}</AlertDescription>
                                </Alert>
                              )}

                              <Form {...storeForm}>
                                <form onSubmit={storeForm.handleSubmit(handleCreateStore)} className="space-y-4">
                                  <FormField
                                    control={storeForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Название магазина *</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Введите название" {...field} />
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
                                        <FormLabel>Адрес магазина *</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Введите адрес" {...field} />
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
                                      disabled={createStoreLoading}
                                    >
                                      Отмена
                                    </Button>
                                    <Button type="submit" disabled={createStoreLoading}>
                                      {createStoreLoading ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Создание...
                                        </>
                                      ) : (
                                        'Создать магазин'
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <FormMessage />
                        {stores.length === 0 && !storesLoading && (
                          <FormDescription className="text-destructive">
                            Создайте хотя бы один магазин перед добавлением автомобиля
                          </FormDescription>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/dashboard/seller/cars">Отмена</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || storesLoading || stores.length === 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Сохранение...
                      </>
                    ) : (
                      'Сохранить автомобиль'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button variant="link" asChild>
            <Link href="/dashboard/seller/cars">
              ← Назад к списку автомобилей
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}