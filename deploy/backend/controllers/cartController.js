const { Cart, Product, ProductImage } = require('../models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// Получить корзину
const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;

    // Проверяем аутентификацию
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Для просмотра корзины необходимо войти в систему'
      });
    }

    const where = { user_id: userId };

    const cartItems = await Cart.findAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        include: [{
          model: ProductImage,
          as: 'images',
          where: { is_main: true },
          required: false,
          limit: 1
        }]
      }]
    });

    // Подсчитываем итоговую сумму
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        items: cartItems,
        totalAmount,
        itemsCount: cartItems.length
      }
    });
  } catch (error) {
    logger.error('Ошибка получения корзины', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения корзины',
      error: error.message
    });
  }
};

// Добавить в корзину
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.user?.id;

    // Проверяем аутентификацию
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Для добавления в корзину необходимо войти в систему'
      });
    }

    // Проверяем существование товара
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Проверяем, есть ли уже товар в корзине
    const where = { user_id: userId, product_id };
    let cartItem = await Cart.findOne({ where });

    if (cartItem) {
      // Обновляем количество
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Создаем новую запись
      cartItem = await Cart.create({
        user_id: userId,
        product_id,
        quantity
      });
    }

    logger.success('Товар добавлен в корзину', { product_id, quantity });

    res.status(200).json({
      success: true,
      message: 'Товар добавлен в корзину',
      data: cartItem
    });
  } catch (error) {
    logger.error('Ошибка добавления в корзину', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка добавления в корзину',
      error: error.message
    });
  }
};

// Обновить количество товара в корзине
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Количество должно быть больше 0'
      });
    }

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Элемент корзины не найден'
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    logger.success('Количество товара обновлено', { cart_item_id: id, quantity });

    res.status(200).json({
      success: true,
      message: 'Количество обновлено',
      data: cartItem
    });
  } catch (error) {
    logger.error('Ошибка обновления корзины', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления корзины',
      error: error.message
    });
  }
};

// Удалить товар из корзины
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Элемент корзины не найден'
      });
    }

    await cartItem.destroy();

    logger.success('Товар удален из корзины', { cart_item_id: id });

    res.status(200).json({
      success: true,
      message: 'Товар удален из корзины'
    });
  } catch (error) {
    logger.error('Ошибка удаления из корзины', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления из корзины',
      error: error.message
    });
  }
};

// Очистить корзину
const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.cookies?.session_id;

    if (!userId && !sessionId) {
      return res.status(200).json({
        success: true,
        message: 'Корзина уже пуста'
      });
    }

    const where = userId ? { user_id: userId } : { session_id: sessionId };

    await Cart.destroy({ where });

    logger.success('Корзина очищена', { user_id: userId });

    res.status(200).json({
      success: true,
      message: 'Корзина очищена'
    });
  } catch (error) {
    logger.error('Ошибка очистки корзины', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка очистки корзины',
      error: error.message
    });
  }
};

// Перенос товаров из гостевой корзины в корзину пользователя
const mergeGuestCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { guest_session_id } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не авторизован'
      });
    }

    if (!guest_session_id) {
      return res.status(400).json({
        success: false,
        message: 'Не указан session_id гостевой корзины'
      });
    }

    // Получаем товары из гостевой корзины
    const guestCartItems = await Cart.findAll({
      where: { session_id: guest_session_id },
      include: [{
        model: Product,
        as: 'product'
      }]
    });

    if (guestCartItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Гостевая корзина пуста',
        data: { mergedItems: 0 }
      });
    }

    let mergedItems = 0;

    // Переносим каждый товар в корзину пользователя
    for (const guestItem of guestCartItems) {
      // Проверяем, есть ли уже такой товар в корзине пользователя
      const existingItem = await Cart.findOne({
        where: {
          user_id: userId,
          product_id: guestItem.product_id
        }
      });

      if (existingItem) {
        // Если товар уже есть, увеличиваем количество
        await existingItem.update({
          quantity: existingItem.quantity + guestItem.quantity
        });
      } else {
        // Если товара нет, создаем новую запись
        await Cart.create({
          user_id: userId,
          product_id: guestItem.product_id,
          quantity: guestItem.quantity
        });
      }
      mergedItems++;
    }

    // Удаляем товары из гостевой корзины
    await Cart.destroy({
      where: { session_id: guest_session_id }
    });

    logger.info(`Перенесено ${mergedItems} товаров из гостевой корзины в корзину пользователя ${userId}`);

    res.status(200).json({
      success: true,
      message: `Товары успешно перенесены в вашу корзину`,
      data: { mergedItems }
    });

  } catch (error) {
    logger.error('Ошибка переноса гостевой корзины:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при переносе товаров в корзину'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart
};

