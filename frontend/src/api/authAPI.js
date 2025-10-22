import axios from './axios';

export const authAPI = {
  register: async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      return response;
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post('/api/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Очищаем токен из localStorage
      localStorage.removeItem('token');
      return { success: true, message: 'Выход выполнен' };
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Токен не найден');
      }

      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения пользователя:', error);
      throw error;
    }
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token) => {
    localStorage.setItem('token', token);
  }
};