const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ParserLog = sequelize.define('ParserLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  start_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('running', 'completed', 'failed'),
    defaultValue: 'running'
  },
  products_parsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  products_added: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  products_updated: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  errors_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'parser_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ParserLog;

