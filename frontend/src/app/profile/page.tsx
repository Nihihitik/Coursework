"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserProfile, updateUserProfile, deleteUserAccount } from '@/lib/api';

// Импортируем компоненты из shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Профиль продавца</h1>
          <Link href="/dashboard/seller" passHref>
            <Button variant="outline">Вернуться в кабинет</Button>
          </Link>
        </div>
      </header>

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

                <div className="flex justify-end">
                  <Button type="submit" className="w-full sm:w-auto">
                    Сохранить изменения
                  </Button>
                </div>
              </form>
            ) : (
              <Card className="border shadow-none">
                <CardContent className="space-y-4 pt-4">
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
                  Это действие нельзя отменить. Ваш аккаунт будет удален вместе со всеми данными и объявлениями.
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
