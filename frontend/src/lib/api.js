import axios from 'axios';

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов для обработки ошибок
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Если ошибка 401 и это не повторный запрос авторизации
    if (error.response?.status === 401 && !originalRequest._retry &&
        originalRequest.url !== '/auth/token') {
      console.error('Ошибка авторизации:', error);

      // Очищаем токен и перенаправляем на страницу входа
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

// Вспомогательные функции для работы с API
export const loginUser = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/auth/token', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const registerBuyer = async (buyerData) => {
  const response = await api.post('/auth/register/buyer', buyerData);
  return response.data;
};

export const registerSeller = async (sellerData) => {
  const response = await api.post('/auth/register/seller', sellerData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Функции для работы с автомобилями
export const getAllCars = async (filters = {}) => {
  const response = await api.get('/cars', { params: filters });
  return response.data;
};

export const getCarById = async (id) => {
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

export const addCarToFavorites = async (carId) => {
  try {
    console.log('Добавляем автомобиль в избранное:', carId);
    const response = await api.post('/favorites', { car_id: carId });
    console.log('Ответ сервера после добавления в избранное:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении автомобиля в избранное:', error);
    if (error.response) {
      console.error('Статус ответа:', error.response.status);
      console.error('Данные ответа:', error.response.data);
    }
    throw error; // Перебрасываем ошибку дальше для обработки
  }
};

export const removeFromFavorites = async (carId) => {
  try {
    console.log('Удаляем автомобиль из избранного:', carId);
    const response = await api.delete(`/favorites/${carId}`);
    console.log('Ответ сервера после удаления из избранного:', response.data);
    return response.data;
  } catch (error) {
    console.error('Ошибка при удалении автомобиля из избранного:', error);
    if (error.response) {
      console.error('Статус ответа:', error.response.status);
      console.error('Данные ответа:', error.response.data);
    }
    throw error; // Перебрасываем ошибку дальше для обработки
  }
};

export const getUserFavorites = async () => {
  const response = await api.get('/favorites');
  return response.data;
};

// Функции для продавцов
export const addCar = async (carData) => {
  console.log('Данные перед отправкой на сервер:', carData);
  const response = await api.post('/cars', carData);
  return response.data;
};

export const updateCar = async (id, carData) => {
  const response = await api.put(`/cars/${id}`, carData);
  return response.data;
};

// Функция для обновления статуса автомобиля
export const updateCarStatus = async (id, status) => {
  const response = await api.patch(`/cars/${id}/status`, { status });
  return response.data;
};

export const deleteCar = async (id) => {
  const response = await api.delete(`/cars/${id}`);
  return response.data;
};

export const getSellerCars = async () => {
  const response = await api.get('/seller/cars');
  return response.data;
};

// Функции для работы с магазинами
export const getAllStores = async () => {
  const response = await api.get('/stores');
  return response.data;
};

export const createStore = async (storeData) => {
  console.log('API: Отправляемые данные магазина:', storeData);

  // Отправляем данные как параметры запроса, а не как JSON-тело
  const response = await api.post('/stores', null, {
    params: {
      name: storeData.name,
      address: storeData.address
    }
  });

  return response.data;
};

export default api;