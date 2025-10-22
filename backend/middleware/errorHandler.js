// Глобальный обработчик ошибок
const errorHandler = (err, req, res, next) => {
  console.error('❌ Ошибка:', err);

  // Ошибка валидации Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации данных',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Ошибка уникальности
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Запись с такими данными уже существует',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Ошибка внешнего ключа
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Ошибка связи данных'
    });
  }

  // Ошибка подключения к БД
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Ошибка подключения к базе данных'
    });
  }

  // Общая ошибка
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;

