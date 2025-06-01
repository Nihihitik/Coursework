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

export default api;