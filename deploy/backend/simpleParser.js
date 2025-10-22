const axios = require('axios');
const cheerio = require('cheerio');
const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { Product, ProductImage, ProductAttribute, Category } = require('./models');
const { sequelize } = require('./config/database');
const { generateSlug } = require('./utils/helpers');
const sharp = require('sharp');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

// Ссылки на товары для быстрого парсинга
const knownProducts = [
  // Кровати
  'https://mebel-moskva.ru/furniture/napoli-kraft-zolotoy/krovat-napoli-1-s-yashchikom-160kh200-kraft-zolotoy/',
  'https://mebel-moskva.ru/furniture/napoli-ekokokha/interernaya-krovat-120kh200-napoli-4-ekokokha/',
  'https://mebel-moskva.ru/furniture/napoli-kraft-belyy/krovat-napoli-2-s-matrasom-kraft-belyy/',
  'https://mebel-moskva.ru/furniture/napoli-kraft-seryy/polutornaya-krovat-napoli-2-s-yashchikom-kraft-seryy/',
  'https://mebel-moskva.ru/furniture/napoli/krovat-napoli-s-matrasom-kraft-seryy/',
  'https://mebel-moskva.ru/furniture/brava/dvuspalnaya-krovat-napoli-4/',
  
  // Диваны
  'https://mebel-moskva.ru/furniture/divany/uglovye/',
  'https://mebel-moskva.ru/furniture/divany/pryamye/',
  'https://mebel-moskva.ru/furniture/divany/modulnye/',
  
  // Шкафы
  'https://mebel-moskva.ru/furniture/shkafy/kupe/',
  'https://mebel-moskva.ru/furniture/shkafy-kupe/',
  'https://mebel-moskva.ru/furniture/shkafy/uglovye/',
  
  // Столы
  'https://mebel-moskva.ru/furniture/stoly/obedennye/',
  'https://mebel-moskva.ru/furniture/stoly/zhurnalnye/',
  'https://mebel-moskva.ru/furniture/stoly/kompyuternye/',
  
  // Кресла
  'https://mebel-moskva.ru/furniture/kresla/',
  'https://mebel-moskva.ru/furniture/kresla/kompyuternye/',
  'https://mebel-moskva.ru/furniture/kresla/uglovye/',
  
  // Спальни
  'https://mebel-moskva.ru/furniture/spalni/',
  'https://mebel-moskva.ru/furniture/spalni/komplekty/',
  
  // Гостиные
  'https://mebel-moskva.ru/furniture/gostinye/',
  'https://mebel-moskva.ru/furniture/gostinye/komplekty/',
  
  // Детские
  'https://mebel-moskva.ru/furniture/detskie/',
  'https://mebel-moskva.ru/furniture/detskie/komplekty/',
  
  // Прихожие
  'https://mebel-moskva.ru/furniture/prihozhie/',
  'https://mebel-moskva.ru/furniture/prihozhie/komplekty/'
];

