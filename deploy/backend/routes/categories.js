const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authMiddleware } = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const { categoryValidation } = require('../middleware/validate');

// Публичные маршруты
router.get('/', getAllCategories);
router.get('/:slug', getCategoryBySlug);

// Защищенные маршруты (только админ)
router.post('/', authMiddleware, adminCheck, categoryValidation, createCategory);
router.put('/:id', authMiddleware, adminCheck, updateCategory);
router.delete('/:id', authMiddleware, adminCheck, deleteCategory);

module.exports = router;

