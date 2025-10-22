require('dotenv').config();

module.exports = {
  sourceUrl: 'https://mebel-moskva.ru/furniture/all/krovati/',
  delay: parseInt(process.env.PARSER_DELAY) || 1000,
  maxConcurrent: parseInt(process.env.PARSER_MAX_CONCURRENT) || 5,
  timeout: parseInt(process.env.PARSER_TIMEOUT) || 30000,
  autoRun: process.env.PARSER_AUTO_RUN === 'true',
  schedule: process.env.PARSER_SCHEDULE || '0 3 * * *', // 3:00 AM every day
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  selectors: {
    productList: '.item-block, .product-item',
    productLink: 'a.item-link, a.product-link',
    productName: 'h1, .product-title',
    productPrice: '.price, .product-price',
    productOldPrice: '.old-price, .product-old-price',
    productArticle: '.article, .sku',
    productDescription: '.description, .product-description',
    productImages: 'img.product-image, .gallery img',
    productAttributes: '.characteristics table, .attributes',
    paginationLinks: '.pagination a, .pager a'
  }
};

