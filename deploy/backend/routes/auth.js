const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validate');

// POST /api/auth/register - Регистрация
router.post('/register', registerValidation, register);

// POST /api/auth/login - Вход
router.post('/login', loginValidation, login);

// GET /api/auth/me - Получить текущего пользователя
router.get('/me', authMiddleware, getMe);

module.exports = router;

