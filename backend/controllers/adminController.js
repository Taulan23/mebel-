const { User, Product, Category, Order, OrderItem } = require('../models');
const { Op } = require('sequelize');

// Получить всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'email_verified', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения пользователей' 
    });
  }
};

// Получить пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'email_verified', 'created_at', 'updated_at']
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения пользователя' 
    });
  }
};

// Обновить статус пользователя
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Запрещаем деактивировать самого себя
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Вы не можете деактивировать собственный аккаунт' 
      });
    }

    await user.update({ is_active });

    res.json({ 
      success: true, 
      message: 'Статус пользователя обновлён',
      user: {
        id: user.id,
        email: user.email,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления статуса' 
    });
  }
};

// Обновить роль пользователя
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Валидация роли
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Недопустимая роль' 
      });
    }

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Запрещаем изменять роль самому себе
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Вы не можете изменить собственную роль' 
      });
    }

    await user.update({ role });

    res.json({ 
      success: true, 
      message: 'Роль пользователя обновлена',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Ошибка обновления роли:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления роли' 
    });
  }
};

// Удалить пользователя
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Запрещаем удалять самого себя
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Вы не можете удалить собственный аккаунт' 
      });
    }

    await user.destroy();

    res.json({ 
      success: true, 
      message: 'Пользователь удалён' 
    });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка удаления пользователя' 
    });
  }
};

// Поиск пользователей
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: 'Не указан поисковый запрос' 
      });
    }

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { email: { [Op.like]: `%${query}%` } },
          { first_name: { [Op.like]: `%${query}%` } },
          { last_name: { [Op.like]: `%${query}%` } },
          { phone: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: ['id', 'email', 'first_name', 'last_name', 'phone', 'role', 'is_active', 'email_verified', 'created_at', 'updated_at'],
      order: [['created_at', 'DESC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Ошибка поиска пользователей:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка поиска пользователей' 
    });
  }
};

// ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========

// Получить все товары
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category_id, is_sale, is_featured } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category_id) where.category_id = category_id;
    if (is_sale !== undefined) where.is_sale = is_sale === 'true';
    if (is_featured !== undefined) where.is_featured = is_featured === 'true';

    const products = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        products: products.rows,
        totalItems: products.count,
        totalPages: Math.ceil(products.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения товаров' 
    });
  }
};

// Получить товар по ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }]
    });
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Товар не найден' 
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения товара' 
    });
  }
};

// Создать товар
exports.createProduct = async (req, res) => {
  try {
    console.log('=== CREATE PRODUCT DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    console.log('req.headers:', req.headers);
    console.log('req.body.name:', req.body.name);
    console.log('req.body.price:', req.body.price);
    console.log('req.body.category_id:', req.body.category_id);
    
    const productData = req.body;
    
    // Обработка загруженного изображения
    if (req.file) {
      productData.main_image = `/uploads/${req.file.filename}`;
    }
    
    // Преобразование строковых значений в boolean
    if (productData.is_sale === 'true') productData.is_sale = true;
    if (productData.is_sale === 'false') productData.is_sale = false;
    if (productData.is_featured === 'true') productData.is_featured = true;
    if (productData.is_featured === 'false') productData.is_featured = false;
    if (productData.in_stock === 'true') productData.in_stock = true;
    if (productData.in_stock === 'false') productData.in_stock = false;
    
    // Преобразование числовых значений
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.old_price && productData.old_price !== '') {
      productData.old_price = parseFloat(productData.old_price);
    } else {
      productData.old_price = null;
    }
    if (productData.discount_percent) productData.discount_percent = parseFloat(productData.discount_percent);
    if (productData.stock_quantity) productData.stock_quantity = parseInt(productData.stock_quantity);
    if (productData.category_id) productData.category_id = parseInt(productData.category_id);
    
    // Генерируем slug если не указан
    if (!productData.slug && productData.name) {
      productData.slug = productData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Если slug пустой, используем ID
      if (!productData.slug || productData.slug === '') {
        productData.slug = `product-${Date.now()}`;
      }
    }
    
    // Если slug все еще пустой, создаем его
    if (!productData.slug || productData.slug === '') {
      productData.slug = `product-${Date.now()}`;
    }
    
    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Товар создан',
      data: product
    });
  } catch (error) {
    console.error('Ошибка создания товара:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка создания товара',
      error: error.message
    });
  }
};

