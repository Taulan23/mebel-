const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  old_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discount_percent: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  in_stock: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  stock_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  main_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  views_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  reviews_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_new: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_sale: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  meta_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  meta_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  source_url: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  delivery_direction: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['slug'] },
    { fields: ['sku'] },
    { fields: ['category_id'] },
    { fields: ['price'] },
    { fields: ['is_featured'] },
    { fields: ['is_sale'] }
  ]
});

module.exports = Product;

