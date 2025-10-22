# ТЕХНИЧЕСКОЕ ЗАДАНИЕ
## Интернет-магазин мебели "Мебель 2025"

---

## 1. ОБЩЕЕ ОПИСАНИЕ ПРОЕКТА

### 1.1 Название проекта
**Интернет-магазин мебели "Мебель 2025"**

### 1.2 Цель проекта
Создание полнофункционального интернет-магазина мебели с современным дизайном, системой управления товарами и заказами, парсингом реальных товаров с сайта mebel-moskva.ru.

### 1.3 Целевая аудитория
- Физические лица, желающие приобрести мебель
- Зарегистрированные пользователи для оформления заказов
- Администраторы для управления контентом

---

## 2. ТЕХНОЛОГИЧЕСКИЙ СТЕК

### 2.1 Frontend
- **React 18+** - основной фреймворк
- **JavaScript (ES6+)** - чистый JS без TypeScript
- **CSS3** / **CSS Modules** / **Styled Components** - стилизация
- **Axios** - HTTP-клиент для API запросов
- **React Router** - маршрутизация
- **Redux / Context API** - управление состоянием
- **React Hook Form** - работа с формами

### 2.2 Backend
- **Node.js** (версия 18+)
- **Express.js** - веб-фреймворк
- **MySQL** - база данных
- **Sequelize / mysql2** - ORM для работы с БД
- **JWT** - аутентификация
- **bcrypt** - хеширование паролей
- **Multer** - загрузка файлов
- **Cheerio / Puppeteer** - парсинг сайтов
- **Axios** - HTTP-запросы для парсера

### 2.3 Инфраструктура
- **Docker** (опционально) - контейнеризация
- **Nginx** - веб-сервер для продакшена
- **PM2** - process manager для Node.js

---

## 3. ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ

### 3.1 ПАРСЕР ТОВАРОВ

#### 3.1.1 Источник данных
- **Целевой сайт**: https://mebel-moskva.ru/furniture/all/krovati/
- **Парсить все страницы пагинации**

#### 3.1.2 Данные для парсинга
Для каждого товара необходимо извлекать:
- **Название товара**
- **Основное изображение** (главное фото)
- **Дополнительные изображения** (галерея)
- **Цена** (текущая)
- **Старая цена** (если есть скидка)
- **Артикул/SKU**
- **Описание товара**
- **Характеристики**:
  - Размеры (ширина, высота, глубина)
  - Материал
  - Цвет
  - Спальное место
  - Наличие ящиков для белья
  - Подъёмный механизм
  - Мягкое изголовье
  - Коллекция
  - Стиль
  - Максимальная нагрузка
- **Категория** (кровати, диваны, шкафы и т.д.)
- **Наличие на складе**
- **Ссылка на оригинал**

#### 3.1.3 Обработка изображений
- Скачивание изображений на локальный сервер
- Оптимизация размера изображений
- Создание превью (thumbnails)
- Сохранение в папку `/public/images/products/`
- Формат хранения: `{product_id}/{image_name}.jpg`

#### 3.1.4 Функции парсера
- **Первичный парсинг** - полная загрузка всех товаров
- **Инкрементальное обновление** - обновление цен и наличия
- **Планировщик задач** - автоматический запуск парсера (раз в сутки)
- **Логирование** - запись всех операций парсинга
- **Обработка ошибок** - retry механизм при сбоях

#### 3.1.5 Admin панель для парсера
- Кнопка "Запустить парсинг"
- Отображение прогресса парсинга
- История запусков парсера
- Настройки парсера (интервал обновления, лимиты)

---

### 3.2 ДИЗАЙН ИНТЕРФЕЙСА

#### 3.2.1 Источник дизайна
Дизайн должен быть точной копией сайта **Hoff.ru**:
- Современный минималистичный стиль
- Адаптивный дизайн (desktop, tablet, mobile)
- Цветовая схема: белый, серый, акцентные цвета
- Типографика: современные шрифты (Inter, Roboto, etc.)

#### 3.2.2 Основные компоненты дизайна
- **Header**:
  - Логотип
  - Поиск по товарам
  - Меню категорий
  - Иконки: Избранное, Корзина, Профиль
  - Контактная информация
- **Navigation**:
  - Горизонтальное меню категорий
  - Breadcrumbs (хлебные крошки)
