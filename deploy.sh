#!/bin/bash

echo "🚀 Начинаем деплой приложения..."

# Создаем папку для деплоя
mkdir -p deploy

# Копируем backend файлы
echo "📁 Копируем backend файлы..."
cp -r backend deploy/
cp package-production.json deploy/package.json

# Копируем frontend build
echo "📁 Копируем frontend build..."
cp -r frontend/build deploy/backend/

# Копируем production конфигурацию
echo "📁 Копируем production конфигурацию..."
cp backend/env.production deploy/backend/.env
cp backend/server-production.js deploy/backend/server.js

# Создаем .htaccess для Apache
echo "📁 Создаем .htaccess..."
cat > deploy/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /backend/server.js [QSA,L]
EOF

# Создаем README для деплоя
echo "📁 Создаем README для деплоя..."
cat > deploy/README.md << 'EOF'
# Mebel Production Deployment

## Установка

1. Загрузите все файлы на сервер
2. Установите Node.js (версия 16+)
3. Установите зависимости: `npm install`
4. Настройте базу данных MySQL
5. Запустите сервер: `npm start`

## Структура

- backend/ - серверная часть
- frontend/build/ - собранный фронтенд
- package.json - зависимости Node.js
- .htaccess - конфигурация Apache

## Переменные окружения

Создайте файл backend/.env с настройками базы данных.
EOF

echo "✅ Деплой готов! Папка deploy/ содержит все необходимые файлы."
echo "📤 Загрузите содержимое папки deploy/ на ваш сервер."