// Обновить товар
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Товар не найден' 
      });
    }

    // Обработка загруженного изображения
    if (req.file) {
      productData.main_image = `/uploads/${req.file.filename}`;
    }
    
    // Преобразование строковых значений в boolean
    if (productData.is_sale === 'true') productData.is_sale = true;
    if (productData.is_sale === 'false') productData.is_sale = false;
    if (productData.is_featured === 'true') productData.is_featured = true;
    if (productData.is_featured === 'false') productData.is_featured = false;
    if (productData.in_stock === 'true') productData.in_stock = true;
    if (productData.in_stock === 'false') productData.in_stock = false;
    
    // Преобразование числовых значений
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.old_price && productData.old_price !== '') {
      productData.old_price = parseFloat(productData.old_price);
    } else {
      productData.old_price = null;
    }
    if (productData.discount_percent) productData.discount_percent = parseFloat(productData.discount_percent);
    if (productData.stock_quantity) productData.stock_quantity = parseInt(productData.stock_quantity);
    if (productData.category_id) productData.category_id = parseInt(productData.category_id);

    await product.update(productData);

    res.json({
      success: true,
      message: 'Товар обновлён',
      data: product
    });
  } catch (error) {
    console.error('Ошибка обновления товара:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления товара',
      error: error.message
    });
  }
};

// Удалить товар
exports.deleteProduct = async (req, res) => {
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

    res.json({
      success: true,
      message: 'Товар удалён'
    });
  } catch (error) {
    console.error('Ошибка удаления товара:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка удаления товара' 
    });
  }
};

// ========== УПРАВЛЕНИЕ ЗАКАЗАМИ ==========

// Получить все заказы
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { order_number: { [Op.like]: `%${search}%` } },
        { customer_name: { [Op.like]: `%${search}%` } },
        { customer_phone: { [Op.like]: `%${search}%` } }
      ];
    }

    const orders = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'main_image']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        totalItems: orders.count,
        totalPages: Math.ceil(orders.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения заказов' 
    });
  }
};

// Получить заказ по ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'first_name', 'last_name']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'slug', 'main_image']
            }
          ]
        }
      ]
    });
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Заказ не найден' 
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения заказа' 
    });
  }
};

// Обновить статус заказа
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Заказ не найден' 
      });
    }

    await order.update({ status });

    res.json({
      success: true,
      message: 'Статус заказа обновлён',
      data: order
    });
  } catch (error) {
    console.error('Ошибка обновления статуса заказа:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления статуса заказа' 
    });
  }
};

// ========== УПРАВЛЕНИЕ КАТЕГОРИЯМИ ==========

// Получить все категории
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['sort_order', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка получения категорий' 
    });
  }
};

// Создать категорию
exports.createCategory = async (req, res) => {
  try {
    const categoryData = req.body;
    
    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Категория создана',
      data: category
    });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка создания категории' 
    });
  }
};

// Обновить категорию
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const categoryData = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Категория не найдена' 
      });
    }

    await category.update(categoryData);

    res.json({
      success: true,
      message: 'Категория обновлена',
      data: category
    });
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка обновления категории' 
    });
  }
};

// Удалить категорию
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ 
        success: false, 
        message: 'Категория не найдена' 
      });
    }

    // Проверяем, есть ли товары в этой категории
    const productsCount = await Product.count({ where: { category_id: id } });
    if (productsCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Нельзя удалить категорию, в которой есть товары' 
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: 'Категория удалена'
    });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка удаления категории' 
    });
  }
};

