const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminCheck');
const { orderValidation } = require('../middleware/validate');

// Админские маршруты (должны быть ПЕРЕД параметрическими роутами)
router.get('/admin/all', protect, checkAdmin, getAllOrders);
router.put('/:id/status', protect, checkAdmin, updateOrderStatus);

// Создание заказа доступно для всех (гости и авторизованные)
router.post('/', optionalAuth, orderValidation, createOrder);

// Защищенные маршруты (только для авторизованных)
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;

