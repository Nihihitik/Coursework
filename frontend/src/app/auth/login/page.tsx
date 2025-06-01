"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import { loginUser } from "@/lib/api";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Состояние для данных формы
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Состояние для ошибок и сообщений
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Проверка на наличие сообщения об успешной регистрации
    if (searchParams.has("success") && searchParams.get("success") === "registration") {
      setSuccessMessage("Вы успешно зарегистрированы. Теперь войдите в систему.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(null);
    setIsSubmitting(true);

    // Проверяем введенные данные
    if (!email.trim() || !password) {
      setError('Пожалуйста, заполните все поля');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Отправляем запрос авторизации:', { username: email });

      // Используем функцию loginUser из нашего API модуля
      const data = await loginUser(email, password);
      console.log('Успешный ответ от сервера:', data);

      // Сохранение токена в localStorage (происходит в функции loginUser)
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('user_role', data.role);

      // Перенаправление на основе роли пользователя
      if (data.role === 'buyer') {
        router.push('/dashboard/buyer'); // Для покупателя - на дашборд покупателя
      } else if (data.role === 'seller') {
        router.push('/dashboard/seller'); // Для продавца - на дашборд продавца
      } else {
        router.push('/dashboard'); // Для других ролей - на общий дашборд
      }
    } catch (error) {
      console.error('Ошибка при входе в систему:', error);

      if (axios.isAxiosError(error)) {
        console.error('Детали ошибки:', error.response);

        if (error.response?.status === 401) {
          setError('Неверный email или пароль');
        } else if (error.response?.data?.detail) {
          setError(error.response.data.detail);
        } else {
          setError('Ошибка при авторизации. Повторите попытку.');
        }
      } else {
        setError('Произошла ошибка при подключении к серверу');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4 space-y-1">
          <CardTitle className="text-2xl text-center">Вход в систему</CardTitle>
          <CardDescription className="text-center text-sm">
            Войдите в свой аккаунт, чтобы получить доступ к системе
          </CardDescription>
        </CardHeader>

        {successMessage && (
          <div className="px-6 pb-2">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <AlertDescription className="text-green-600">
                {successMessage}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-center text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="example@mail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Вход..." : "Войти"}
            </Button>
          </CardContent>

          <CardFooter className="flex-col pt-0 pb-5">
            <div className="text-center w-full">
              <p className="text-sm mb-2 mt-6">
                Еще нет аккаунта?
              </p>
              <div className="grid grid-cols-2 w-full gap-2">
                <Link href="/auth/register/buyer" className="text-center">
                  <span className="text-primary text-sm hover:underline">
                    Регистрация покупателя
                  </span>
                </Link>
                <Link href="/auth/register/seller" className="text-center">
                  <span className="text-primary text-sm hover:underline">
                    Регистрация продавца
                  </span>
                </Link>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}