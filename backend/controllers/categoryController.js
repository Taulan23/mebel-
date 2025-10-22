const { Category, Product } = require('../models');
const { generateSlug } = require('../utils/helpers');
const logger = require('../utils/logger');

// Получить все категории
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['sort_order', 'ASC']],
      include: [{
        model: Category,
        as: 'children',
        where: { is_active: true },
        required: false
      }]
    });

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    logger.error('Ошибка получения категорий', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения категорий',
      error: error.message
    });
  }
};

// Получить категорию по slug
const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug, is_active: true },
      include: [
        {
          model: Category,
          as: 'children',
          where: { is_active: true },
          required: false
        },
        {
          model: Product,
          as: 'products',
          limit: 10
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    logger.error('Ошибка получения категории', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения категории',
      error: error.message
    });
  }
};

// Создать категорию (только админ)
const createCategory = async (req, res) => {
  try {
    const { name, parent_id, description, image_url, sort_order } = req.body;
    const slug = req.body.slug || generateSlug(name);

    const category = await Category.create({
      name,
      slug,
      parent_id,
      description,
      image_url,
      sort_order: sort_order || 0
    });

    logger.success('Категория создана', { category_id: category.id, name });

    res.status(201).json({
      success: true,
      message: 'Категория успешно создана',
      data: category
    });
  } catch (error) {
    logger.error('Ошибка создания категории', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка создания категории',
      error: error.message
    });
  }
};

// Обновить категорию (только админ)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    await category.update(updates);

    logger.success('Категория обновлена', { category_id: id });

    res.status(200).json({
      success: true,
      message: 'Категория успешно обновлена',
      data: category
    });
  } catch (error) {
    logger.error('Ошибка обновления категории', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления категории',
      error: error.message
    });
  }
};

// Удалить категорию (только админ)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    await category.destroy();

    logger.success('Категория удалена', { category_id: id });

    res.status(200).json({
      success: true,
      message: 'Категория успешно удалена'
    });
  } catch (error) {
    logger.error('Ошибка удаления категории', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления категории',
      error: error.message
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};

