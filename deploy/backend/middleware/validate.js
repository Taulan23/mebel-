const { body, param, query, validationResult } = require('express-validator');

// Middleware для проверки результатов валидации
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Ошибка валидации',
      errors: errors.array()
    });
  }
  next();
};

// Правила валидации для регистрации
const registerValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 8 }).withMessage('Пароль должен быть минимум 8 символов'),
  body('first_name').notEmpty().withMessage('Имя обязательно'),
  body('phone').optional().matches(/^\+?[0-9\s\-\(\)]+$/).withMessage('Некорректный номер телефона'),
  validate
];

// Правила валидации для входа
const loginValidation = [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен'),
  validate
];

// Правила валидации для создания товара
const productValidation = [
  body('name').notEmpty().withMessage('Название товара обязательно'),
  body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительным числом'),
  body('category_id').optional().isInt().withMessage('ID категории должен быть числом'),
  body('description').optional().isString(),
  validate
];

// Правила валидации для создания категории
const categoryValidation = [
  body('name').notEmpty().withMessage('Название категории обязательно'),
  body('slug').notEmpty().withMessage('Slug обязателен').matches(/^[a-z0-9-]+$/).withMessage('Slug должен содержать только буквы, цифры и дефисы'),
  body('parent_id').optional().isInt().withMessage('ID родительской категории должен быть числом'),
  validate
];

// Правила валидации для создания заказа
const orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('Заказ должен содержать минимум 1 товар'),
  body('customer_name').notEmpty().withMessage('Имя покупателя обязательно'),
  body('customer_phone').notEmpty().withMessage('Телефон обязателен').matches(/^\+?[0-9\s\-\(\)]+$/).withMessage('Некорректный номер телефона'),
  body('customer_email').optional().isEmail().withMessage('Некорректный email'),
  body('delivery_address').optional().isString(),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  productValidation,
  categoryValidation,
  orderValidation
};

