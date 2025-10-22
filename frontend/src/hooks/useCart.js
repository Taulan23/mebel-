import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartAPI } from '../api/cartAPI';
import { 
  saveCartToStorage, 
  loadCartFromStorage, 
  clearCartFromStorage,
  hasCartInStorage,
  getCartItemsCountFromStorage
} from '../utils/cartStorage';

export const useCart = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, itemsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [cartMerged, setCartMerged] = useState(false);

  // Загрузка корзины
  const loadCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated()) {
        // Для авторизованных пользователей загружаем с сервера
        const response = await cartAPI.getCart();
        const cartData = response.data || response;
        setCart(cartData);
        
        // Сохраняем в localStorage как резерв
        saveCartToStorage(cartData);
      } else {
        // Для гостей сначала пытаемся загрузить с сервера
        try {
          const response = await cartAPI.getCart();
          const cartData = response.data || response;
          setCart(cartData);
          saveCartToStorage(cartData);
        } catch (error) {
          // Если сервер недоступен, загружаем из localStorage
          console.log('Сервер недоступен, загружаем корзину из localStorage');
          const localCart = loadCartFromStorage();
          setCart(localCart);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      // В случае ошибки загружаем из localStorage
      const localCart = loadCartFromStorage();
      setCart(localCart);
    } finally {
      setLoading(false);
    }
  };

  // Добавление в корзину
  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await cartAPI.addToCart(productId, quantity);
      if (response.success) {
        await loadCart(); // Перезагружаем корзину
        return { success: true, message: 'Товар добавлен в корзину' };
      }
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      
      // Если сервер недоступен, сохраняем в localStorage
      if (!isAuthenticated()) {
        const localCart = loadCartFromStorage();
        // Простая логика для localStorage (можно улучшить)
        const existingItem = localCart.items.find(item => item.product_id === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          localCart.items.push({
            id: Date.now(), // Временный ID
            product_id: productId,
            quantity: quantity,
            product: { price: 0 } // Будет обновлено при загрузке с сервера
          });
        }
        
        localCart.totalAmount = localCart.items.reduce((sum, item) => 
          sum + (parseFloat(item.product.price) * item.quantity), 0);
        localCart.itemsCount = localCart.items.length;
        
        setCart(localCart);
        saveCartToStorage(localCart);
        
        return { success: true, message: 'Товар добавлен в корзину (офлайн)' };
      }
      
      return { success: false, message: 'Ошибка добавления в корзину' };
    }
  };

  // Обновление количества
  const updateCartItem = async (id, quantity) => {
    try {
      await cartAPI.updateCartItem(id, quantity);
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
      return { success: false };
    }
  };

  // Удаление из корзины
  const removeFromCart = async (id) => {
    try {
      await cartAPI.removeFromCart(id);
      await loadCart();
      return { success: true };
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      return { success: false };
    }
  };

  // Очистка корзины
  const clearCart = async () => {
    try {
      await cartAPI.clearCart();
      setCart({ items: [], totalAmount: 0, itemsCount: 0 });
      clearCartFromStorage();
      return { success: true };
    } catch (error) {
      console.error('Ошибка очистки корзины:', error);
      return { success: false };
    }
  };

  // Перенос корзины при авторизации
  const mergeGuestCart = async (guestSessionId) => {
    try {
      const response = await cartAPI.mergeGuestCart(guestSessionId);
      if (response.success) {
        setCartMerged(true);
        await loadCart(); // Перезагружаем корзину после переноса
        clearCartFromStorage(); // Очищаем локальную корзину
        
        return { 
          success: true, 
          message: `Товары успешно перенесены в вашу корзину (${response.data.mergedItems} товаров)`,
          mergedItems: response.data.mergedItems
        };
      }
    } catch (error) {
      console.error('Ошибка переноса корзины:', error);
      return { success: false, message: 'Ошибка при переносе корзины' };
    }
  };

  // Проверка, есть ли товары в корзине
  const hasItems = () => {
    return cart.items && cart.items.length > 0;
  };

  // Получение количества товаров
  const getItemsCount = () => {
    if (isAuthenticated()) {
      return cart.itemsCount || 0;
    } else {
      return getCartItemsCountFromStorage();
    }
  };

  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  return {
    cart,
    loading,
    cartMerged,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    mergeGuestCart,
    hasItems,
    getItemsCount
  };
};
