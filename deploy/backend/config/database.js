const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mebel_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4'
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: false
    }
  }
);

// Проверка подключения
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключение к MySQL успешно установлено');
    return true;
  } catch (error) {
    console.error('❌ Не удалось подключиться к базе данных:', error.message);
    return false;
  }
};

module.exports = { sequelize, testConnection };

