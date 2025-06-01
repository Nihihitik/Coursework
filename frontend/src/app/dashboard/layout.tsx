"use client";

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    const role = localStorage.getItem('user_role');
    const token = localStorage.getItem('auth_token');

    setUserRole(role);

    // Если нет токена, перенаправляем на страницу входа
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Проверка правильности роли для текущего пути
    if (role && pathname) {
      // Если пользователь находится в неправильном разделе дашборда для своей роли
      if ((role === 'buyer' && !pathname.includes('/dashboard/buyer')) ||
          (role === 'seller' && !pathname.includes('/dashboard/seller'))) {
        router.push(`/dashboard/${role}`);
      }
    }
  }, [pathname, router]);

  // Отображаем контент только после проверки на клиентской стороне
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Основной контент */}
      <div className="flex-grow">
        {children}
      </div>
    </div>
  );
}