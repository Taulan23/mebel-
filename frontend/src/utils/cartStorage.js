// Утилиты для работы с корзиной в localStorage

const CART_STORAGE_KEY = 'guest_cart';

// Сохранение корзины в localStorage
export const saveCartToStorage = (cartData) => {
  try {
    const cartToSave = {
      items: cartData.items || [],
      totalAmount: cartData.totalAmount || 0,
      itemsCount: cartData.itemsCount || 0,
      timestamp: Date.now()
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartToSave));
    console.log('Корзина сохранена в localStorage:', cartToSave);
  } catch (error) {
    console.error('Ошибка сохранения корзины в localStorage:', error);
  }
};

// Загрузка корзины из localStorage
export const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      console.log('Корзина загружена из localStorage:', cartData);
      return cartData;
    }
  } catch (error) {
    console.error('Ошибка загрузки корзины из localStorage:', error);
  }
  return { items: [], totalAmount: 0, itemsCount: 0 };
};

// Очистка корзины из localStorage
export const clearCartFromStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('Корзина очищена из localStorage');
  } catch (error) {
    console.error('Ошибка очистки корзины из localStorage:', error);
  }
};

// Проверка, есть ли корзина в localStorage
export const hasCartInStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      return cartData.items && cartData.items.length > 0;
    }
  } catch (error) {
    console.error('Ошибка проверки корзины в localStorage:', error);
  }
  return false;
};

// Получение количества товаров в корзине из localStorage
export const getCartItemsCountFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      return cartData.itemsCount || 0;
    }
  } catch (error) {
    console.error('Ошибка получения количества товаров из localStorage:', error);
  }
  return 0;
};
