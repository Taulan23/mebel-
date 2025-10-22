const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// API маршруты
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Сервер работает!',
        timestamp: new Date().toISOString()
    });
});

// Товары
app.get('/api/products', (req, res) => {
    const products = [
        { 
            id: 1, 
            name: 'Кухня "Модерн"', 
            price: 150000, 
            old_price: 180000,
            image: '/uploads/kitchen1.jpg',
            category_id: 1,
            is_featured: true,
            is_sale: true,
            description: 'Современная кухня в стиле модерн'
        },
        { 
            id: 2, 
            name: 'Спальня "Классик"', 
            price: 200000, 
            old_price: null,
            image: '/uploads/bedroom1.jpg',
            category_id: 2,
            is_featured: true,
            is_sale: false,
            description: 'Элегантная спальня в классическом стиле'
        },
        { 
            id: 3, 
            name: 'Гостиная "Минимализм"', 
            price: 180000, 
            old_price: 220000,
            image: '/uploads/living1.jpg',
            category_id: 3,
            is_featured: false,
            is_sale: true,
            description: 'Минималистичная гостиная для современного дома'
        }
    ];
    res.json(products);
});

// Категории
app.get('/api/categories', (req, res) => {
    const categories = [
        { id: 1, name: 'Кухни', slug: 'kitchens', description: 'Кухонные гарнитуры' },
        { id: 2, name: 'Спальни', slug: 'bedrooms', description: 'Спальные гарнитуры' },
        { id: 3, name: 'Гостиные', slug: 'living-rooms', description: 'Гостиные гарнитуры' }
    ];
    res.json(categories);
});

// Загрузка файлов
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
    }
    res.json({ 
        success: true, 
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`
    });
});

// Все остальные маршруты на React
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Доступен по адресу: http://vh454.timeweb.ru:${PORT}`);
    console.log(`📊 API Health: http://vh454.timeweb.ru:${PORT}/api/health`);
});
