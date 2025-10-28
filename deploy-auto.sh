#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Начинаем деплой проекта Мебель Москва${NC}"
echo ""

# Переменные
SERVER="84.54.29.55"
USER="root"
PASSWORD="Т3!Ecyпс&JS6"
ARCHIVE="../mebel-deploy-20251023-095847.tar.gz"
REMOTE_TMP="/tmp/mebel-deploy.tar.gz"

# Шаг 1: Загрузка архива
echo -e "${YELLOW}📦 Шаг 1: Загрузка архива на сервер...${NC}"
sshpass -p "$PASSWORD" scp -o StrictHostKeyChecking=no "$ARCHIVE" "$USER@$SERVER:$REMOTE_TMP"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Архив успешно загружен${NC}"
else
    echo -e "${RED}✗ Ошибка загрузки архива${NC}"
    exit 1
fi

# Шаг 2: Подключение и деплой
echo -e "${YELLOW}🔌 Шаг 2: Подключение к серверу и деплой...${NC}"

sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no "$USER@$SERVER" << 'ENDSSH'
set -e

echo "🔍 Поиск папки проекта..."

# Возможные пути к проекту
POSSIBLE_PATHS=(
    "/var/www/html"
    "/var/www/mebel"
    "/home/*/public_html"
    "/opt/mebel"
    "/root/mebel"
)

PROJECT_DIR=""
for path in "${POSSIBLE_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "✓ Найдена папка: $path"
        PROJECT_DIR="$path"
        break
    fi
done

if [ -z "$PROJECT_DIR" ]; then
    echo "⚠️ Папка проекта не найдена. Создаем новую в /var/www/mebel"
    PROJECT_DIR="/var/www/mebel"
    mkdir -p "$PROJECT_DIR"
fi

echo "📂 Используем папку: $PROJECT_DIR"

# Создаем резервную копию
echo "💾 Создание резервной копии..."
if [ -d "$PROJECT_DIR/backend" ]; then
    cd "$PROJECT_DIR/.."
    tar -czf "mebel-backup-$(date +%Y%m%d-%H%M%S).tar.gz" "$(basename $PROJECT_DIR)" 2>/dev/null || echo "⚠️ Не удалось создать резервную копию"
fi

# Распаковываем архив
echo "📦 Распаковка архива..."
cd "$PROJECT_DIR"
tar -xzf /tmp/mebel-deploy.tar.gz

# Удаляем старые node_modules
echo "🗑️ Удаление старых зависимостей..."
rm -rf backend/node_modules frontend/node_modules

# Устанавливаем зависимости backend
echo "📦 Установка зависимостей backend..."
cd backend
npm install --production

# Создаем .env файл если его нет
if [ ! -f .env ]; then
    echo "📝 Создание .env файла..."
    cat > .env << 'EOF'
NODE_ENV=production
PORT=5000

# Database
DB_NAME=mebel_db
DB_USER=root
DB_PASSWORD=CHANGE_THIS
DB_HOST=localhost
DB_PORT=3306

# JWT Secret
JWT_SECRET=your_production_jwt_secret_key_here_change_this

# CORS
CORS_ORIGIN=http://84.54.29.55
EOF
    echo "⚠️ ВАЖНО: Отредактируйте файл backend/.env и укажите пароль от MySQL!"
fi

cd ..

# Собираем frontend
echo "🏗️ Сборка frontend..."
cd frontend
npm install
npm run build

cd ..

# Проверяем PM2
if command -v pm2 &> /dev/null; then
    echo "🚀 Перезапуск backend с PM2..."
    pm2 stop mebel-backend 2>/dev/null || true
    pm2 delete mebel-backend 2>/dev/null || true
    cd backend
    pm2 start server.js --name "mebel-backend"
    pm2 save
    cd ..
else
    echo "⚠️ PM2 не установлен. Установите PM2: npm install -g pm2"
fi

# Проверяем Nginx
if command -v nginx &> /dev/null; then
    echo "🌐 Перезапуск Nginx..."
    systemctl restart nginx 2>/dev/null || service nginx restart 2>/dev/null || echo "⚠️ Не удалось перезапустить Nginx"
fi

echo ""
echo "✅ Деплой завершен!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Отредактируйте файл: $PROJECT_DIR/backend/.env"
echo "2. Настройте базу данных MySQL"
echo "3. Создайте админа: cd $PROJECT_DIR/backend && node createAdmin.js"
echo "4. Проверьте сайт: http://84.54.29.55"
echo ""

ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Деплой успешно завершен!${NC}"
    echo ""
    echo -e "${YELLOW}📝 Не забудьте:${NC}"
    echo "1. Зайти на сервер и настроить .env файл"
    echo "2. Настроить базу данных"
    echo "3. Создать админа"
    echo ""
    echo -e "${GREEN}🌐 Сайт доступен по адресу: http://84.54.29.55${NC}"
else
    echo -e "${RED}✗ Ошибка деплоя${NC}"
    exit 1
fi




