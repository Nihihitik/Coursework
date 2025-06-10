"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, getBuyerOrders } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface Order {
  id: number;
  car_id: number;
  buyer_id: number;
  seller_id: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
  seller_name?: string;
  car?: {
    id: number;
    brand: string;
    model: string;
    year: number;
    price: number;
    image_url?: string;
  };
}

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получаем данные профиля
        const userData = await getUserProfile();
        setUser(userData);

        // Проверяем, что пользователь действительно покупатель
        if (userData.role !== 'buyer') {
          router.push('/auth/login');
          return;
        }

        // Получаем заказы покупателя
        try {
          const ordersData = await getBuyerOrders();
          if (Array.isArray(ordersData)) {
            setOrders(ordersData);
          } else {
            console.error('Данные заказов не являются массивом:', ordersData);
            setOrders([]);
          }
        } catch (ordersError) {
          console.error('Ошибка при загрузке заказов:', ordersError);
          setOrders([]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    // Проверяем токен авторизации
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || role !== 'buyer') {
      router.push('/auth/login');
    } else {
      fetchUserData();
    }
  }, [router]);

  const getOrderStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Ожидает подтверждения</Badge>;
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Подтвержден</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Отклонен</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Завершен</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400">Неизвестно</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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
          <h1 className="text-3xl font-bold text-gray-900">Личный кабинет</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_role');
              router.push('/auth/login');
            }}
          >
            Выйти
          </Button>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Приветствие */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">Добро пожаловать, {user?.name || 'Пользователь'}</CardTitle>
            <CardDescription>
              Выберите нужный раздел, чтобы начать работу с платформой.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Вкладки с обзором и заказами */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-2 w-[400px]">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="orders">Мои заказы</TabsTrigger>
          </TabsList>

          {/* Вкладка с обзором */}
          <TabsContent value="overview">
            {/* Карточки с разделами */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Каталог автомобилей */}
              <Link href="/cars" className="block">
                <Card className="hover:shadow-md transition">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-2">
                    <CardTitle className="text-xl">Каталог автомобилей</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M8 21v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Просмотрите доступные автомобили и выберите подходящий для вас.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Избранное */}
              <Link href="/favorites" className="block">
                <Card className="hover:shadow-md transition">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-2">
                    <CardTitle className="text-xl">Избранное</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Сохраненные вами автомобили для последующего сравнения.
                    </p>
                  </CardContent>
                </Card>
              </Link>

              {/* Профиль */}
              <Link href="/dashboard/buyer/profile" className="block">
                <Card className="hover:shadow-md transition">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 mb-2">
                    <CardTitle className="text-xl">Профиль</CardTitle>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Управляйте вашими личными данными и настройками.
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Раздел подсказок */}
            <Alert className="mt-8">
              <AlertTitle>Полезная информация</AlertTitle>
              <AlertDescription>
                Перейдите в каталог автомобилей, чтобы начать поиск. Наиболее
                понравившиеся автомобили вы можете добавить в избранное.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Вкладка с заказами */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Мои заказы</CardTitle>
                <CardDescription>
                  Информация о ваших заказах на покупку автомобилей
                </CardDescription>
              </CardHeader>

              {orders.length === 0 ? (
                <Alert className="text-center py-8">
                  <AlertTitle className="mb-2">У вас пока нет заказов</AlertTitle>
                  <AlertDescription className="mb-4">
                    Здесь будут отображаться ваши заказы на покупку автомобилей.
                  </AlertDescription>
                  <Button asChild>
                    <Link href="/cars">Перейти в каталог автомобилей</Link>
                  </Button>
                </Alert>
              ) : (
                <CardContent>
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                          <div>
                            <p className="font-medium">Заказ №{order.id}</p>
                            <p className="text-sm text-gray-500">Создан: {formatDate(order.created_at)}</p>
                          </div>
                          {getOrderStatusBadge(order.status)}
                        </div>

                        <div className="p-4">
                          {order.car ? (
                            <div className="flex flex-col md:flex-row gap-4 items-start">
                              <div className="w-full md:w-1/4 aspect-video bg-gray-200 rounded-md overflow-hidden">
                                {order.car.image_url ? (
                                  <img
                                    src={order.car.image_url}
                                    alt={`${order.car.brand} ${order.car.model}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                                    Фото отсутствует
                                  </div>
                                )}
                              </div>

                              <div className="flex-1">
                                <h3 className="text-lg font-medium">
                                  {order.car.brand} {order.car.model}, {order.car.year}
                                </h3>
                                <p className="text-xl font-bold mt-2">
                                  {order.car.price?.toLocaleString()} ₽
                                </p>

                                <div className="mt-4">
                                  {order.status === 'pending' && (
                                    <p className="text-sm text-yellow-600">
                                      Заказ ожидает подтверждения продавцом.
                                    </p>
                                  )}
                                  {order.status === 'approved' && (
                                    <p className="text-sm text-green-600">
                                      Заказ подтвержден продавцом. Ожидайте звонка для уточнения деталей.
                                    </p>
                                  )}
                                  {order.status === 'rejected' && (
                                    <p className="text-sm text-red-600">
                                      Заказ отклонен продавцом.
                                    </p>
                                  )}
                                  {order.status === 'completed' && (
                                    <p className="text-sm text-blue-600">
                                      Заказ успешно завершен.
                                    </p>
                                  )}
                                </div>

                                <div className="mt-4 flex justify-end">
                                  <Button asChild variant="outline" size="sm">
                                    <Link href={`/cars/${order.car_id}`}>
                                      Подробнее об автомобиле
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500">Информация об автомобиле недоступна.</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}