- **Footer**:
  - Информационные ссылки
  - Контакты
  - Соцсети
  - Копирайт

#### 3.2.3 Страницы

##### Главная страница
- Баннер с акциями
- Популярные категории
- Хиты продаж
- Акционные товары
- О компании (краткая информация)
- Преимущества (доставка, гарантия, оплата)

##### Каталог товаров
- Сетка товаров (3-4 колонки)
- Фильтры слева:
  - Цена (ползунок)
  - Категория
  - Материал
  - Цвет
  - Размеры
  - Производитель
  - Наличие
  - Особенности (с ящиком, с мягким изголовьем и т.д.)
- Сортировка:
  - По популярности
  - По цене (возрастанию/убыванию)
  - По новизне
  - По рейтингу
- Пагинация
- Кнопка "Показать еще" (lazy loading)

##### Карточка товара
- Галерея изображений (главное + дополнительные)
- Увеличение фото (zoom)
- Название товара
- Цена (текущая и старая, если есть)
- Артикул
- Наличие
- Рейтинг и отзывы
- Описание товара
- Характеристики (таблица)
- Кнопки:
  - "Добавить в корзину"
  - "Купить в 1 клик"
  - "Добавить в избранное"
- Похожие товары
- Недавно просмотренные товары

##### Корзина
- Список добавленных товаров
- Изменение количества
- Удаление товаров
- Промокод
- Итоговая сумма
- Кнопка "Оформить заказ"

##### Личный кабинет пользователя
- Профиль:
  - Личная информация
  - Изменение пароля
- История заказов
- Избранное
- Выход

##### Оформление заказа (только для зарегистрированных)
- Форма с данными:
  - ФИО
  - Телефон
  - Email
  - Адрес доставки
  - Комментарий к заказу
- Выбор способа доставки
- Выбор способа оплаты
- Подтверждение заказа

##### Страницы информации
- О компании
- Доставка и оплата
- Контакты
- Политика конфиденциальности

---

### 3.3 СИСТЕМА РОЛЕЙ И ПРАВ ДОСТУПА

#### 3.3.1 Роли пользователей

##### **Гость (неавторизованный пользователь)**
- Просмотр каталога товаров
- Просмотр карточек товаров
- Добавление товаров в корзину
- **НЕ МОЖЕТ** оформить заказ

##### **Зарегистрированный пользователь**
- Все права гостя +
- **Оформление заказов**
- Просмотр истории заказов
- Управление профилем
- Добавление в избранное
- Отзывы о товарах

##### **Администратор**
Полный доступ к системе:
- **Управление товарами**:
  - Добавление нового товара
  - Редактирование товара
  - Удаление товара
  - Массовое редактирование
  - Управление изображениями
  - Управление характеристиками
  - Управление категориями
- **Управление пользователями**:
  - Просмотр списка пользователей
  - Редактирование данных пользователя
  - Блокировка/Разблокировка пользователя
  - Удаление пользователя
  - Смена роли пользователя
- **Управление заказами**:
  - Просмотр всех заказов
  - Изменение статуса заказа
  - Удаление заказа
  - Экспорт заказов
- **Управление категориями**:
  - Создание категорий
  - Редактирование категорий
  - Удаление категорий
  - Управление иерархией
- **Парсер**:
  - Запуск парсинга
  - Настройка парсера
  - Просмотр логов
- **Статистика**:
  - Количество пользователей
  - Количество заказов
  - Выручка
  - Популярные товары
  - Графики и аналитика

---

### 3.4 ФУНКЦИОНАЛЬНЫЕ МОДУЛИ

#### 3.4.1 Модуль аутентификации
- Регистрация пользователя:
  - Email
  - Пароль (подтверждение)
  - Имя
  - Телефон
  - Валидация email (уникальность)
  - Валидация пароля (минимум 8 символов)
- Вход в систему:
  - Email + пароль
  - JWT токен
  - Remember me (опционально)
- Восстановление пароля:
  - Отправка кода на email
  - Сброс пароля
- Выход из системы

#### 3.4.2 Модуль каталога
- Отображение товаров с фильтрами
- Поиск по названию/артикулу
- Автодополнение в поиске
- Сортировка товаров
- Пагинация/Бесконечная прокрутка
- Просмотр товаров в виде сетки/списка

#### 3.4.3 Модуль карточки товара
- Отображение полной информации о товаре
- Галерея изображений с зумом
- Выбор вариантов (если есть)
- Добавление в корзину
- Добавление в избранное
- Похожие товары
- Отзывы покупателей

