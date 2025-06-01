"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// Типы данных для автомобилей
interface Car {
  id: number;
  brand: string;
  model: string;
  year: number;
  power: number;
  transmission: "АКП" | "МКП";
  condition: "new" | "used";
  mileage: number;
  features: string[];
  price: number;
  seller_name: string;
  store_name: string;
}

// Фильтры для поиска автомобилей
interface Filters {
  brand?: string;
  model?: string;
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  condition?: string;
  transmission?: string;
  max_mileage?: number;
}

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Загрузка списка автомобилей
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);

        // Формирование строки параметров для запроса
        const params = new URLSearchParams();
        if (filters.brand) params.append("brand", filters.brand);
        if (filters.model) params.append("model", filters.model);
        if (filters.min_year) params.append("min_year", filters.min_year.toString());
        if (filters.max_year) params.append("max_year", filters.max_year.toString());
        if (filters.min_price) params.append("min_price", filters.min_price.toString());
        if (filters.max_price) params.append("max_price", filters.max_price.toString());
        if (filters.condition && filters.condition !== "all") params.append("condition", filters.condition);
        if (filters.transmission && filters.transmission !== "all") params.append("transmission", filters.transmission);
        if (filters.max_mileage) params.append("max_mileage", filters.max_mileage.toString());

        // Используем относительный путь для API запросов
        // Next.js перенаправит этот запрос через прокси, настроенный в next.config.js
        const response = await axios.get(`/cars?${params.toString()}`);
        setCars(response.data);
        setError(null);
      } catch (err) {
        console.error("Ошибка при получении списка автомобилей:", err);
        setError("Не удалось загрузить список автомобилей. Пожалуйста, проверьте, запущен ли backend сервер.");
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, [filters]);

  // Фильтрация автомобилей по поисковому запросу
  const filteredCars = Array.isArray(cars) ? cars.filter((car) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      car.brand.toLowerCase().includes(searchTermLower) ||
      car.model.toLowerCase().includes(searchTermLower)
    );
  }) : [];

  // Функция обновления фильтров
  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Сброс всех фильтров
  const resetFilters = () => {
    setFilters({});
    setSearchTerm("");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero секция с информацией о компании */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Премиальный автодилерский центр
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Мы предлагаем самый широкий выбор качественных автомобилей от ведущих мировых производителей.
            Наши специалисты помогут подобрать идеальный автомобиль, соответствующий всем вашим требованиям.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/auth/register/buyer">
              <Button size="lg">Купить автомобиль</Button>
            </Link>
            <Link href="/auth/register/seller">
              <Button variant="outline" size="lg">Продать автомобиль</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Секция поиска и фильтрации */}
      <section className="py-12 px-6">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Найдите свой идеальный автомобиль</h2>

          <div className="flex flex-col gap-4">
            {/* Строка поиска */}
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Поиск по марке, модели..."
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
              </Button>
            </div>

            {/* Расширенные фильтры */}
            {showFilters && (
              <div className="bg-card p-6 rounded-lg shadow-sm border mt-3">
                <h3 className="text-lg font-medium mb-4">Расширенный поиск</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Фильтр по бренду */}
                  <div className="space-y-2">
                    <Label htmlFor="brand">Марка</Label>
                    <Input
                      id="brand"
                      placeholder="Например, Toyota"
                      value={filters.brand || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter("brand", e.target.value)}
                    />
                  </div>

                  {/* Фильтр по модели */}
                  <div className="space-y-2">
                    <Label htmlFor="model">Модель</Label>
                    <Input
                      id="model"
                      placeholder="Например, Camry"
                      value={filters.model || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter("model", e.target.value)}
                    />
                  </div>

                  {/* Фильтр по году */}
                  <div className="space-y-2">
                    <Label>Год выпуска</Label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="От"
                        value={filters.min_year || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateFilter("min_year", e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                      <Input
                        type="number"
                        placeholder="До"
                        value={filters.max_year || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateFilter("max_year", e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  {/* Фильтр по цене */}
                  <div className="space-y-2">
                    <Label>Цена</Label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="От"
                        value={filters.min_price || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateFilter("min_price", e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                      <Input
                        type="number"
                        placeholder="До"
                        value={filters.max_price || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateFilter("max_price", e.target.value ? parseFloat(e.target.value) : undefined)}
                      />
                    </div>
                  </div>

                  {/* Фильтр по состоянию */}
                  <div className="space-y-2">
                    <Label htmlFor="condition">Состояние</Label>
                    <Select
                      value={filters.condition || "all"}
                      onValueChange={(value: string) => updateFilter("condition", value)}
                    >
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Выберите состояние" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="new">Новый</SelectItem>
                        <SelectItem value="used">С пробегом</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Фильтр по коробке передач */}
                  <div className="space-y-2">
                    <Label htmlFor="transmission">Коробка передач</Label>
                    <Select
                      value={filters.transmission || "all"}
                      onValueChange={(value: string) => updateFilter("transmission", value)}
                    >
                      <SelectTrigger id="transmission">
                        <SelectValue placeholder="Выберите КПП" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="АКП">Автомат</SelectItem>
                        <SelectItem value="МКП">Механика</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-6 gap-3">
                  <Button variant="outline" onClick={resetFilters}>Сбросить</Button>
                  <Button variant="default">Применить фильтры</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Секция с карточками автомобилей */}
      <section className="py-12 px-6">
        <div className="container max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Доступные автомобили</h2>

          {loading ? (
            <div className="flex justify-center items-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive p-4 rounded-md text-center">
              {error}
            </div>
          ) : filteredCars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCars.map((car) => (
                <Card key={car.id} className="overflow-hidden">
                  <div className="h-48 bg-muted flex items-center justify-center">
                    {/* Здесь может быть изображение автомобиля */}
                    <span className="text-3xl">🚗</span>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{car.brand} {car.model}</h3>
                        <div className="text-muted-foreground">{car.year} г.</div>
                      </div>
                      <div className="text-xl font-bold">{car.price.toLocaleString()} ₽</div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Мощность:</span>
                        <span className="font-medium">{car.power} л.с.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>КПП:</span>
                        <span className="font-medium">{car.transmission}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Состояние:</span>
                        <span className="font-medium">{car.condition === "new" ? "Новый" : "С пробегом"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Пробег:</span>
                        <span className="font-medium">{car.mileage.toLocaleString()} км</span>
                      </div>
                      {car.features && car.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {car.features.slice(0, 3).map((feature, index) => (
                            <span
                              key={index}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                            >
                              {feature}
                            </span>
                          ))}
                          {car.features.length > 3 && (
                            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                              +{car.features.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Button className="w-full mt-4">Подробнее</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg mb-4">К сожалению, на данный момент автомобили отсутствуют.</p>
              <p className="text-muted-foreground">Попробуйте изменить параметры поиска или вернитесь позже.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
