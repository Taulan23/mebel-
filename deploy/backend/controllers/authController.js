const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { jwtSecret, jwtExpire } = require('../config/auth');
const logger = require('../utils/logger');

// Генерация JWT токена
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    jwtSecret,
    { expiresIn: jwtExpire }
  );
};

// Регистрация нового пользователя
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Пользователь с таким email уже существует'
      });
    }

    // Создаем пользователя
    const user = await User.create({
      email,
      password_hash: password,
      first_name,
      last_name,
      phone,
      role: 'user'
    });

    // Генерируем токен
    const token = generateToken(user);

    logger.success('Новый пользователь зарегистрирован', { email });

    res.status(201).json({
      success: true,
      message: 'Регистрация успешна',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Ошибка регистрации', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации',
      error: error.message
    });
  }
};

// Вход пользователя
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Находим пользователя
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Проверяем пароль
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Неверный email или пароль'
      });
    }

    // Проверяем активность пользователя
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Аккаунт заблокирован'
      });
    }

    // Генерируем токен
    const token = generateToken(user);

    logger.success('Пользователь вошел в систему', { email });

    res.status(200).json({
      success: true,
      message: 'Вход выполнен успешно',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Ошибка входа', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка при входе',
      error: error.message
    });
  }
};

// Получение текущего пользователя
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Ошибка получения профиля', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения профиля',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe
};