#### 3.4.4 Модуль корзины
- Добавление товаров
- Изменение количества
- Удаление товаров
- Расчет итоговой суммы
- Применение промокодов
- Сохранение корзины для авторизованных пользователей

#### 3.4.5 Модуль заказов
- Оформление заказа (только для авторизованных)
- Выбор адреса доставки
- Выбор способа оплаты
- История заказов
- Отслеживание статуса заказа
- Отмена заказа (если статус позволяет)

#### 3.4.6 Модуль личного кабинета
- Просмотр и редактирование профиля
- История заказов
- Избранные товары
- Изменение пароля
- Адреса доставки

#### 3.4.7 Админ-панель
Отдельный раздел (например, `/admin`) для администраторов:
- **Dashboard**:
  - Статистика продаж
  - Новые заказы
  - Популярные товары
- **Товары**:
  - Таблица всех товаров
  - CRUD операции
  - Массовые операции
  - Управление изображениями
- **Заказы**:
  - Список заказов
  - Фильтрация по статусу
  - Изменение статуса
  - Детальная информация
- **Пользователи**:
  - Список пользователей
  - Редактирование
  - Блокировка/Удаление
- **Категории**:
  - Дерево категорий
  - CRUD операции
- **Парсер**:
  - Управление парсингом
  - Логи

---

## 4. СТРУКТУРА БАЗЫ ДАННЫХ (MySQL)

### 4.1 Таблица: users (Пользователи)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4.2 Таблица: categories (Категории)
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  parent_id INT DEFAULT NULL,
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### 4.3 Таблица: products (Товары)
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  sku VARCHAR(100) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  old_price DECIMAL(10, 2),
  discount_percent INT DEFAULT 0,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_quantity INT DEFAULT 0,
  main_image VARCHAR(500),
  views_count INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  reviews_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT FALSE,
  is_sale BOOLEAN DEFAULT FALSE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  source_url VARCHAR(1000),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);
```

### 4.4 Таблица: product_images (Изображения товаров)
```sql
CREATE TABLE product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_main BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 4.5 Таблица: product_attributes (Характеристики товаров)
```sql
CREATE TABLE product_attributes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  attribute_name VARCHAR(255) NOT NULL,
  attribute_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 4.6 Таблица: orders (Заказы)
```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  final_amount DECIMAL(10, 2) NOT NULL,
  promo_code VARCHAR(50),
  payment_method ENUM('cash', 'card', 'online') DEFAULT 'cash',
  payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
  delivery_method ENUM('pickup', 'delivery', 'courier') DEFAULT 'delivery',
  delivery_address TEXT,
  delivery_date DATE,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  customer_comment TEXT,
  admin_comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.7 Таблица: order_items (Товары в заказе)
```sql
CREATE TABLE order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(500) NOT NULL,
  product_sku VARCHAR(100),
  product_image VARCHAR(500),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 4.8 Таблица: cart (Корзина)
```sql
CREATE TABLE cart (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  session_id VARCHAR(255),
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  UNIQUE KEY unique_session_cart (session_id, product_id)
);
```

### 4.9 Таблица: favorites (Избранное)
```sql
CREATE TABLE favorites (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, product_id)
);
```

### 4.10 Таблица: reviews (Отзывы)
```sql
CREATE TABLE reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 4.11 Таблица: parser_logs (Логи парсера)
```sql
CREATE TABLE parser_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  status ENUM('running', 'completed', 'failed') DEFAULT 'running',
  products_parsed INT DEFAULT 0,
  products_added INT DEFAULT 0,
  products_updated INT DEFAULT 0,
  errors_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.12 Таблица: promo_codes (Промокоды)
```sql
CREATE TABLE promo_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percent', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2),
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 5. API ENDPOINTS

### 5.1 Аутентификация
```
POST   /api/auth/register          - Регистрация пользователя
POST   /api/auth/login             - Вход в систему
POST   /api/auth/logout            - Выход из системы
POST   /api/auth/refresh-token     - Обновление JWT токена
POST   /api/auth/forgot-password   - Восстановление пароля
POST   /api/auth/reset-password    - Сброс пароля
GET    /api/auth/verify-email      - Подтверждение email
```

