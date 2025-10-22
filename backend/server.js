const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Импорт роутов
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const categoriesRoutes = require('./routes/categories');
const cartRoutes = require('./routes/cart');
const ordersRoutes = require('./routes/orders');
const parserRoutes = require('./routes/parser');
const adminRoutes = require('./routes/admin');
const deployRoutes = require('./routes/deploy');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware для обработки FormData
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.use(upload.any());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 1000 // максимум 1000 запросов за окно
});
app.use('/api/', limiter);

// Статические файлы
app.use('/uploads', express.static('uploads'));
app.use('/images', express.static('../frontend/public/images'));

// Проверка здоровья сервера
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/parser', parserRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', deployRoutes);

// 404 обработчик
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// Глобальный обработчик ошибок
app.use(errorHandler);

// Запуск сервера
const startServer = async () => {
  try {
    // Проверяем подключение к БД
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Не удалось подключиться к базе данных. Сервер не запущен.');
      process.exit(1);
    }

    // Синхронизация моделей с БД (в разработке)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('Модели синхронизированы с БД');
    }

    // Запускаем сервер
    app.listen(PORT, () => {
      logger.success(`🚀 Сервер запущен на порту ${PORT}`);
      logger.info(`📍 API доступен по адресу: http://localhost:${PORT}/api`);
      logger.info(`🌍 Окружение: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('Ошибка запуска сервера', { error: error.message });
    process.exit(1);
  }
};

startServer();

module.exports = app;

