"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

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

    if (!formData.email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 8) {
      newErrors.password = "Пароль должен содержать не менее 8 символов";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    if (!formData.full_name) {
      newErrors.full_name = "Имя обязательно";
    }

    if (!formData.contact_info) {
      newErrors.contact_info = "Контактная информация обязательна";
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
      // Подготовка данных для отправки
      const dataToSubmit = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        contact_info: formData.contact_info
      };

      // Отправка запроса на регистрацию
      const response = await axios.post('/auth/register/seller', dataToSubmit);

      // После успешной регистрации перенаправление на страницу входа
      router.push('/auth/login?success=registration');
    } catch (error) {
      console.error('Ошибка при регистрации:', error);

      if (axios.isAxiosError(error) && error.response) {
        // Обработка ошибок от API
        setSubmitError(error.response.data.detail || 'Произошла ошибка при регистрации');
      } else {
        setSubmitError('Произошла ошибка при регистрации');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-center">Регистрация продавца</CardTitle>
          <CardDescription className="text-center">
            Создайте аккаунт, чтобы предлагать автомобили на нашей платформе
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {submitError && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md text-center">
                {submitError}
              </div>
            )}

            {/* Основные данные в две колонки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="full_name">ФИО*</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Иванов Иван Иванович"
                  className={errors.full_name ? "border-destructive" : ""}
                />
                {errors.full_name && <p className="text-destructive text-sm">{errors.full_name}</p>}
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="contact_info">Телефон*</Label>
                <Input
                  id="contact_info"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleChange}
                  placeholder="+7 (999) 123-45-67"
                  className={errors.contact_info ? "border-destructive" : ""}
                />
                {errors.contact_info && <p className="text-destructive text-sm">{errors.contact_info}</p>}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex-col gap-4 pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
            </Button>

            <p className="text-center text-sm">
              Уже есть аккаунт?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Войти
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}