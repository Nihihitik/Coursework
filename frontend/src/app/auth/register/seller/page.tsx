"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { registerSeller } from "@/lib/api";

export default function RegisterSeller() {
  const router = useRouter();

  // Состояние для данных формы
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    contact_info: ""
  });

  // Состояние для ошибок
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очистка ошибок при изменении поля
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Проверка email
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать не менее 6 символов';
    }

    // Проверка подтверждения пароля
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Проверка полного имени
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'ФИО обязательно';
    }

    // Проверка контактной информации
    if (!formData.contact_info.trim()) {
      newErrors.contact_info = 'Контактная информация обязательна';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Отправка формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('Отправляем данные регистрации продавца:', {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        contact_info: formData.contact_info
      });

      // Подготовка данных для отправки
      const dataToSubmit = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        contact_info: formData.contact_info
      };

      // Используем функцию registerSeller из API
      const data = await registerSeller(dataToSubmit);
      console.log('Успешный ответ от сервера:', data);

      // После успешной регистрации перенаправление на страницу входа
      router.push('/auth/login?success=registration');
    } catch (error) {
      console.error('Ошибка при регистрации:', error);

      if (axios.isAxiosError(error)) {
        // Показываем полную информацию об ошибке
        console.error('Ответ сервера с ошибкой:', error.response);
        console.error('Конфигурация запроса:', error.config);

        // Проверяем статус ошибки
        if (error.response && error.response.status === 0) {
          setSubmitError('Не удалось соединиться с сервером. Проверьте, запущен ли сервер.');
        } else if (error.response) {
          // Обработка ошибок от API
          setSubmitError(error.response.data.detail || 'Произошла ошибка при регистрации');
        } else {
          setSubmitError('Произошла ошибка при отправке запроса');
        }
      } else {
        setSubmitError('Неизвестная ошибка при регистрации');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card className="border shadow-sm">
        <CardHeader className="pb-4 space-y-1">
          <CardTitle className="text-2xl text-center">Регистрация продавца</CardTitle>
          <CardDescription className="text-center text-sm">
            Создайте учетную запись продавца для размещения автомобилей
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {submitError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-center text-sm">
                {submitError}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль*</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-destructive text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтверждение пароля*</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && <p className="text-destructive text-sm">{errors.confirmPassword}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">ФИО*</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Иванов Иван Иванович"
                className={errors.full_name ? "border-destructive" : ""}
              />
              {errors.full_name && <p className="text-destructive text-sm">{errors.full_name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_info">Контактная информация*</Label>
              <Input
                id="contact_info"
                name="contact_info"
                type="text"
                value={formData.contact_info}
                onChange={handleChange}
                placeholder="+7-999-123-4567"
                className={errors.contact_info ? "border-destructive" : ""}
              />
              {errors.contact_info && <p className="text-destructive text-sm">{errors.contact_info}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex-col pt-4 pb-5">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
            </Button>

            <div className="mt-6 text-center">
              <span className="text-sm">Уже есть аккаунт? </span>
              <Link href="/auth/login" className="text-primary text-sm hover:underline">
                Войти
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}