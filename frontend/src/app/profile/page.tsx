"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '@/lib/api';

interface Seller {
  id: string;
  email: string;
  full_name: string;
  contact_info: string;
  role: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Seller>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getUserProfile();
        if (profile.role === 'buyer') {
          router.push('/dashboard/buyer/profile');
          return;
        }
        setUser(profile);
        setFormData({ full_name: profile.full_name, contact_info: profile.contact_info });
      } catch (e) {
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/auth/login');
    } else {
      fetchData();
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile(formData);
      setUser({ ...(user as Seller), ...updated });
      setIsEditing(false);
    } catch (error) {
      alert('Не удалось обновить профиль');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить аккаунт?')) return;
    try {
      await deleteUserAccount();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_role');
      router.push('/auth/login');
    } catch (error) {
      alert('Не удалось удалить аккаунт');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Профиль продавца</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/seller" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Вернуться в кабинет
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Личная информация</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </button>
          </div>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="text" id="email" value={user?.email || ''} disabled className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100" />
                </div>
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Полное имя</label>
                  <input type="text" id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" required />
                </div>
                <div>
                  <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">Контактная информация</label>
                  <input type="text" id="contact_info" name="contact_info" value={formData.contact_info || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg">Сохранить</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Полное имя:</strong> {user?.full_name}</p>
              <p><strong>Контактная информация:</strong> {user?.contact_info}</p>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-8">
          <button onClick={handleDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">Удалить аккаунт</button>
        </div>
      </main>
    </div>
  );
}
