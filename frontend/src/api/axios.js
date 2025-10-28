import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://84.54.29.55';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

console.log('🔧 Axios настроен с baseURL:', API_URL);

// Интерцептор для добавления токена к запросам
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ответов
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      const currentPath = window.location.pathname;
      
      // Очищаем только если уже не на странице входа
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Перенаправляем только если это защищенная страница (админка, профиль, заказы)
        if (currentPath.includes('/admin') || currentPath.includes('/profile') || currentPath.includes('/orders')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