### 5.2 Пользователи
```
GET    /api/users/profile          - Получить профиль (авторизованный)
PUT    /api/users/profile          - Обновить профиль
PUT    /api/users/change-password  - Изменить пароль
GET    /api/users                  - Список пользователей (admin)
GET    /api/users/:id              - Получить пользователя (admin)
PUT    /api/users/:id              - Обновить пользователя (admin)
DELETE /api/users/:id              - Удалить пользователя (admin)
```

### 5.3 Категории
```
GET    /api/categories             - Все категории
GET    /api/categories/:slug       - Категория по slug
POST   /api/categories             - Создать категорию (admin)
PUT    /api/categories/:id         - Обновить категорию (admin)
DELETE /api/categories/:id         - Удалить категорию (admin)
```

### 5.4 Товары
```
GET    /api/products               - Список товаров (с фильтрами)
GET    /api/products/featured      - Популярные товары
GET    /api/products/sale          - Товары со скидкой
GET    /api/products/:slug         - Товар по slug
GET    /api/products/:id/related   - Похожие товары
POST   /api/products               - Создать товар (admin)
PUT    /api/products/:id           - Обновить товар (admin)
DELETE /api/products/:id           - Удалить товар (admin)
POST   /api/products/:id/images    - Загрузить изображение (admin)
DELETE /api/products/images/:id    - Удалить изображение (admin)
```

### 5.5 Корзина
```
GET    /api/cart                   - Получить корзину
POST   /api/cart                   - Добавить в корзину
PUT    /api/cart/:id               - Обновить количество
DELETE /api/cart/:id               - Удалить из корзины
DELETE /api/cart                   - Очистить корзину
```

### 5.6 Избранное
```
GET    /api/favorites              - Список избранного
POST   /api/favorites              - Добавить в избранное
DELETE /api/favorites/:id          - Удалить из избранного
```

### 5.7 Заказы
```
GET    /api/orders                 - История заказов пользователя
GET    /api/orders/:id             - Детали заказа
POST   /api/orders                 - Создать заказ (только авторизованные)
PUT    /api/orders/:id/cancel      - Отменить заказ

GET    /api/admin/orders           - Все заказы (admin)
PUT    /api/admin/orders/:id       - Обновить статус заказа (admin)
DELETE /api/admin/orders/:id       - Удалить заказ (admin)
```

### 5.8 Отзывы
```
GET    /api/reviews/product/:id    - Отзывы о товаре
POST   /api/reviews                - Добавить отзыв (авторизованный)
PUT    /api/reviews/:id            - Обновить отзыв (автор)
DELETE /api/reviews/:id            - Удалить отзыв (автор/admin)
PUT    /api/admin/reviews/:id/approve - Одобрить отзыв (admin)
```

### 5.9 Поиск
```
GET    /api/search                 - Поиск товаров
GET    /api/search/autocomplete    - Автодополнение
```

### 5.10 Парсер (только admin)
```
POST   /api/parser/start           - Запустить парсинг
GET    /api/parser/status          - Статус парсера
GET    /api/parser/logs            - История парсинга
POST   /api/parser/stop            - Остановить парсинг
```

### 5.11 Статистика (только admin)
```
GET    /api/admin/stats/dashboard  - Общая статистика
GET    /api/admin/stats/sales      - Статистика продаж
GET    /api/admin/stats/users      - Статистика пользователей
GET    /api/admin/stats/products   - Статистика товаров
```

---

## 6. СТРУКТУРА ПРОЕКТА

