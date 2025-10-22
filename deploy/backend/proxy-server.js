const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 80;

// Статические файлы фронтенда
app.use(express.static(path.join(__dirname, '../public_html')));

// Прокси для API запросов
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error' });
  }
}));

// Все остальные запросы отправляем на фронтенд
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public_html', 'index.html'));
});

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Proxy server запущен на порту ${PORT}`);
  console.log(`🌐 Домен: 53089.tw1.ru`);
  console.log(`📡 Проксирует API на localhost:3001`);
});

// Обработка ошибок
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  process.exit(1);
});
