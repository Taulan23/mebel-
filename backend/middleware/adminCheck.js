// Middleware для проверки роли администратора
const adminCheck = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Доступ запрещен. Требуется аутентификация.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Доступ запрещен. Требуются права администратора.' 
    });
  }

  next();
};

// Алиас для совместимости
const checkAdmin = adminCheck;

module.exports = adminCheck;
module.exports.checkAdmin = checkAdmin;

