const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

// Создаем папку для логов, если она не существует
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Форматирование даты и времени
const formatDate = () => {
  const now = new Date();
  return now.toISOString();
};

// Запись в файл лога
const writeLog = (level, message, data = null) => {
  const timestamp = formatDate();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };

  const logString = JSON.stringify(logEntry) + '\n';
  
  // Имя файла с текущей датой
  const fileName = `${new Date().toISOString().split('T')[0]}.log`;
  const filePath = path.join(logsDir, fileName);

  // Записываем в файл
  fs.appendFileSync(filePath, logString);

  // Выводим в консоль (для разработки)
  if (process.env.NODE_ENV === 'development') {
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      SUCCESS: '\x1b[32m'  // Green
    };
    const reset = '\x1b[0m';
    const color = colors[level] || reset;
    
    console.log(`${color}[${level}] ${timestamp}${reset}:`, message, data || '');
  }
};

const logger = {
  info: (message, data) => writeLog('INFO', message, data),
  error: (message, data) => writeLog('ERROR', message, data),
  warn: (message, data) => writeLog('WARN', message, data),
  success: (message, data) => writeLog('SUCCESS', message, data)
};

module.exports = logger;

