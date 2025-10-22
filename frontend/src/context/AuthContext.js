import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/authAPI';
import { cartAPI } from '../api/cartAPI';
import { getCookie } from '../utils/cookies';
import { hasCartInStorage } from '../utils/cartStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем токен при загрузке
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Получаем session_id гостевой корзины перед входом
      const guestSessionId = getCookie('session_id');
      const hasGuestCart = hasCartInStorage();
      
      const response = await authAPI.login(credentials);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // Переносим товары из гостевой корзины в корзину пользователя
        if (guestSessionId || hasGuestCart) {
          try {
            console.log('Переносим корзину для сессии:', guestSessionId);
            const mergeResult = await cartAPI.mergeGuestCart(guestSessionId);
            console.log('Результат переноса корзины:', mergeResult.data);
            
            // Возвращаем информацию о переносе корзины
            return { 
              success: true, 
              cartMerged: true,
              mergedItems: mergeResult.data?.mergedItems || 0,
              message: mergeResult.data?.mergedItems > 0 
                ? `Ваша корзина перенесена! Добавлено ${mergeResult.data.mergedItems} товаров.`
                : 'Вы успешно вошли в аккаунт.'
            };
          } catch (cartError) {
            console.error('Ошибка переноса корзины:', cartError);
            // Не блокируем вход, если не удалось перенести корзину
            return { 
              success: true, 
              cartMerged: false,
              message: 'Вы успешно вошли в аккаунт, но не удалось перенести корзину.'
            };
          }
        } else {
          console.log('Нет session_id для переноса корзины');
          return { 
            success: true, 
            cartMerged: false,
            message: 'Вы успешно вошли в аккаунт.'
          };
        }
      } else {
        return { success: false, message: response.message || 'Ошибка входа' };
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      return { success: false, message: error.response?.data?.message || 'Ошибка входа' };
    }
  };

  const register = async (userData) => {
    try {
      // Получаем session_id гостевой корзины перед регистрацией
      const guestSessionId = getCookie('session_id');
      const hasGuestCart = hasCartInStorage();
      
      const response = await authAPI.register(userData);
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        // Переносим товары из гостевой корзины в корзину пользователя
        if (guestSessionId || hasGuestCart) {
          try {
            console.log('Переносим корзину для сессии:', guestSessionId);
            const mergeResult = await cartAPI.mergeGuestCart(guestSessionId);
            console.log('Результат переноса корзины:', mergeResult.data);
            
            // Возвращаем информацию о переносе корзины
            return { 
              success: true, 
              cartMerged: true,
              mergedItems: mergeResult.data?.mergedItems || 0,
              message: mergeResult.data?.mergedItems > 0 
                ? `Регистрация успешна! Ваша корзина перенесена (${mergeResult.data.mergedItems} товаров).`
                : 'Регистрация успешна!'
            };
          } catch (cartError) {
            console.error('Ошибка переноса корзины:', cartError);
            // Не блокируем регистрацию, если не удалось перенести корзину
            return { 
              success: true, 
              cartMerged: false,
              message: 'Регистрация успешна, но не удалось перенести корзину.'
            };
          }
        } else {
          console.log('Нет session_id для переноса корзины');
          return { 
            success: true, 
            cartMerged: false,
            message: 'Регистрация успешна!'
          };
        }
      } else {
        return { success: false, message: response.message || 'Ошибка регистрации' };
      }
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || error.message || 'Ошибка регистрации' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;

