const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');
const logger = require('./utils/logger');

// Загружаем переменные окружения
require('dotenv').config({ path: './env.production' });

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://mebel2025.ru',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware для обработки FormData
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.use(upload.any());

// Статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../frontend/build')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

// Serve React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Внутренняя ошибка сервера' 
  });
});

const startServer = async () => {
  try {
    // Подключение к базе данных
    await sequelize.authenticate();
    logger.info('Подключение к БД установлено');

    // Синхронизация моделей с БД
    if (process.env.NODE_ENV === 'production') {
      await sequelize.sync({ alter: false });
      logger.info('Модели синхронизированы с БД (production)');
    }

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Сервер запущен на порту ${PORT}`);
      logger.info(`Окружение: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
};

startServer();