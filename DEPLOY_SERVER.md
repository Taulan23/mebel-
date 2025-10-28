# 🚀 Инструкция по деплою на сервер 84.54.29.55

## 📦 Подготовка

Архив для деплоя создан: `mebel-deploy-20251023-095847.tar.gz` (5.8 MB)
Расположение: `/Users/shadownight/Desktop/mebel-deploy-20251023-095847.tar.gz`

## 🔑 Данные для подключения

- **Сервер**: `84.54.29.55`
- **Пользователь**: `root`
- **Пароль**: `Т3!Ecyпс&JS6`

## 📝 Шаг 1: Загрузка архива на сервер

Откройте терминал на вашем компьютере и выполните:

```bash
scp /Users/shadownight/Desktop/mebel-deploy-20251023-095847.tar.gz root@84.54.29.55:/tmp/
```

Введите пароль: `Т3!Ecyпс&JS6`

## 🔌 Шаг 2: Подключение к серверу

```bash
ssh root@84.54.29.55
```

Введите пароль: `Т3!Ecyпс&JS6`

## 📂 Шаг 3: Найдите папку проекта

```bash
# Поиск папки проекта
ls -la /home/
ls -la /var/www/
ls -la /opt/
ls -la /root/

# Обычно проект находится в одной из этих папок:
# /var/www/html/
# /home/username/public_html/
# /opt/mebel/
```

## 📥 Шаг 4: Создайте резервную копию (важно!)

```bash
# Замените /path/to/project на реальный путь к проекту
cd /path/to/project/
tar -czf ../mebel-backup-$(date +%Y%m%d-%H%M%S).tar.gz .
```

## 📦 Шаг 5: Распакуйте новый архив

```bash
# Перейдите в папку проекта
cd /path/to/project/

# Распакуйте архив
tar -xzf /tmp/mebel-deploy-20251023-095847.tar.gz

# Удалите старые node_modules
rm -rf backend/node_modules frontend/node_modules
```

## 📦 Шаг 6: Установите зависимости

```bash
# Backend зависимости
cd backend
npm install
cd ..

# Frontend - собираем production build
cd frontend
npm install
npm run build
cd ..
```

## 🗄️ Шаг 7: Настройка базы данных

### Создайте .env файл для backend

```bash
cd backend
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000

# Database
DB_NAME=mebel_db
DB_USER=root
DB_PASSWORD=ВАШ_ПАРОЛЬ_MYSQL
DB_HOST=localhost
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_production_jwt_secret_key_here_change_this

# CORS
CORS_ORIGIN=http://84.54.29.55

# Upload settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
EOF
```

### Импортируйте схему базы данных

```bash
# Войдите в MySQL
mysql -u root -p

# Создайте базу данных
CREATE DATABASE IF NOT EXISTS mebel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mebel_db;

# Импортируйте схему (если есть файл schema.sql)
source /path/to/project/database/schema.sql;

# Выйдите из MySQL
EXIT;
```

### Создайте админа

```bash
cd /path/to/project/backend
node createAdmin.js
```

## 🚀 Шаг 8: Запуск сервера

### Вариант 1: С помощью PM2 (рекомендуется)

```bash
# Установите PM2 глобально (если не установлен)
npm install -g pm2

# Остановите старые процессы
pm2 stop all
pm2 delete all

# Запустите backend
cd /path/to/project/backend
pm2 start server.js --name "mebel-backend"

# Сохраните конфигурацию PM2
pm2 save
pm2 startup
```

### Вариант 2: С помощью systemd

Создайте файл `/etc/systemd/system/mebel.service`:

```bash
sudo nano /etc/systemd/system/mebel.service
```

Содержимое файла:

```ini
[Unit]
Description=Mebel Backend Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/project/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Запустите сервис:

```bash
sudo systemctl daemon-reload
sudo systemctl enable mebel
sudo systemctl start mebel
sudo systemctl status mebel
```

## 🌐 Шаг 9: Настройка Nginx

Создайте конфигурацию Nginx:

```bash
sudo nano /etc/nginx/sites-available/mebel
```

Содержимое:

```nginx
server {
    listen 80;
    server_name 84.54.29.55;

    # Frontend (статические файлы)
    location / {
        root /path/to/project/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Статические изображения
    location /images {
        root /path/to/project/frontend/public;
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/mebel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## ✅ Шаг 10: Проверка

1. Откройте браузер: `http://84.54.29.55`
2. Проверьте главную страницу
3. Проверьте каталог товаров
4. Войдите в админку: `http://84.54.29.55/admin`
   - Email: `admin@mebel.ru`
   - Пароль: `admin123`

## 🔍 Логи и отладка

### Просмотр логов PM2

```bash
pm2 logs mebel-backend
pm2 status
```

### Просмотр логов systemd

```bash
sudo journalctl -u mebel -f
```

### Просмотр логов Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🔧 Полезные команды

### Перезапуск сервисов

```bash
# PM2
pm2 restart mebel-backend

# Systemd
sudo systemctl restart mebel

# Nginx
sudo systemctl restart nginx
```

### Обновление проекта

```bash
cd /path/to/project
git pull origin main
cd backend && npm install && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart mebel-backend
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи
2. Убедитесь, что все порты открыты (80, 5000, 3306)
3. Проверьте права доступа к файлам
4. Убедитесь, что MySQL запущен: `sudo systemctl status mysql`

---

**Важно**: Замените `/path/to/project` на реальный путь к проекту на сервере!

