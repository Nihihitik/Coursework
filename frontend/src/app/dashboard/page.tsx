"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Проверяем токен авторизации и роль пользователя
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
      // Если нет токена, перенаправляем на страницу входа
      router.push('/auth/login');
    } else if (role === 'buyer') {
      // Если роль - покупатель, перенаправляем на dashboard покупателя
      router.push('/dashboard/buyer');
    } else if (role === 'seller') {
      // Если роль - продавец, перенаправляем на dashboard продавца
      router.push('/dashboard/seller');
    } else {
      // Если роль не определена или некорректна, перенаправляем на страницу входа
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  );
}