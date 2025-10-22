const { Product, ProductImage, ProductAttribute, Category, Review, User } = require('../models');
const { Op } = require('sequelize');
const { getPagination, getPagingData, generateSlug } = require('../utils/helpers');
const logger = require('../utils/logger');

// Получить все товары с фильтрами и пагинацией
const getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      size = 20, 
      category, 
      min_price, 
      max_price, 
      search, 
      is_featured, 
      is_sale, 
      sort = 'created_at', 
      order = 'DESC' 
    } = req.query;

    const { limit, offset } = getPagination(page, size);

    // Формируем условия поиска
    let where = {};
    
    if (category) {
      // Если category - это slug, находим ID категории
      if (isNaN(category)) {
        const cat = await Category.findOne({ where: { slug: category } });
        if (cat) {
          where.category_id = cat.id;
        }
      } else {
        where.category_id = category;
      }
    }
    
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } }
      ];
    }
    
    if (is_featured !== undefined) {
      where.is_featured = is_featured === 'true';
    }
    
    if (is_sale !== undefined) {
      where.is_sale = is_sale === 'true';
    }

    // Получаем товары
    const data = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sort, order]],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          limit: 1,
          where: { is_main: true },
          required: false
        }
      ],
      distinct: true
    });

    const response = getPagingData(data, page, limit);

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    logger.error('Ошибка получения товаров', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения товаров',
      error: error.message
    });
  }
};

// Получить товар по slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          order: [['sort_order', 'ASC']]
        },
        {
          model: ProductAttribute,
          as: 'attributes'
        },
        {
          model: Review,
          as: 'reviews',
          where: { is_approved: true },
          required: false,
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          }]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Увеличиваем счетчик просмотров
    await product.increment('views_count');

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Ошибка получения товара', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения товара',
      error: error.message
    });
  }
};

// Создать товар (только админ)
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      category_id, 
      description, 
      price, 
      old_price, 
      sku, 
      in_stock, 
      stock_quantity,
      is_featured,
      is_new,
      is_sale,
      delivery_direction
    } = req.body;

    // Генерируем slug
    const slug = generateSlug(name) + '-' + Date.now();

    // Обработка загруженного файла
    let main_image = null;
    if (req.file) {
      main_image = `/uploads/${req.file.filename}`;
    }

    // Создаем товар
    const product = await Product.create({
      name,
      slug,
      category_id: category_id || null,
      description: description || null,
      price,
      old_price: old_price || null,
      sku: sku || null,
      main_image,
      in_stock: in_stock !== undefined ? in_stock : true,
      stock_quantity: stock_quantity || 0,
      is_featured: is_featured || false,
      is_new: is_new !== undefined ? is_new : true,
      is_sale: is_sale || false,
      delivery_direction: delivery_direction || null,
      discount_percent: old_price ? Math.round(((old_price - price) / old_price) * 100) : 0
    });

    logger.success('Товар создан', { product_id: product.id, name });

    res.status(201).json({
      success: true,
      message: 'Товар успешно создан',
      data: product
    });
  } catch (error) {
    logger.error('Ошибка создания товара', { error: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Ошибка создания товара',
      error: error.message,
      details: error.errors ? error.errors.map(e => e.message) : []
    });
  }
};

// Обновить товар (только админ)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    // Если изменилось название, обновляем slug
    if (updates.name && updates.name !== product.name) {
      updates.slug = generateSlug(updates.name) + '-' + Date.now();
    }

    // Обработка загруженного файла
    if (req.file) {
      updates.main_image = `/uploads/${req.file.filename}`;
    }

    // Если изменилась цена, пересчитываем скидку
    if (updates.price || updates.old_price) {
      const newPrice = updates.price || product.price;
      const newOldPrice = updates.old_price || product.old_price;
      if (newOldPrice) {
        updates.discount_percent = Math.round(((newOldPrice - newPrice) / newOldPrice) * 100);
      }
    }

    await product.update(updates);

    logger.success('Товар обновлен', { product_id: id });

    res.status(200).json({
      success: true,
      message: 'Товар успешно обновлен',
      data: product
    });
  } catch (error) {
    logger.error('Ошибка обновления товара', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления товара',
      error: error.message
    });
  }
};

// Удалить товар (только админ)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Товар не найден'
      });
    }

    await product.destroy();

    logger.success('Товар удален', { product_id: id });

    res.status(200).json({
      success: true,
      message: 'Товар успешно удален'
    });
  } catch (error) {
    logger.error('Ошибка удаления товара', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления товара',
      error: error.message
    });
  }
};

// Получить популярные товары
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.findAll({
      where: { is_featured: true },
      limit: parseInt(limit),
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          limit: 1,
          where: { is_main: true },
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    logger.error('Ошибка получения популярных товаров', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения популярных товаров',
      error: error.message
    });
  }
};

// Получить товары со скидкой
const getSaleProducts = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const products = await Product.findAll({
      where: { is_sale: true },
      limit: parseInt(limit),
      order: [['discount_percent', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: ProductImage,
          as: 'images',
          limit: 1,
          where: { is_main: true },
          required: false
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    logger.error('Ошибка получения товаров со скидкой', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения товаров со скидкой',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSaleProducts
};

