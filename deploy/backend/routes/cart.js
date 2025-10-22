const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeGuestCart
} = require('../controllers/cartController');
const { optionalAuth, requireAuth } = require('../middleware/auth');

// Все маршруты требуют аутентификации
router.get('/', requireAuth, getCart);
router.post('/', requireAuth, addToCart);
router.put('/:id', requireAuth, updateCartItem);
router.delete('/:id', requireAuth, removeFromCart);
router.delete('/', requireAuth, clearCart);

// Маршрут для переноса гостевой корзины (требует аутентификации)
router.post('/merge-guest', requireAuth, mergeGuestCart);

module.exports = router;

