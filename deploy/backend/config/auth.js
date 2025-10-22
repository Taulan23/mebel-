require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  bcryptRounds: 10
};

