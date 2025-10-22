const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const { Product, ProductImage, ProductAttribute, Category } = require('./models');
const { sequelize } = require('./config/database');
const { generateSlug } = require('./utils/helpers');
const sharp = require('sharp');

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

class ImprovedParser {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async parseProduct(url, categoryId) {
    try {
      console.log(`\n🔍 Парсинг: ${url}`);
      
      const response = await axios.get(url, { 
        headers: this.headers, 
        httpsAgent,
        timeout: 30000 
      });
      
      const $ = cheerio.load(response.data);
      
      // Название товара
      const name = $('h1').first().text().trim().split(',')[0] || 'Без названия';
      
      // Парсим цены - пробуем разные селекторы
      let price = 0;
      let old_price = null;
      
      // Пробуем разные селекторы для цен
      const priceSelectors = [
        '.page2-price-',
        '.price-current',
        '.product-price',
        '.price',
        '[class*="price"]'
      ];
      
      for (const selector of priceSelectors) {
        const priceText = $(selector).text();
        if (priceText) {
          const matches = priceText.match(/[\d\s]+(?=\s*руб)/g);
          if (matches) {
            const prices = matches.map(m => parseFloat(m.replace(/\s/g, ''))).filter(p => p > 0);
            if (prices.length >= 2) {
              old_price = Math.max(...prices);
              price = Math.min(...prices);
              break;
            } else if (prices.length === 1) {
              price = prices[0];
              break;
            }
          }
        }
      }
      
      // Если цены не найдены, пробуем найти в тексте страницы
      if (price === 0) {
        const pageText = $('body').text();
        const priceMatches = pageText.match(/(\d+[\s\d]*)\s*руб/gi);
        if (priceMatches) {
          const prices = priceMatches.map(m => parseFloat(m.replace(/[^\d]/g, ''))).filter(p => p > 0);
          if (prices.length > 0) {
            price = Math.min(...prices);
          }
        }
      }
      
      // Описание
      let description = '';
      const descSelectors = [
        '.product-description',
        '.description', 
        '.detail-text',
        '.product-info',
        '.content'
      ];
      
      for (const selector of descSelectors) {
        const desc = $(selector).first().text().trim();
        if (desc && desc.length > 50) {
          description = desc;
          break;
        }
      }
      
      if (!description) {
        description = `${name} - качественная мебель от производителя`;
      }
      
      // Артикул
      const sku = $('.article, .sku, .artikul').first().text().trim() || `SKU-${Date.now()}`;
      
      // Изображения - пробуем разные селекторы
      const images = [];
      const imageSelectors = [
        '.product-gallery img',
        '.item-slider img', 
        '.slides img',
        '.product-images img',
        '.gallery img',
        '.product-photos img',
        '.product-item img',
        '.catalog-item img',
        '.main-image img',
        '.product-main img',
        '.item-image img',
        '.photo img',
        'img[src*="product"]',
        'img[src*="furniture"]',
        'img[src*="krovat"]',
        'img[src*="divan"]',
        'img[src*="shkaf"]',
        'img[src*="stol"]',
        'img[src*="mebel"]',
        'img[src*="image"]',
        'img[src*="photo"]',
        'img[src*="pic"]',
        'img[width]',
        'img[height]'
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
      
      // Если изображения не найдены, пробуем найти в стилях background-image
      if (images.length === 0) {
        $('[style*="background-image"]').each((i, elem) => {
          const style = $(elem).attr('style');
          const match = style.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/);
          if (match) {
            const src = match[1];
            if (src && !src.includes('no-photo') && !src.includes('placeholder')) {
              const fullSrc = src.startsWith('http') ? src : `https://mebel-moskva.ru${src}`;
              if (!images.includes(fullSrc)) {
                images.push(fullSrc);
              }
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
        '.product-specs tr',
        '.details tr',
        '.info tr',
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
              // Проверяем, что это не заголовок таблицы
              if (!name.toLowerCase().includes('характеристик') && 
                  !name.toLowerCase().includes('описание') &&
                  !name.toLowerCase().includes('цена')) {
                attributes.push({ name, value });
              }
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
      
      console.log(`  📝 Название: ${name}`);
      console.log(`  💰 Цена: ${price} ₽`);
      console.log(`  💸 Старая цена: ${old_price || 'нет'} ₽`);
      console.log(`  🖼️ Изображений: ${images.length}`);
      if (images.length > 0) {
        console.log(`    Первое изображение: ${images[0]}`);
      }
      console.log(`  📋 Характеристик: ${attributes.length}`);
      if (attributes.length > 0) {
        console.log(`    Первая характеристика: ${attributes[0].name} = ${attributes[0].value}`);
      }
      
      // Валидация
      if (!name || price <= 0) {
        console.log(`  ❌ Пропуск - некорректные данные`);
        return null;
      }
      
      // Проверяем существование
      let product = await Product.findOne({ where: { source_url: url } });
      
      if (!product) {
        const slug = generateSlug(name) + '-' + Date.now();
        const discountPercent = old_price ? Math.round(((old_price - price) / old_price) * 100) : 0;
        
        product = await Product.create({
          category_id: categoryId,
          name, 
          slug, 
          sku,
          description,
          price, 
          old_price,
          discount_percent: discountPercent,
          in_stock: true,
          stock_quantity: Math.floor(Math.random() * 20) + 1,
          is_sale: !!old_price,
          is_new: true,
          is_featured: Math.random() > 0.7,
          source_url: url,
          meta_title: name
        });
        
        console.log(`  ✅ Товар добавлен ID: ${product.id}`);
        
        // Сохраняем изображения
        if (images.length > 0) {
          await this.saveImages(product.id, images.slice(0, 5));
        }
        
        // Сохраняем характеристики
        for (const attr of attributes) {
          await ProductAttribute.create({
            product_id: product.id,
            attribute_name: attr.name,
            attribute_value: attr.value
          });
        }
      } else {
        console.log(`  ℹ️ Товар уже существует ID: ${product.id}`);
      }
      
      return product;
      
    } catch (error) {
      console.error(`  ❌ Ошибка: ${error.message}`);
      return null;
    }
  }

  async saveImages(productId, imageUrls) {
    const productDir = path.join(__dirname, '../frontend/public/images/products', productId.toString());
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }
    
    let savedCount = 0;
    
    for (let i = 0; i < imageUrls.length; i++) {
      try {
        console.log(`    📥 Загружаем изображение ${i + 1}/${imageUrls.length}: ${imageUrls[i]}`);
        
        // Проверяем, что URL валидный
        if (!imageUrls[i] || imageUrls[i].length < 10) {
          console.log(`    ⚠️ Пропуск невалидного URL`);
          continue;
        }
        
        const response = await axios.get(imageUrls[i], { 
          responseType: 'arraybuffer', 
          httpsAgent,
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
            'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
            'Referer': 'https://mebel-moskva.ru/'
          }
        });
        
        // Проверяем, что это действительно изображение
        if (response.headers['content-type'] && !response.headers['content-type'].startsWith('image/')) {
          console.log(`    ⚠️ Пропуск не-изображения: ${response.headers['content-type']}`);
          continue;
        }
        
        const imageName = `image-${savedCount + 1}.jpg`;
        const imagePath = path.join(productDir, imageName);
        
        // Обрабатываем изображение
        await sharp(response.data)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(imagePath);
        
        await ProductImage.create({
          product_id: productId,
          image_url: `/images/products/${productId}/${imageName}`,
          is_main: savedCount === 0,
          sort_order: savedCount
        });
        
        if (savedCount === 0) {
          await Product.update(
            { main_image: `/images/products/${productId}/${imageName}` },
            { where: { id: productId } }
          );
        }
        
        savedCount++;
        console.log(`    ✅ Изображение ${savedCount} сохранено: ${imageName}`);
        
        // Задержка между загрузками
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`    ❌ Ошибка сохранения изображения ${i + 1}: ${error.message}`);
        // Продолжаем с следующим изображением
      }
    }
    
    console.log(`    📊 Сохранено изображений: ${savedCount}/${imageUrls.length}`);
  }

  async parseCategory(categoryUrl, categoryId) {
    try {
      console.log(`\n📂 Парсинг категории: ${categoryUrl}`);
      
      const response = await axios.get(categoryUrl, { 
        headers: this.headers, 
        httpsAgent,
        timeout: 30000 
      });
      
      const $ = cheerio.load(response.data);
      
      // Ищем ссылки на товары
      const productLinks = [];
      const linkSelectors = [
        'a[href*="/furniture/"]',
        'a[href*="/product/"]',
        '.item-block a',
        '.product-item a',
        '.catalog-item a'
      ];
      
      for (const selector of linkSelectors) {
        $(selector).each((i, elem) => {
          const href = $(elem).attr('href');
          if (href && href.includes('/furniture/') && !href.includes('/all/')) {
            const fullUrl = href.startsWith('http') ? href : `https://mebel-moskva.ru${href}`;
            if (!productLinks.includes(fullUrl)) {
              productLinks.push(fullUrl);
            }
          }
        });
      }
      
      console.log(`  🔗 Найдено ссылок на товары: ${productLinks.length}`);
      
      // Парсим первые 10 товаров
      const productsToParse = productLinks.slice(0, 10);
      let successCount = 0;
      
      for (const url of productsToParse) {
        const product = await this.parseProduct(url, categoryId);
        if (product) successCount++;
        
        // Задержка между запросами
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      console.log(`  ✅ Успешно обработано: ${successCount}/${productsToParse.length} товаров`);
      return successCount;
      
    } catch (error) {
      console.error(`  ❌ Ошибка парсинга категории: ${error.message}`);
      return 0;
    }
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    console.log('✅ Подключено к БД\n');
    
    const parser = new ImprovedParser();
    
    // Получаем или создаем категории
    const categories = [
      { name: 'Кровати', slug: 'beds', url: 'https://mebel-moskva.ru/furniture/all/krovati/' },
      { name: 'Диваны', slug: 'sofas', url: 'https://mebel-moskva.ru/furniture/all/divany/' },
      { name: 'Шкафы', slug: 'wardrobes', url: 'https://mebel-moskva.ru/furniture/all/shkafy/' },
      { name: 'Столы', slug: 'tables', url: 'https://mebel-moskva.ru/furniture/all/stoly/' }
    ];
    
    let totalProducts = 0;
    
    for (const catData of categories) {
      let category = await Category.findOne({ where: { slug: catData.slug } });
      if (!category) {
        category = await Category.create({
          name: catData.name,
          slug: catData.slug,
          description: `${catData.name} - широкий выбор`,
          is_active: true
        });
      }
      
      console.log(`\n🏷️ Категория: ${category.name}`);
      const count = await parser.parseCategory(catData.url, category.id);
      totalProducts += count;
    }
    
    console.log(`\n🎉 Парсинг завершен! Всего товаров: ${totalProducts}`);
    
    // Проверяем сколько товаров в базе
    const totalCount = await Product.count();
    const saleCount = await Product.count({ where: { is_sale: true } });
    console.log(`\n📊 Статистика:`);
    console.log(`  Всего товаров: ${totalCount}`);
    console.log(`  Товаров со скидкой: ${saleCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

main();
