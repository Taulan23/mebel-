const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const { User } = require('../models');

// Middleware для проверки JWT токена
const authMiddleware = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Доступ запрещен. Токен не предоставлен.' 
      });
    }

    // Проверяем токен
    const decoded = jwt.verify(token, jwtSecret);
    
    // Находим пользователя
    const user = await User.findByPk(decoded.id);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ 
        success: false,
        message: 'Пользователь не найден или неактивен.' 
      });
    }

    // Добавляем пользователя в request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Недействительный токен.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Токен истек.' 
      });
    }
    return res.status(500).json({ 
      success: false,
      message: 'Ошибка сервера при проверке токена.' 
    });
  }
};

// Опциональная аутентификация (для корзины гостей)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, jwtSecret);
      const user = await User.findByPk(decoded.id);
      
      if (user && user.is_active) {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name
        };
      }
    }
    
    next();
  } catch (error) {
    // Если токен недействителен, просто продолжаем без пользователя
    next();
  }
};

// Алиас для совместимости
const protect = authMiddleware;
const requireAuth = authMiddleware;

module.exports = { authMiddleware, optionalAuth, protect, requireAuth };

