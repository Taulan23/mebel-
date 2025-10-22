const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getSaleProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { checkAdmin } = require('../middleware/adminCheck');

// Попытка загрузить upload middleware
let upload;
try {
  upload = require('../middleware/upload');
} catch (err) {
  // Если multer не работает, используем заглушку
  upload = require('../middleware/simpleUpload');
}

// Публичные маршруты
router.get('/', getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/sale', getSaleProducts);
router.get('/:slug', getProductBySlug);

// Защищенные маршруты (только админ)
router.post('/', protect, checkAdmin, upload.single('image'), createProduct);
router.put('/:id', protect, checkAdmin, upload.single('image'), updateProduct);
router.delete('/:id', protect, checkAdmin, deleteProduct);

module.exports = router;

