// Простой upload middleware для production (без multer)
const fs = require('fs').promises;
const path = require('path');

const simpleUpload = (fieldName) => {
  return (req, res, next) => {
    // Если нет файла, просто продолжаем
    if (!req.files || !req.files[fieldName]) {
      return next();
    }

    // В production можем просто пропустить загрузку файла
    // или сохранить base64 из formData
    next();
  };
};

// Заглушка для single
const single = (fieldName) => {
  return (req, res, next) => {
    // Просто продолжаем без обработки файла
    next();
  };
};

module.exports = {
  single
};

