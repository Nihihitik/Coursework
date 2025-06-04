"use client";

import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Импортируем компоненты из shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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

  // Обработчик для изменения значения в компонентах Select
  const handleSelectChange = (field: string, value: string) => {
    if (field.startsWith('preferences.')) {
      const preferenceField = field.split('.')[1];
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          [preferenceField]: value === 'none' ? null : value,
        }
      });
    } else {
      setFormData({
        ...formData,
        [field]: value === 'none' ? null : value,
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
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Профиль пользователя</h1>
          <Link href="/dashboard/buyer" passHref>
            <Button variant="outline">Вернуться в личный кабинет</Button>
          </Link>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">Личная информация</CardTitle>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Отменить' : 'Редактировать'}
            </Button>
          </CardHeader>

          <CardContent>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-100"
                    />
                    <p className="text-sm text-gray-500">Email нельзя изменить</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Полное имя</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_info">Контактная информация</Label>
                    <Input
                      id="contact_info"
                      name="contact_info"
                      value={formData.contact_info || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Предпочтения</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferred_brand">Предпочитаемая марка</Label>
                      <Input
                        id="preferred_brand"
                        name="preferences.preferred_brand"
                        value={formData.preferences?.preferred_brand || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_model">Предпочитаемая модель</Label>
                      <Input
                        id="preferred_model"
                        name="preferences.preferred_model"
                        value={formData.preferences?.preferred_model || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min_year">Мин. год выпуска</Label>
                      <Input
                        type="number"
                        id="min_year"
                        name="preferences.min_year"
                        value={formData.preferences?.min_year || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_year">Макс. год выпуска</Label>
                      <Input
                        type="number"
                        id="max_year"
                        name="preferences.max_year"
                        value={formData.preferences?.max_year || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="min_power">Мин. мощность (л.с.)</Label>
                      <Input
                        type="number"
                        id="min_power"
                        name="preferences.min_power"
                        value={formData.preferences?.min_power || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_power">Макс. мощность (л.с.)</Label>
                      <Input
                        type="number"
                        id="max_power"
                        name="preferences.max_power"
                        value={formData.preferences?.max_power || ''}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_transmission">Предпочитаемая КПП</Label>
                      <Select
                        value={formData.preferences?.preferred_transmission || 'none'}
                        onValueChange={(value) => handleSelectChange('preferences.preferred_transmission', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Не важно" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не важно</SelectItem>
                          <SelectItem value="МКП">МКП</SelectItem>
                          <SelectItem value="АКП">АКП</SelectItem>
                          <SelectItem value="Робот">Робот</SelectItem>
                          <SelectItem value="Вариатор">Вариатор</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_condition">Предпочитаемое состояние</Label>
                      <Select
                        value={formData.preferences?.preferred_condition || 'none'}
                        onValueChange={(value) => handleSelectChange('preferences.preferred_condition', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Не важно" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Не важно</SelectItem>
                          <SelectItem value="new">Новый</SelectItem>
                          <SelectItem value="used">С пробегом</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max_price">Макс. цена ($)</Label>
                      <Input
                        type="number"
                        id="max_price"
                        name="preferences.max_price"
                        value={formData.preferences?.max_price || ''}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    Сохранить изменения
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="border shadow-none">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">Основная информация</h3>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-base font-medium">{user?.email || 'Не указано'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Полное имя</p>
                      <p className="text-base font-medium">{user?.full_name || 'Не указано'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Контактная информация</p>
                      <p className="text-base font-medium">{user?.contact_info || 'Не указано'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-none">
                  <CardHeader className="pb-2">
                    <h3 className="text-lg font-medium">Предпочтения</h3>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <p className="text-sm text-gray-500">Предпочитаемая марка</p>
                      <p className="text-base font-medium">{user?.preferences?.preferred_brand || 'Не указано'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Предпочитаемая модель</p>
                      <p className="text-base font-medium">{user?.preferences?.preferred_model || 'Не указано'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Год выпуска</p>
                      <p className="text-base font-medium">
                        {user?.preferences?.min_year && user?.preferences?.max_year
                          ? `${user.preferences.min_year} - ${user.preferences.max_year}`
                          : user?.preferences?.min_year
                          ? `От ${user.preferences.min_year}`
                          : user?.preferences?.max_year
                          ? `До ${user.preferences.max_year}`
                          : 'Не указано'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Мощность (л.с.)</p>
                      <p className="text-base font-medium">
                        {user?.preferences?.min_power && user?.preferences?.max_power
                          ? `${user.preferences.min_power} - ${user.preferences.max_power}`
                          : user?.preferences?.min_power
                          ? `От ${user.preferences.min_power}`
                          : user?.preferences?.max_power
                          ? `До ${user.preferences.max_power}`
                          : 'Не указано'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Предпочитаемая КПП</p>
                      <p className="text-base font-medium">{user?.preferences?.preferred_transmission || 'Не указано'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Предпочитаемое состояние</p>
                      <p className="text-base font-medium">
                        {user?.preferences?.preferred_condition === 'new' ? 'Новый' :
                         user?.preferences?.preferred_condition === 'used' ? 'С пробегом' :
                         'Не указано'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Максимальная цена</p>
                      <p className="text-base font-medium">
                        {user?.preferences?.max_price ? `$${user.preferences.max_price}` : 'Не указано'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end mt-8">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Удалить аккаунт</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Это действие нельзя отменить. Ваш аккаунт будет удален вместе со всеми данными и настройками.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Удалить</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </div>
  );
}