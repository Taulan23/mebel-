const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromoCode = sequelize.define('PromoCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  discount_type: {
    type: DataTypes.ENUM('percent', 'fixed'),
    allowNull: false
  },
  discount_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  min_order_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  max_discount_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: true
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usage_limit: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'promo_codes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['code'] },
    { fields: ['is_active'] }
  ]
});

module.exports = PromoCode;