async function parseProduct(url, categoryId) {
  try {
    console.log(`\nПарсинг: ${url}`);
    
    const response = await axios.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      httpsAgent,
      timeout: 30000 
    });
    
    const $ = cheerio.load(response.data);
    
    // Название
    const name = $('h1').first().text().trim().split(',')[0]; // Убираем артикул
    
    // Цены
    let price = 0;
    let old_price = null;
    
    const priceText = $('.page2-price-').text();
    const matches = priceText.match(/[\d\s]+(?=\s*руб)/g);
    
    if (matches) {
      const prices = matches.map(m => parseFloat(m.replace(/\s/g, ''))).filter(p => p > 0);
      if (prices.length >= 2) {
        old_price = Math.max(...prices);
        price = Math.min(...prices);
      } else if (prices.length === 1) {
        price = prices[0];
      }
    }
    
    // Описание
    let description = '';
    $('p').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text.length > 100 && !text.includes('cookie')) {
        description = text;
        return false;
      }
    });
    
    if (!description) {
      description = `${name} - качественная мебель от производителя`;
    }
    
    // Артикул
    const articleMatch = $('h1').text().match(/,\s*(.+)$/);
    const sku = articleMatch ? articleMatch[1].trim() : `ART-${Date.now()}`;
    
    // Изображения - пробуем все возможные селекторы
    const images = [];
    const imageSelectors = [
      'img[src*="product"]',
      'img[src*="furniture"]', 
      'img[src*="krovat"]',
      'img[src*="divan"]',
      'img[src*="shkaf"]',
      'img[src*="stol"]',
      'img[src*="mebel"]',
      'img[src*="image"]',
      'img[src*="photo"]',
      'img[width]',
      'img[height]',
      '.slides img',
      '.product-gallery img',
      '.gallery img',
      '.product-images img',
      '.item-image img',
      '.main-image img'
    ];
    
    for (const selector of imageSelectors) {
      $(selector).each((i, elem) => {
        const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy') || $(elem).attr('data-original');
        if (src && !src.includes('no-photo') && !src.includes('placeholder') && !src.includes('logo') && !src.includes('icon')) {
          let fullSrc = src;
          if (!src.startsWith('http')) {
            fullSrc = src.startsWith('/') ? `https://mebel-moskva.ru${src}` : `https://mebel-moskva.ru/${src}`;
          }
          if (!images.includes(fullSrc)) {
            images.push(fullSrc);
          }
        }
      });
    }
    
    // Характеристики - пробуем разные селекторы
    const attributes = [];
    const attributeSelectors = [
      '.table-style tr',
      '.characteristics tr',
      '.props-list tr', 
      '.product-attributes tr',
      '.specifications tr',
      'table tr',
      '.param tr',
      '.feature tr'
    ];
    
    for (const selector of attributeSelectors) {
      $(selector).each((i, row) => {
        const cells = $(row).find('td, th');
        if (cells.length >= 2) {
          const name = $(cells[0]).text().trim();
          const value = $(cells[1]).text().trim();
          if (name && value && name.length > 1 && value.length > 1) {
            attributes.push({ name, value });
          }
        }
      });
    }
    
    // Если характеристики не найдены в таблицах, ищем в списках
    if (attributes.length === 0) {
      $('ul li, ol li').each((i, elem) => {
        const text = $(elem).text().trim();
        if (text.includes(':') && text.length > 5) {
          const parts = text.split(':');
          if (parts.length === 2) {
            const name = parts[0].trim();
            const value = parts[1].trim();
            if (name && value && name.length > 1 && value.length > 1) {
              attributes.push({ name, value });
            }
          }
        }
      });
    }
    
    console.log(`  Название: ${name}`);
    console.log(`  Цена: ${price} ₽`);
    console.log(`  Старая цена: ${old_price || 'нет'} ₽`);
    console.log(`  Изображений: ${images.length}`);
    console.log(`  Характеристик: ${attributes.length}`);
    
    // Валидация
    if (!name || price <= 0) {
      console.log(`  ❌ Пропуск - некорректные данные`);
      return;
    }
    
    // Проверяем существование
    let product = await Product.findOne({ where: { source_url: url } });
    
    if (!product) {
      const slug = generateSlug(name) + '-' + Date.now();
      
      product = await Product.create({
        category_id: categoryId,
        name, slug, sku,
        description,
        price, old_price,
        discount_percent: old_price ? Math.round(((old_price - price) / old_price) * 100) : 0,
        in_stock: true,
        stock_quantity: 10,
        is_sale: !!old_price,
        is_new: true,
        source_url: url,
        meta_title: name
      });
      
      console.log(`  ✅ Товар добавлен ID: ${product.id}`);
      
      // Сохраняем изображения
      if (images.length > 0) {
        await saveImages(product.id, images.slice(0, 5));
      }
      
      // Сохраняем характеристики
      for (const attr of attributes) {
        await ProductAttribute.create({
          product_id: product.id,
          attribute_name: attr.name,
          attribute_value: attr.value
        });
      }
    }
    
  } catch (error) {
    console.error(`  ❌ Ошибка: ${error.message}`);
  }
}

async function saveImages(productId, imageUrls) {
  const productDir = path.join(__dirname, '../frontend/public/images/products', productId.toString());
  if (!fs.existsSync(productDir)) {
    fs.mkdirSync(productDir, { recursive: true });
  }
  
  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const response = await axios.get(imageUrls[i], { 
        responseType: 'arraybuffer', 
        httpsAgent,
        timeout: 10000 
      });
      
      const imageName = `image-${i + 1}.jpg`;
      const imagePath = path.join(productDir, imageName);
      
      await sharp(response.data)
        .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(imagePath);
      
      await ProductImage.create({
        product_id: productId,
        image_url: `/images/products/${productId}/${imageName}`,
        is_main: i === 0,
        sort_order: i
      });
      
      if (i === 0) {
        await Product.update(
          { main_image: `/images/products/${productId}/${imageName}` },
          { where: { id: productId } }
        );
      }
      
      console.log(`    Изображение ${i + 1} сохранено`);
    } catch (error) {
      console.error(`    Ошибка сохранения изображения ${i + 1}: ${error.message}`);
    }
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД\n');
    
    // Получаем или создаем категорию
    let category = await Category.findOne({ where: { slug: 'beds' } });
    if (!category) {
      category = await Category.create({
        name: 'Кровати',
        slug: 'beds',
        description: 'Кровати всех видов',
        is_active: true
      });
    }
    
    console.log(`📦 Начинаем парсинг ${knownProducts.length} товаров...\n`);
    
    // Парсим каждый товар
    for (const url of knownProducts) {
      await parseProduct(url, category.id);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Задержка
    }
    
    console.log('\n✅ Парсинг завершен!');
    
    // Проверяем сколько товаров в базе
    const count = await Product.count();
    console.log(`\n📊 Всего товаров в базе: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main();

