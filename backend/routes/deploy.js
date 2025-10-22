const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();

// Роут для загрузки и деплоя файлов
router.post('/deploy', async (req, res) => {
  try {
    const { file, filename, action } = req.body;
    
    if (!file || !filename) {
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }

    // Декодируем base64 файл
    const fileBuffer = Buffer.from(file, 'base64');
    
    // Сохраняем файл во временную папку
    const tempPath = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    
    const filePath = path.join(tempPath, filename);
    fs.writeFileSync(filePath, fileBuffer);
    
    console.log(`Файл сохранен: ${filePath}`);
    
    // Распаковываем архив
    const extractPath = path.join(__dirname, '../../deployed');
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }
    
    // Команда для распаковки
    const extractCommand = `tar -xzf "${filePath}" -C "${extractPath}"`;
    
    exec(extractCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('Ошибка распаковки:', error);
        return res.status(500).json({ error: 'Ошибка распаковки архива' });
      }
      
      console.log('Архив успешно распакован');
      
      // Копируем файлы в нужные места
      const copyCommand = `cp -r "${extractPath}/frontend/build"/* /var/www/html/ && cp -r "${extractPath}/backend"/* /var/www/mebel-backend/`;
      
      exec(copyCommand, (copyError, copyStdout, copyStderr) => {
        if (copyError) {
          console.error('Ошибка копирования:', copyError);
          return res.status(500).json({ error: 'Ошибка копирования файлов' });
        }
        
        console.log('Файлы успешно скопированы');
        
        // Перезапускаем сервисы
        const restartCommand = 'systemctl restart nginx && pm2 restart all';
        
        exec(restartCommand, (restartError, restartStdout, restartStderr) => {
          if (restartError) {
            console.error('Ошибка перезапуска:', restartError);
            return res.status(500).json({ error: 'Ошибка перезапуска сервисов' });
          }
          
          console.log('Сервисы успешно перезапущены');
          
          // Удаляем временные файлы
          fs.unlinkSync(filePath);
          exec(`rm -rf "${extractPath}"`);
          
          res.json({ 
            success: true, 
            message: 'Деплой завершен успешно!',
            timestamp: new Date().toISOString()
          });
        });
      });
    });
    
  } catch (error) {
    console.error('Ошибка деплоя:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Роут для проверки статуса деплоя
router.get('/status', (req, res) => {
  res.json({ 
    status: 'ready',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
