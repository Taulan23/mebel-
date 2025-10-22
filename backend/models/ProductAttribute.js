const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductAttribute = sequelize.define('ProductAttribute', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  attribute_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  attribute_value: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'product_attributes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['product_id'] },
    { fields: ['attribute_name'] }
  ]
});

module.exports = ProductAttribute;

