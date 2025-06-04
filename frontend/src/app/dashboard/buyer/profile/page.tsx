"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Типы для предпочтений и пользователя
interface UserPreferences {
  preferred_brand: string | null;
  preferred_model: string | null;
  min_year: number | null;
  max_year: number | null;
  min_power: number | null;
  max_power: number | null;
  preferred_transmission: string | null;
  preferred_condition: string | null;
  max_price: number | null;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  contact_info: string;
  role: string;
  preferences: UserPreferences;
}

export default function BuyerProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User & { preferences: UserPreferences }>>({
    full_name: '',
    contact_info: '',
    preferences: {
      preferred_brand: '',
      preferred_model: '',
      min_year: null,
      max_year: null,
      min_power: null,
      max_power: null,
      preferred_transmission: '',
      preferred_condition: '',
      max_price: null,
    }
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await getUserProfile();
        setUser(userData);
        setFormData({
          full_name: userData.full_name,
          contact_info: userData.contact_info,
          preferences: {
            preferred_brand: userData.preferences.preferred_brand || '',
            preferred_model: userData.preferences.preferred_model || '',
            min_year: userData.preferences.min_year || null,
            max_year: userData.preferences.max_year || null,
            min_power: userData.preferences.min_power || null,
            max_power: userData.preferences.max_power || null,
            preferred_transmission: userData.preferences.preferred_transmission || '',
            preferred_condition: userData.preferences.preferred_condition || '',
            max_price: userData.preferences.max_price || null,
          }
        });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Разделяем поля на основные и предпочтения
    if (name.startsWith('preferences.')) {
      const preferenceField = name.split('.')[1];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [preferenceField]: value === '' ? null :
            ['min_year', 'max_year', 'min_power', 'max_power', 'max_price'].includes(preferenceField)
              ? parseInt(value) || null
              : value,
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const updated = await updateUserProfile(formData);
      setUser({ ...(user as User), ...updated });
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении профиля:', error);
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
      console.error('Ошибка при удалении аккаунта:', error);
      alert('Не удалось удалить аккаунт');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Профиль пользователя</h1>
          <div className="flex gap-4">
            <Link href="/dashboard/buyer" className="text-sm text-gray-600 hover:text-gray-900 transition">
              Вернуться в личный кабинет
            </Link>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Личная информация</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="text"
                    id="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Email нельзя изменить</p>
                </div>

                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Полное имя
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                    Контактная информация
                  </label>
                  <input
                    type="text"
                    id="contact_info"
                    name="contact_info"
                    value={formData.contact_info || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Предпочтения</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="preferred_brand" className="block text-sm font-medium text-gray-700 mb-1">
                      Предпочитаемая марка
                    </label>
                    <input
                      type="text"
                      id="preferred_brand"
                      name="preferences.preferred_brand"
                      value={formData.preferences?.preferred_brand || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferred_model" className="block text-sm font-medium text-gray-700 mb-1">
                      Предпочитаемая модель
                    </label>
                    <input
                      type="text"
                      id="preferred_model"
                      name="preferences.preferred_model"
                      value={formData.preferences?.preferred_model || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="min_year" className="block text-sm font-medium text-gray-700 mb-1">
                      Мин. год выпуска
                    </label>
                    <input
                      type="number"
                      id="min_year"
                      name="preferences.min_year"
                      value={formData.preferences?.min_year || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="max_year" className="block text-sm font-medium text-gray-700 mb-1">
                      Макс. год выпуска
                    </label>
                    <input
                      type="number"
                      id="max_year"
                      name="preferences.max_year"
                      value={formData.preferences?.max_year || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="min_power" className="block text-sm font-medium text-gray-700 mb-1">
                      Мин. мощность (л.с.)
                    </label>
                    <input
                      type="number"
                      id="min_power"
                      name="preferences.min_power"
                      value={formData.preferences?.min_power || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="max_power" className="block text-sm font-medium text-gray-700 mb-1">
                      Макс. мощность (л.с.)
                    </label>
                    <input
                      type="number"
                      id="max_power"
                      name="preferences.max_power"
                      value={formData.preferences?.max_power || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="preferred_transmission" className="block text-sm font-medium text-gray-700 mb-1">
                      Предпочитаемая КПП
                    </label>
                    <select
                      id="preferred_transmission"
                      name="preferences.preferred_transmission"
                      value={formData.preferences?.preferred_transmission || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Не важно</option>
                      <option value="МКП">МКП</option>
                      <option value="АКП">АКП</option>
                      <option value="Робот">Робот</option>
                      <option value="Вариатор">Вариатор</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="preferred_condition" className="block text-sm font-medium text-gray-700 mb-1">
                      Предпочитаемое состояние
                    </label>
                    <select
                      id="preferred_condition"
                      name="preferences.preferred_condition"
                      value={formData.preferences?.preferred_condition || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Не важно</option>
                      <option value="new">Новый</option>
                      <option value="used">С пробегом</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="max_price" className="block text-sm font-medium text-gray-700 mb-1">
                      Макс. цена ($)
                    </label>
                    <input
                      type="number"
                      id="max_price"
                      name="preferences.max_price"
                      value={formData.preferences?.max_price || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Email</dt>
                      <dd className="text-base">{user?.email || 'Не указано'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Полное имя</dt>
                      <dd className="text-base">{user?.full_name || 'Не указано'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Контактная информация</dt>
                      <dd className="text-base">{user?.contact_info || 'Не указано'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Предпочтения</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-sm text-gray-500">Предпочитаемая марка</dt>
                      <dd className="text-base">{user?.preferences?.preferred_brand || 'Не указано'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Предпочитаемая модель</dt>
                      <dd className="text-base">{user?.preferences?.preferred_model || 'Не указано'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Год выпуска</dt>
                      <dd className="text-base">
                        {user?.preferences?.min_year && user?.preferences?.max_year
                          ? `${user.preferences.min_year} - ${user.preferences.max_year}`
                          : user?.preferences?.min_year
                          ? `От ${user.preferences.min_year}`
                          : user?.preferences?.max_year
                          ? `До ${user.preferences.max_year}`
                          : 'Не указано'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Мощность (л.с.)</dt>
                      <dd className="text-base">
                        {user?.preferences?.min_power && user?.preferences?.max_power
                          ? `${user.preferences.min_power} - ${user.preferences.max_power}`
                          : user?.preferences?.min_power
                          ? `От ${user.preferences.min_power}`
                          : user?.preferences?.max_power
                          ? `До ${user.preferences.max_power}`
                          : 'Не указано'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Предпочитаемая КПП</dt>
                      <dd className="text-base">{user?.preferences?.preferred_transmission || 'Не указано'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Предпочитаемое состояние</dt>
                      <dd className="text-base">
                        {user?.preferences?.preferred_condition === 'new' ? 'Новый' :
                         user?.preferences?.preferred_condition === 'used' ? 'С пробегом' :
                         'Не указано'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Максимальная цена</dt>
                      <dd className="text-base">
                        {user?.preferences?.max_price ? `$${user.preferences.max_price}` : 'Не указано'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            Удалить аккаунт
          </button>
        </div>
      </main>
    </div>
  );
}