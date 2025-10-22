const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  order_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  final_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  promo_code: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  payment_method: {
    type: DataTypes.ENUM('cash', 'card', 'online'),
    defaultValue: 'cash'
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'paid', 'failed'),
    defaultValue: 'pending'
  },
  delivery_method: {
    type: DataTypes.ENUM('pickup', 'delivery', 'courier'),
    defaultValue: 'delivery'
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  delivery_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  customer_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  customer_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  customer_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  customer_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  admin_comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_number'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Order;

