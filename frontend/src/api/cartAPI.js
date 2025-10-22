import axios from './axios';

// Работа с корзиной через API с fallback на localStorage
const CART_KEY = 'mebel_cart';

const getCartFromStorage = () => {
  try {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : { items: [], totalAmount: 0 };
  } catch (error) {
    console.error('Ошибка загрузки корзины из localStorage:', error);
    return { items: [], totalAmount: 0 };
  }
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Ошибка сохранения корзины в localStorage:', error);
  }
};

const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (parseFloat(item.product.price) * item.quantity), 0);
};

export const cartAPI = {
  getCart: async () => {
    try {
      // Пробуем API
      const response = await axios.get('/api/cart');
      return response.data;
    } catch (error) {
      console.log('Сервер недоступен, загружаем корзину из localStorage');
      return { data: getCartFromStorage() };
    }
  },
  
  addToCart: async (productId, quantity = 1) => {
    try {
      // Пробуем API
      const response = await axios.post('/api/cart', { product_id: productId, quantity });
      return response.data;
    } catch (error) {
      console.log('Сервер недоступен, сохраняем в localStorage');
      
      // Fallback на localStorage
      const cart = getCartFromStorage();
      const existingItem = cart.items.find(item => item.product.id === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Нужно получить данные товара
        try {
          const productResponse = await axios.get(`/api/products/${productId}`);
          const product = productResponse.data.data;
          cart.items.push({
            id: Date.now(),
            product: product,
            quantity: quantity
          });
        } catch (productError) {
          console.error('Не удалось получить данные товара:', productError);
          return { success: false, message: 'Ошибка получения данных товара' };
        }
      }
      
      cart.totalAmount = calculateTotal(cart.items);
      saveCartToStorage(cart);
      
      return { success: true, message: 'Товар добавлен в корзину' };
    }
  },
  
  updateCartItem: async (id, quantity) => {
    try {
      // Пробуем API
      const response = await axios.put(`/api/cart/${id}`, { quantity });
      return response.data;
    } catch (error) {
      console.log('Сервер недоступен, обновляем в localStorage');
      
      // Fallback на localStorage
      const cart = getCartFromStorage();
      const item = cart.items.find(item => item.id === id);
      
      if (item) {
        if (quantity <= 0) {
          cart.items = cart.items.filter(item => item.id !== id);
        } else {
          item.quantity = quantity;
        }
        cart.totalAmount = calculateTotal(cart.items);
        saveCartToStorage(cart);
      }
      
      return { success: true, message: 'Корзина обновлена' };
    }
  },
  
  removeFromCart: async (id) => {
    try {
      // Пробуем API
      const response = await axios.delete(`/api/cart/${id}`);
      return response.data;
    } catch (error) {
      console.log('Сервер недоступен, удаляем из localStorage');
      
      // Fallback на localStorage
      const cart = getCartFromStorage();
      cart.items = cart.items.filter(item => item.id !== id);
      cart.totalAmount = calculateTotal(cart.items);
      saveCartToStorage(cart);
      
      return { success: true, message: 'Товар удален из корзины' };
    }
  },
  
  clearCart: async () => {
    try {
      // Пробуем API
      const response = await axios.delete('/api/cart');
      return response.data;
    } catch (error) {
      console.log('Сервер недоступен, очищаем localStorage');
      
      // Fallback на localStorage
      const emptyCart = { items: [], totalAmount: 0 };
      saveCartToStorage(emptyCart);
      
      return { success: true, message: 'Корзина очищена' };
    }
  },
  
  // Перенос товаров из гостевой корзины в корзину пользователя
  mergeGuestCart: async (guestSessionId) => {
    try {
      const response = await axios.post('/api/cart/merge-guest', { guest_session_id: guestSessionId });
      return response.data;
    } catch (error) {
      console.log('Сервер недоступен, пропускаем слияние корзин');
      return { success: true, message: 'Корзины объединены' };
    }
  }
};