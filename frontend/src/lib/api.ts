// Функция для получения заказов продавца
export const getSellerOrders = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/seller`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении заказов');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при получении заказов:', error);
    throw error;
  }
};

// Функция для создания заказа
export const createOrder = async (carId: number) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ car_id: carId }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при создании заказа');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при создании заказа:', error);
    throw error;
  }
};

// Функция для обновления статуса заказа
export const updateOrderStatus = async (orderId: number, status: 'approved' | 'rejected') => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при обновлении статуса заказа');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при обновлении статуса заказа:', error);
    throw error;
  }
};

// Функция для получения заказов покупателя
export const getBuyerOrders = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/buyer`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении заказов');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при получении заказов покупателя:', error);
    throw error;
  }
};

// Функция для получения всех автомобилей
export const getAllCars = async (filters = {}) => {
  try {
    // Формируем URL с параметрами фильтрации
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/cars`);

    // Добавляем параметры фильтрации в URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    // Определяем заголовки запроса
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем токен авторизации, если он есть
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Выполняем запрос
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении автомобилей');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при получении автомобилей:', error);
    return [];
  }
};

// Функция для получения данных конкретного автомобиля по ID
export const getCarById = async (id: number) => {
  try {
    // Определяем заголовки запроса
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Добавляем токен авторизации, если он есть
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении данных автомобиля');
    }

    return await response.json();
  } catch (error) {
    console.error(`Ошибка API при получении автомобиля с ID ${id}:`, error);
    throw error;
  }
};

// Функция для обновления статуса автомобиля
export const updateCarStatus = async (carId: number, status: 'active' | 'inactive' | 'sold') => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/${carId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при обновлении статуса автомобиля');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при обновлении статуса автомобиля:', error);
    throw error;
  }
};

// Функция для получения профиля пользователя
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении профиля');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при получении профиля:', error);
    throw error;
  }
};

// Функция для получения автомобилей продавца
export const getSellerCars = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cars/seller`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении автомобилей продавца');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при получении автомобилей продавца:', error);
    throw error;
  }
};

// Функция для добавления автомобиля в избранное
export const addCarToFavorites = async (carId: number) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ car_id: carId }),
    });

    if (!response.ok) {
      throw new Error('Ошибка при добавлении автомобиля в избранное');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при добавлении в избранное:', error);
    throw error;
  }
};

// Функция для удаления автомобиля из избранного
export const removeFromFavorites = async (carId: number) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites/${carId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при удалении автомобиля из избранного');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при удалении из избранного:', error);
    throw error;
  }
};

// Функция для регистрации покупателя
export const registerBuyer = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/buyer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка при регистрации');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при регистрации покупателя:', error);
    throw error;
  }
};

// Функция для регистрации продавца
export const registerSeller = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  store_name?: string;
  address?: string;
}) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/seller`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка при регистрации');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при регистрации продавца:', error);
    throw error;
  }
};

// Функция для входа пользователя
export const loginUser = async (credentials: { email: string; password: string }) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Ошибка при входе');
    }

    const data = await response.json();

    // Сохраняем токен в локальном хранилище
    if (data.access_token) {
      localStorage.setItem('auth_token', data.access_token);

      // Сохраняем роль пользователя, если она предоставлена
      if (data.user_role) {
        localStorage.setItem('user_role', data.user_role);
      }
    }

    return data;
  } catch (error) {
    console.error('Ошибка API при входе:', error);
    throw error;
  }
};

// Функция для получения избранных автомобилей пользователя
export const getUserFavorites = async () => {
  try {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Не авторизован');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/favorites`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении избранных автомобилей');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка API при получении избранных автомобилей:', error);
    return [];
  }
};