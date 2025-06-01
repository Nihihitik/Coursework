"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function RegisterBuyer() {
  const router = useRouter();
  const [showPreferences, setShowPreferences] = useState(false);

  // Состояние для данных формы
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    contact_info: "",
    preferred_brand: "",
    preferred_model: "",
    min_year: "",
    max_year: "",
    min_power: "",
    max_power: "",
    preferred_transmission: "",
    preferred_condition: "",
    max_price: ""
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

  // Обработчик изменения для селектов
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
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

    // Проверка числовых полей
    if (formData.min_year && isNaN(Number(formData.min_year))) {
      newErrors.min_year = "Должно быть числом";
    }

    if (formData.max_year && isNaN(Number(formData.max_year))) {
      newErrors.max_year = "Должно быть числом";
    }

    if (formData.min_power && isNaN(Number(formData.min_power))) {
      newErrors.min_power = "Должно быть числом";
    }

    if (formData.max_power && isNaN(Number(formData.max_power))) {
      newErrors.max_power = "Должно быть числом";
    }

    if (formData.max_price && isNaN(Number(formData.max_price))) {
      newErrors.max_price = "Должно быть числом";
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
        contact_info: formData.contact_info,
        preferred_brand: formData.preferred_brand || undefined,
        preferred_model: formData.preferred_model || undefined,
        min_year: formData.min_year ? Number(formData.min_year) : undefined,
        max_year: formData.max_year ? Number(formData.max_year) : undefined,
        min_power: formData.min_power ? Number(formData.min_power) : undefined,
        max_power: formData.max_power ? Number(formData.max_power) : undefined,
        preferred_transmission: formData.preferred_transmission || undefined,
        preferred_condition: formData.preferred_condition || undefined,
        max_price: formData.max_price ? Number(formData.max_price) : undefined
      };

      // Отправка запроса на регистрацию
      const response = await axios.post('/auth/register/buyer', dataToSubmit);

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

  // Переключение видимости секции предпочтений
  const togglePreferences = () => {
    setShowPreferences(!showPreferences);
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-2xl text-center">Регистрация покупателя</CardTitle>
          <CardDescription className="text-center">
            Создайте аккаунт, чтобы начать поиск идеального автомобиля
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

            {/* Секция предпочтений (разворачиваемая) */}
            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={togglePreferences}
                className="flex items-center justify-between w-full text-left py-2"
              >
                <h3 className="text-lg font-medium">Предпочтения (необязательно)</h3>
                {showPreferences ?
                  <ChevronUp className="h-5 w-5" /> :
                  <ChevronDown className="h-5 w-5" />
                }
              </button>

              {showPreferences && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferred_brand">Предпочитаемая марка</Label>
                    <Input
                      id="preferred_brand"
                      name="preferred_brand"
                      value={formData.preferred_brand}
                      onChange={handleChange}
                      placeholder="Например, Toyota"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_model">Предпочитаемая модель</Label>
                    <Input
                      id="preferred_model"
                      name="preferred_model"
                      value={formData.preferred_model}
                      onChange={handleChange}
                      placeholder="Например, Camry"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_year">Мин. год выпуска</Label>
                    <Input
                      id="min_year"
                      name="min_year"
                      type="number"
                      value={formData.min_year}
                      onChange={handleChange}
                      placeholder="2015"
                      className={errors.min_year ? "border-destructive" : ""}
                    />
                    {errors.min_year && <p className="text-destructive text-sm">{errors.min_year}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_year">Макс. год выпуска</Label>
                    <Input
                      id="max_year"
                      name="max_year"
                      type="number"
                      value={formData.max_year}
                      onChange={handleChange}
                      placeholder="2023"
                      className={errors.max_year ? "border-destructive" : ""}
                    />
                    {errors.max_year && <p className="text-destructive text-sm">{errors.max_year}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_power">Мин. мощность (л.с.)</Label>
                    <Input
                      id="min_power"
                      name="min_power"
                      type="number"
                      value={formData.min_power}
                      onChange={handleChange}
                      placeholder="100"
                      className={errors.min_power ? "border-destructive" : ""}
                    />
                    {errors.min_power && <p className="text-destructive text-sm">{errors.min_power}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_power">Макс. мощность (л.с.)</Label>
                    <Input
                      id="max_power"
                      name="max_power"
                      type="number"
                      value={formData.max_power}
                      onChange={handleChange}
                      placeholder="300"
                      className={errors.max_power ? "border-destructive" : ""}
                    />
                    {errors.max_power && <p className="text-destructive text-sm">{errors.max_power}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_transmission">Тип КПП</Label>
                    <Select
                      value={formData.preferred_transmission}
                      onValueChange={(value) => handleSelectChange("preferred_transmission", value)}
                    >
                      <SelectTrigger id="preferred_transmission">
                        <SelectValue placeholder="Выберите КПП" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="АКП">Автомат</SelectItem>
                        <SelectItem value="МКП">Механика</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_condition">Состояние</Label>
                    <Select
                      value={formData.preferred_condition}
                      onValueChange={(value) => handleSelectChange("preferred_condition", value)}
                    >
                      <SelectTrigger id="preferred_condition">
                        <SelectValue placeholder="Выберите состояние" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Новый</SelectItem>
                        <SelectItem value="used">С пробегом</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_price">Максимальная цена</Label>
                    <Input
                      id="max_price"
                      name="max_price"
                      type="number"
                      value={formData.max_price}
                      onChange={handleChange}
                      placeholder="2000000"
                      className={errors.max_price ? "border-destructive" : ""}
                    />
                    {errors.max_price && <p className="text-destructive text-sm">{errors.max_price}</p>}
                  </div>
                </div>
              )}
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