```
mebel/
├── backend/
│   ├── config/
│   │   ├── database.js           # Конфигурация БД
│   │   ├── auth.js               # JWT конфигурация
│   │   └── parser.js             # Настройки парсера
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── orderController.js
│   │   ├── cartController.js
│   │   ├── reviewController.js
│   │   ├── favoriteController.js
│   │   └── parserController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT проверка
│   │   ├── adminCheck.js         # Проверка роли admin
│   │   ├── errorHandler.js       # Обработка ошибок
│   │   ├── validate.js           # Валидация данных
│   │   └── upload.js             # Загрузка файлов
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Cart.js
│   │   ├── Favorite.js
│   │   ├── Review.js
│   │   ├── ProductImage.js
│   │   ├── ProductAttribute.js
│   │   ├── ParserLog.js
│   │   └── PromoCode.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── cart.js
│   │   ├── favorites.js
│   │   ├── reviews.js
│   │   ├── search.js
│   │   ├── parser.js
│   │   └── admin.js
│   ├── services/
│   │   ├── parserService.js      # Основная логика парсера
│   │   ├── emailService.js       # Отправка email
│   │   ├── imageService.js       # Обработка изображений
│   │   └── schedulerService.js   # Планировщик задач
│   ├── utils/
│   │   ├── validators.js         # Функции валидации
│   │   ├── helpers.js            # Вспомогательные функции
│   │   └── logger.js             # Логирование
│   ├── uploads/                  # Временная папка загрузок
│   ├── .env                      # Переменные окружения
│   ├── server.js                 # Точка входа
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   │   ├── products/         # Изображения товаров
│   │   │   ├── categories/       # Изображения категорий
│   │   │   └── banners/          # Баннеры
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js          # Настройка axios
│   │   │   ├── authAPI.js
│   │   │   ├── productsAPI.js
│   │   │   ├── categoriesAPI.js
│   │   │   ├── ordersAPI.js
│   │   │   ├── cartAPI.js
│   │   │   └── userAPI.js
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   ├── Navbar.js
│   │   │   │   ├── Breadcrumbs.js
│   │   │   │   ├── Loader.js
│   │   │   │   ├── Modal.js
│   │   │   │   ├── Button.js
│   │   │   │   └── Input.js
│   │   │   ├── product/
│   │   │   │   ├── ProductCard.js
│   │   │   │   ├── ProductGrid.js
│   │   │   │   ├── ProductGallery.js
│   │   │   │   ├── ProductFilters.js
│   │   │   │   └── ProductDetails.js
│   │   │   ├── cart/
│   │   │   │   ├── CartItem.js
│   │   │   │   ├── CartSummary.js
│   │   │   │   └── CartIcon.js
│   │   │   ├── order/
│   │   │   │   ├── OrderForm.js
│   │   │   │   ├── OrderItem.js
│   │   │   │   └── OrderList.js
│   │   │   └── admin/
│   │   │       ├── AdminSidebar.js
│   │   │       ├── AdminHeader.js
│   │   │       ├── Dashboard.js
│   │   │       ├── ProductsTable.js
│   │   │       ├── ProductForm.js
│   │   │       ├── OrdersTable.js
│   │   │       ├── UsersTable.js
│   │   │       └── ParserControl.js
│   │   ├── pages/
│   │   │   ├── HomePage.js
│   │   │   ├── CatalogPage.js
│   │   │   ├── ProductPage.js
│   │   │   ├── CartPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   ├── OrderSuccessPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── ProfilePage.js
│   │   │   ├── OrdersHistoryPage.js
│   │   │   ├── FavoritesPage.js
│   │   │   ├── AboutPage.js
│   │   │   ├── ContactsPage.js
│   │   │   ├── NotFoundPage.js
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── AdminProducts.js
│   │   │       ├── AdminOrders.js
│   │   │       ├── AdminUsers.js
│   │   │       ├── AdminCategories.js
│   │   │       └── AdminParser.js
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   ├── CartContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCart.js
│   │   │   └── useDebounce.js
│   │   ├── utils/
│   │   │   ├── formatPrice.js
│   │   │   ├── validators.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │   ├── variables.css
│   │   │   └── reset.css
│   │   ├── App.js
│   │   ├── index.js
│   │   └── routes.js
│   ├── .env
│   └── package.json
│
├── database/
│   ├── schema.sql                # SQL схема БД
│   └── seed.sql                  # Начальные данные
│
├── docker-compose.yml            # Docker конфигурация (опционально)
├── .gitignore
├── README.md
└── TECHNICAL_SPECIFICATION.md    # Этот файл
```

---

## 7. ТРЕБОВАНИЯ К ПАРСИНГУ

### 7.1 Алгоритм работы парсера

#### Этап 1: Сбор ссылок на товары
1. Открыть страницу каталога `https://mebel-moskva.ru/furniture/all/krovati/`
2. Получить общее количество страниц пагинации
3. Пройти по всем страницам и собрать ссылки на карточки товаров
4. Сохранить все ссылки в массив

#### Этап 2: Парсинг данных товара
Для каждой ссылки:
1. Открыть страницу товара
2. Извлечь данные:
   - Название (селектор: h1)
   - Цена (текущая и старая)
   - Артикул
   - Описание
   - Характеристики (таблица)
   - Категория
