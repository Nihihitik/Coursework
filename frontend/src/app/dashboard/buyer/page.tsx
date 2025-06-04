"use client";

import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/api';
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

export default function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);

        // Проверяем, что пользователь действительно покупатель
        if (userData.role !== 'buyer') {
          router.push('/auth/login');
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
      fetchUserProfile();
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
      </main>
    </div>
  );
}