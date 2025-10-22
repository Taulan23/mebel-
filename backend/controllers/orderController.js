const { Order, OrderItem, Cart, Product, ProductImage, User } = require('../models');
const { generateOrderNumber, getPagination, getPagingData } = require('../utils/helpers');
const logger = require('../utils/logger');
const { sequelize } = require('../config/database');

// Создать заказ (только для авторизованных пользователей)
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const {
      items,
      delivery_method,
      delivery_address,
      payment_method,
      customer_name,
      customer_phone,
      customer_email,
      customer_comment,
      promo_code
    } = req.body;

    // Проверяем авторизацию
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Только зарегистрированные пользователи могут оформить заказ'
      });
    }

    // Получаем товары для заказа (из корзины или из переданных items)
    let orderItems = items;
    if (!orderItems || orderItems.length === 0) {
      const cartItems = await Cart.findAll({
        where: { user_id: userId },
        include: [{ model: Product, as: 'product' }],
        transaction
      });
      
      if (cartItems.length === 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Корзина пуста'
        });
      }

      orderItems = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
    }

    // Рассчитываем сумму заказа
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of orderItems) {
      const product = await Product.findByPk(item.product_id, { transaction });
      if (!product) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: `Товар с ID ${item.product_id} не найден`
        });
      }

      const itemTotal = parseFloat(product.price) * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_image: product.main_image,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
    }

    // Применяем промокод (если есть)
    let discountAmount = 0;
    if (promo_code) {
      // TODO: Логика применения промокода
    }

    const finalAmount = totalAmount - discountAmount;

    // Создаем заказ
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      user_id: userId,
      order_number: orderNumber,
      total_amount: totalAmount,
      discount_amount: discountAmount,
      final_amount: finalAmount,
      promo_code,
      payment_method: payment_method || 'cash',
      delivery_method: delivery_method || 'delivery',
      delivery_address,
      customer_name,
      customer_phone,
      customer_email,
      customer_comment,
      status: 'pending',
      payment_status: 'pending'
    }, { transaction });

    // Создаем элементы заказа
    for (const itemData of orderItemsData) {
      await OrderItem.create({
        order_id: order.id,
        ...itemData
      }, { transaction });
    }

    // Очищаем корзину пользователя
    await Cart.destroy({ where: { user_id: userId }, transaction });

    await transaction.commit();

    logger.success('Заказ создан', { order_id: order.id, order_number: orderNumber });

    res.status(201).json({
      success: true,
      message: 'Заказ успешно создан',
      data: {
        order_id: order.id,
        order_number: orderNumber,
        final_amount: finalAmount
      }
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Ошибка создания заказа', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка создания заказа',
      error: error.message
    });
  }
};

// Получить заказы пользователя
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, size = 10 } = req.query;
    const { limit, offset } = getPagination(page, size);

    const data = await Order.findAndCountAll({
      where: { user_id: userId },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product'
        }]
      }]
    });

    const response = getPagingData(data, page, limit);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Ошибка получения заказов', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения заказов',
      error: error.message
    });
  }
};

// Получить детали заказа
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';

    // Админ может видеть любой заказ, пользователь - только свой
    const where = isAdmin ? { id } : { id, user_id: userId };

    const order = await Order.findOne({
      where,
      include: [{
        model: OrderItem,
        as: 'items',
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
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Ошибка получения заказа', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения заказа',
      error: error.message
    });
  }
};

// Получить все заказы (только админ)
const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await Order.findAll({
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        },
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    logger.error('Ошибка получения всех заказов', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения заказов',
      error: error.message
    });
  }
};

// Обновить статус заказа (только админ)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status, admin_comment } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Заказ не найден'
      });
    }

    if (status) order.status = status;
    if (payment_status) order.payment_status = payment_status;
    if (admin_comment) order.admin_comment = admin_comment;

    await order.save();

    logger.success('Статус заказа обновлен', { order_id: id, status });

    res.status(200).json({
      success: true,
      message: 'Статус заказа обновлен',
      data: order
    });
  } catch (error) {
    logger.error('Ошибка обновления статуса заказа', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления статуса заказа',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
};