3. Скачать все изображения товара
4. Сохранить данные в переменные

#### Этап 3: Обработка изображений
1. Скачать изображение по URL
2. Оптимизировать размер (сжатие)
3. Создать thumbnail (превью)
4. Сохранить в папку `/public/images/products/{product_id}/`
5. Сохранить путь к изображению в БД

#### Этап 4: Сохранение в БД
1. Проверить существование товара по артикулу/URL
2. Если товар существует:
   - Обновить цену
   - Обновить наличие
   - Обновить описание (если изменилось)
3. Если товар новый:
   - Создать запись в таблице `products`
   - Создать записи в таблице `product_images`
   - Создать записи в таблице `product_attributes`
4. Логировать результат

#### Этап 5: Завершение
1. Подсчитать статистику:
   - Всего обработано товаров
   - Добавлено новых
   - Обновлено существующих
   - Ошибок
2. Сохранить лог в таблицу `parser_logs`
3. Отправить уведомление администратору

### 7.2 Обработка ошибок
- **Недоступность сайта**: Повторить попытку через 5 минут (max 3 попытки)
- **404 ошибка**: Пропустить товар, записать в лог
- **Ошибка скачивания изображения**: Записать в лог, продолжить
- **Дублирование товара**: Обновить существующий
- **Ошибка БД**: Записать в лог, остановить парсинг

### 7.3 Производительность
- Использовать многопоточность (если возможно)
- Лимит запросов: не более 5 одновременных запросов
- Пауза между запросами: 500-1000ms (чтобы не перегружать сайт)
- Таймаут запроса: 30 секунд

### 7.4 Расписание автоматического парсинга
- **Ежедневно в 03:00** (ночью, когда меньше нагрузка)
- Опция включения/выключения автопарсинга в админке
- Возможность ручного запуска

---

## 8. ДОПОЛНИТЕЛЬНЫЕ ТРЕБОВАНИЯ

### 8.1 Безопасность
- **JWT токены** для аутентификации
- **Хеширование паролей** с использованием bcrypt (минимум 10 rounds)
- **Валидация всех входных данных** на backend
- **Защита от SQL инъекций** (использование prepared statements)
- **Защита от XSS** (экранирование HTML)
- **CORS настройка** (разрешить только свои домены)
- **Rate limiting** (ограничение запросов)
- **HTTPS** (для продакшена)

### 8.2 Валидация
- Email: валидный формат
- Пароль: минимум 8 символов, буквы и цифры
- Телефон: формат +7 (XXX) XXX-XX-XX
- Цена: положительное число
- Количество: целое положительное число

### 8.3 Адаптивность
- **Desktop**: 1920px, 1440px, 1280px
- **Tablet**: 1024px, 768px
- **Mobile**: 480px, 375px, 320px

### 8.4 Производительность
- Время загрузки главной страницы < 2 секунд
- Lazy loading для изображений
- Минификация CSS/JS
- Сжатие изображений (WebP формат предпочтительно)
- Кеширование на backend (Redis опционально)

### 8.5 SEO
- Мета-теги для всех страниц
- ЧПУ (человеко-понятные URL)
- Sitemap.xml
- Robots.txt
- Open Graph для соцсетей
- Микроразметка Schema.org

### 8.6 Кроссбраузерность
- Chrome (последние 2 версии)
- Firefox (последние 2 версии)
- Safari (последние 2 версии)
- Edge (последние 2 версии)

---

## 9. ЭТАПЫ РАЗРАБОТКИ

### Этап 1: Инициализация проекта (1-2 дня)
- Создание структуры проекта
- Настройка backend (Node.js + Express)
- Настройка frontend (React)
- Настройка базы данных MySQL
- Создание схемы БД

### Этап 2: Backend API (5-7 дней)
- Модели базы данных (Sequelize)
- Аутентификация (JWT)
- CRUD для товаров
- CRUD для категорий
- CRUD для пользователей
- CRUD для заказов
- Корзина API
- Избранное API
- Отзывы API
- Поиск

### Этап 3: Парсер (3-4 дня)
- Создание парсера товаров
- Скачивание изображений
- Обработка изображений
- Сохранение в БД
- Планировщик задач
- Логирование
- Админ-панель для парсера

