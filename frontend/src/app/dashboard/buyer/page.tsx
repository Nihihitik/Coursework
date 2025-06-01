"use client";

import { useEffect, useState } from 'react';
import { getUserProfile } from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
          <div className="flex gap-4">
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
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-3">Добро пожаловать, {user?.name || 'Пользователь'}</h2>
          <p className="text-gray-600">Выберите нужный раздел, чтобы начать работу с платформой.</p>
        </div>

        {/* Карточки с разделами */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Каталог автомобилей */}
          <Link href="/cars" className="block">
            <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Каталог автомобилей</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M8 21v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
                </svg>
              </div>
              <p className="text-gray-600">Просмотрите доступные автомобили и выберите подходящий для вас.</p>
            </div>
          </Link>

          {/* Избранное */}
          <Link href="/favorites" className="block">
            <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition duration-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Избранное</h3>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
                </svg>
              </div>
              <p className="text-gray-600">Сохраненные вами автомобили для последующего сравнения.</p>
            </div>
          </Link>

          {/* Профиль */}
          <Link href="/dashboard/buyer/profile" className="block">
            <div className="bg-white shadow-sm hover:shadow-md rounded-lg p-6 transition duration-200">
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

        {/* Раздел подсказок */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Полезная информация</h3>
          <p className="text-blue-700">Перейдите в каталог автомобилей, чтобы начать поиск. Наиболее понравившиеся автомобили вы можете добавить в избранное.</p>
        </div>
      </main>
    </div>
  );
}