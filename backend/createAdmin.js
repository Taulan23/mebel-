const bcrypt = require('bcryptjs');
const { User } = require('./models');
const { sequelize } = require('./config/database');

async function createAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД');

    // Удаляем старого админа если есть
    await User.destroy({ where: { email: 'admin@mebel.ru' } });

    // Создаем нового админа
    const admin = await User.create({
      email: 'admin@mebel.ru',
      password_hash: 'admin123', // будет автоматически захеширован
      first_name: 'Админ',
      last_name: 'Администратов',
      phone: '+7 (900) 123-45-67',
      role: 'admin',
      is_active: true,
      email_verified: true
    });

    console.log('✅ Администратор создан успешно!');
    console.log('Email: admin@mebel.ru');
    console.log('Пароль: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

createAdmin();