### Этап 4: Frontend - Публичная часть (7-10 дней)
- Главная страница
- Каталог товаров
- Фильтры и сортировка
- Карточка товара
- Корзина
- Оформление заказа
- Регистрация/Вход
- Личный кабинет
- История заказов
- Избранное

### Этап 5: Frontend - Админ-панель (5-7 дней)
- Dashboard
- Управление товарами
- Управление категориями
- Управление заказами
- Управление пользователями
- Управление парсером
- Статистика

### Этап 6: Дизайн и стилизация (5-7 дней)
- Адаптация дизайна Hoff.ru
- Адаптивная верстка
- Анимации и переходы
- Оптимизация UI/UX

### Этап 7: Тестирование и отладка (3-5 дней)
- Тестирование функционала
- Исправление багов
- Оптимизация производительности
- Кроссбраузерное тестирование

### Этап 8: Деплой и запуск (2-3 дня)
- Настройка сервера
- Развертывание backend
- Развертывание frontend
- Настройка БД на сервере
- Первичный запуск парсера
- Финальные тесты

**Общий срок разработки: 4-6 недель**

---

## 10. ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ (Опционально, если будет время)

### 10.1 Расширенный функционал
- **Сравнение товаров** - добавление до 4 товаров для сравнения
- **Онлайн-консультант** - чат с менеджером
- **Уведомления** - email/SMS уведомления о статусе заказа
- **Программа лояльности** - бонусы и скидки
- **Блог** - статьи о мебели
- **Калькулятор рассрочки** - расчет ежемесячного платежа
- **3D просмотр** - 3D модели товаров (если доступно)
- **Конструктор комнат** - планировщик интерьера
- **Мультиязычность** - поддержка нескольких языков
- **Мультивалютность** - поддержка нескольких валют

### 10.2 Интеграции
- **Оплата**: Stripe, PayPal, ЮKassa
- **Доставка**: СДЭК, Boxberry, Почта России
- **Аналитика**: Google Analytics, Yandex Metrica
- **CRM**: интеграция с AmoCRM, Bitrix24
- **Соцсети**: авторизация через Google, Facebook, VK

---

## 11. КРИТЕРИИ ПРИЕМКИ

### 11.1 Функциональность
- ✅ Парсер успешно загружает товары с сайта-донора
- ✅ Все изображения корректно скачиваются и отображаются
- ✅ Регистрация и авторизация работают корректно
- ✅ Гости не могут оформить заказ (показывается форма регистрации)
- ✅ Зарегистрированные пользователи могут оформить заказ
- ✅ Корзина работает корректно (добавление, изменение, удаление)
- ✅ Фильтры и сортировка работают правильно
- ✅ Поиск находит товары по названию и артикулу
- ✅ Админ может создавать, редактировать, удалять товары
- ✅ Админ может управлять пользователями
- ✅ Админ может управлять заказами
- ✅ Админ может запустить парсинг вручную

### 11.2 Дизайн
- ✅ Дизайн соответствует современным стандартам
- ✅ Дизайн адаптирован для всех устройств
- ✅ Интерфейс интуитивно понятен
- ✅ Все элементы работают корректно

### 11.3 Производительность
- ✅ Страницы загружаются быстро
- ✅ Изображения оптимизированы
- ✅ Нет видимых задержек при взаимодействии

### 11.4 Безопасность
- ✅ Пароли хешируются
- ✅ JWT токены работают корректно
- ✅ Защита от основных уязвимостей

### 11.5 Код
- ✅ Код читаемый и структурированный
- ✅ Используются компоненты React
- ✅ Backend API следует RESTful стандартам
- ✅ Нет критических багов

---

## 12. ЗАКЛЮЧЕНИЕ

Данное техническое задание описывает полнофункциональный интернет-магазин мебели с парсером товаров, современным дизайном и полной системой управления.

**Основные особенности проекта:**
1. **Парсинг реальных товаров** с изображениями с сайта mebel-moskva.ru
2. **Современный дизайн** по образцу Hoff.ru
3. **Система ролей**: гость, пользователь, администратор
4. **Ограничение для гостей**: только зарегистрированные пользователи могут оформлять заказы
5. **Полная админ-панель** для управления всем контентом
6. **Автоматизация**: планировщик для автоматического обновления товаров

**Технологии:**
- Frontend: React + JavaScript
- Backend: Node.js + Express
- База данных: MySQL
- Парсинг: Cheerio/Puppeteer

Проект готов к реализации! 🚀

