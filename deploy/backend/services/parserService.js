const puppeteer = require('puppeteer');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { Product, ProductImage, ProductAttribute, Category, ParserLog } = require('../models');
const parserConfig = require('../config/parser');
const logger = require('../utils/logger');
const { generateSlug } = require('../utils/helpers');
const sharp = require('sharp');

class ParserService {
  constructor() {
    this.browser = null;
    this.isRunning = false;
    this.stats = {
      parsed: 0,
      added: 0,
      updated: 0,
      errors: 0
    };
    this.currentLogId = null;
  }

  // Запуск парсера
  async start() {
    if (this.isRunning) {
      throw new Error('Парсер уже запущен');
    }

    this.isRunning = true;
    this.stats = { parsed: 0, added: 0, updated: 0, errors: 0 };

    // Создаем лог запуска
    const log = await ParserLog.create({
      status: 'running',
      start_time: new Date()
    });
    this.currentLogId = log.id;

    logger.info('🚀 Парсер запущен');

    try {
      // Запускаем браузер
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      // Категории для парсинга
      const categoriesToParse = [
        { name: 'Кровати', slug: 'beds', url: '/furniture/all/krovati/' },
        { name: 'Шкафы', slug: 'wardrobes', url: '/furniture/all/shkafy/' },
        { name: 'Столы', slug: 'tables', url: '/furniture/all/stoly/' },
        { name: 'Гостиные', slug: 'living-rooms', url: '/furniture/gostinye/' }
      ];

      // Парсим каждую категорию
      for (const catData of categoriesToParse) {
        try {
          logger.info(`Парсинг категории: ${catData.name}`);
          
          // Создаем или находим категорию
          let category = await Category.findOne({ where: { slug: catData.slug } });
          if (!category) {
            category = await Category.create({
              name: catData.name,
              slug: catData.slug,
              description: `${catData.name} - широкий выбор`,
              is_active: true
            });
          }

          // Парсим товары категории
          await this.parseProducts(category.id, catData.url);
          
          logger.success(`Категория ${catData.name} обработана`);
        } catch (error) {
          logger.error(`Ошибка парсинга категории ${catData.name}`, { error: error.message });
        }
      }

      // Закрываем браузер
      await this.browser.close();

      // Обновляем лог
      await ParserLog.update({
        status: 'completed',
        end_time: new Date(),
        products_parsed: this.stats.parsed,
        products_added: this.stats.added,
        products_updated: this.stats.updated,
        errors_count: this.stats.errors
      }, {
        where: { id: this.currentLogId }
      });

      logger.success('✅ Парсинг завершен', this.stats);

      return this.stats;
    } catch (error) {
      logger.error('❌ Ошибка парсинга', { error: error.message });

      // Обновляем лог с ошибкой
      await ParserLog.update({
        status: 'failed',
        end_time: new Date(),
        products_parsed: this.stats.parsed,
        products_added: this.stats.added,
        products_updated: this.stats.updated,
        errors_count: this.stats.errors,
        error_message: error.message
      }, {
        where: { id: this.currentLogId }
      });

      throw error;
    } finally {
      this.isRunning = false;
      if (this.browser) {
        await this.browser.close();
      }
    }
  }

  // Парсинг товаров
  async parseProducts(categoryId, categoryUrl) {
    try {
      const page = await this.browser.newPage();
      await page.setUserAgent(parserConfig.userAgent);

      // Формируем полный URL
      const fullUrl = `https://mebel-moskva.ru${categoryUrl}`;
      
      // Стратегия: парсим только со страницы 2, где товары рендерятся в HTML
      const pageUrl = `${fullUrl}?PAGEN_2=2`;
      logger.info(`Открываем страницу: ${pageUrl}`);
      
      await page.goto(pageUrl, { waitUntil: 'load', timeout: parserConfig.timeout });

      // Ждем загрузки товаров и прокручиваем
      await this.delay(5000);
      await page.evaluate(() => window.scrollTo(0, 2500));
      await this.delay(3000);

      // Получаем ссылки И миниатюры товаров
      const productsData = await page.evaluate(() => {
        const products = [];
        
        // Ищем ВСЕ товары - любую мебель
        document.querySelectorAll('img[alt]').forEach(img => {
          const alt = img.getAttribute('alt') || '';
          
          // Проверяем что это товар мебели (длинное название)
          const furnitureKeywords = ['Кровать', 'Диван', 'Шкаф', 'Стол', 'Стул', 
                                     'Кухня', 'Гостиная', 'Прихожая', 'Комод', 
                                     'Тумба', 'Полка', 'Гарнитур'];
          const isProductImage = furnitureKeywords.some(keyword => alt.includes(keyword)) && 
                                alt.length > 15;
          
          if (isProductImage) {
            // Получаем URL миниатюры товара (ОБЯЗАТЕЛЬНО getAttribute!)
            const thumbnailSrc = img.getAttribute('src') || img.getAttribute('data-src');
            
            // Находим родительский контейнер
            let parent = img.parentElement;
            for (let i = 0; i < 5; i++) {
              if (parent) {
                const link = parent.querySelector('a[href*="/furniture/"]');
                if (link) {
                  const href = link.getAttribute('href');
                  if (href) {
                    const parts = href.split('/').filter(p => p);
                    
                    // Товар имеет структуру: furniture / collection / product-name
                    // где collection НЕ равен 'all'
                    if (parts.length === 3 && parts[0] === 'furniture' && parts[1] !== 'all') {
                      const url = `https://mebel-moskva.ru${href}`;
                      
                      // Проверяем что такой товар еще не добавлен
                      if (!products.find(p => p.url === url)) {
                        products.push({
                          url,
                          thumbnail: thumbnailSrc
                        });
                      }
                      break;
                    }
                  }
                }
                parent = parent.parentElement;
              }
            }
          }
        });
        
        return products;
      });
      
      const productLinks = productsData.map(p => p.url);
      
      logger.info(`Найдено товаров: ${productLinks.length}`);

      // Парсим ВСЕ товары без ограничений
      for (const productData of productsData) {
        try {
          // Передаем URL миниатюры вместе со ссылкой
          await this.parseProductPage(productData.url, categoryId, productData.thumbnail);
          this.stats.parsed++;
          
          // Задержка между запросами
          await this.delay(1000);
        } catch (error) {
          logger.error(`Ошибка парсинга товара ${productData.url}`, { error: error.message });
          this.stats.errors++;
        }
      }

      await page.close();
    } catch (error) {
      logger.error('Ошибка парсинга товаров', { error: error.message });
      throw error;
    }
  }

  // Получить количество страниц
  async getTotalPages(page) {
    try {
      const paginationText = await page.evaluate(() => {
        const paginationElement = document.querySelector('.pagination, .pager, .bx-pagination');
        if (!paginationElement) return '1';
        
        const links = Array.from(paginationElement.querySelectorAll('a'));
        const numbers = links.map(link => parseInt(link.textContent)).filter(n => !isNaN(n));
        
        return numbers.length > 0 ? Math.max(...numbers).toString() : '1';
      });
      
      return parseInt(paginationText) || 1;
    } catch (error) {
      return 1;
    }
  }

  // Получить ссылки на товары
  async getProductLinks(page) {
    try {
      const links = await page.evaluate(() => {
        const uniqueLinks = new Set();
        
        // Ищем все div которые содержат изображения товаров
        const allDivs = document.querySelectorAll('div');
        
        allDivs.forEach(div => {
          // Ищем изображение и ссылку внутри div
          const img = div.querySelector('img[alt]');
          const link = div.querySelector('a[href*="/furniture/"]');
          
          if (img && link) {
            const href = link.getAttribute('href');
            const alt = img.getAttribute('alt') || '';
            
            // Проверяем что это товар по alt изображения
            const isProduct = alt.includes('Кровать') || alt.includes('Диван') || 
                            alt.includes('Шкаф') || alt.includes('Стол') || alt.includes('Стул');
            
            if (isProduct && href) {
              const parts = href.split('/').filter(p => p);
              
              // URL товара должен иметь минимум 4 части
              // Например: furniture / napoli-kraft-zolotoy / krovat-napoli-1... / (пусто)
              if (parts.length >= 3) {
                // Исключаем категории и подкатегории
                const lastPart = parts[parts.length - 1];
                const secondLastPart = parts[parts.length - 2] || '';
                
                // Проверяем что это НЕ категория
                const categoryKeywords = ['krovati', 'divany', 'shkafy', 'stoly', 'stulya', 
                                         'filter', 'all', 'penaly', 'vitriny', 'navesnye', 
                                         'kupe', 'garderobnoy', 'dvuspalnye', 'odnospalnye'];
                
                const isCategory = categoryKeywords.some(keyword => 
                  lastPart.includes(keyword) || secondLastPart === 'all'
                );
                
                // URL товара обычно имеет структуру: /furniture/collection/product-name/
                // где collection != 'all'
                const isRealProduct = parts.length >= 3 && parts[1] !== 'all';
                
                if (isRealProduct && !isCategory && !href.includes('?') && !href.includes('#')) {
                  const fullUrl = href.startsWith('http') ? href : `https://mebel-moskva.ru${href}`;
                  uniqueLinks.add(fullUrl);
                }
              }
            }
          }
        });
        
        return Array.from(uniqueLinks);
      });
      
      return links;
    } catch (error) {
      logger.error('Ошибка получения ссылок', { error: error.message });
      return [];
    }
  }

  // Парсинг страницы товара
  async parseProductPage(url, categoryId, catalogThumbnail = null) {
    const page = await this.browser.newPage();
    await page.setUserAgent(parserConfig.userAgent);
    
    try {
      logger.info(`Парсинг товара: ${url}${catalogThumbnail ? ' (с миниатюрой)' : ''}`);
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: parserConfig.timeout 
      });

      // Извлекаем данные товара
      const productData = await page.evaluate((thumbnailUrl) => {
        const getTextContent = (selector) => {
          const el = document.querySelector(selector);
          return el ? el.textContent.trim() : '';
        };

        // Название
        const name = getTextContent('h1') || 
                      getTextContent('.product-title') || 
                      getTextContent('.item-title') || 
                      'Без названия';
        
        // Цена - улучшенный парсинг
        let price = 0;
        let old_price = null;
        
        // Ищем блок с ценой
        const priceBlock = document.querySelector('.page2-price-, [class*="price-"]');
        if (priceBlock) {
          const priceText = priceBlock.textContent.trim();
          // Извлекаем все числа из текста
          const numbers = priceText.match(/[\d\s]+(?=\s*руб)/g);
          if (numbers && numbers.length > 0) {
            // Очищаем от пробелов и конвертируем в числа
            const prices = numbers.map(n => parseFloat(n.replace(/\s/g, ''))).filter(n => n > 0);
            if (prices.length === 1) {
              price = prices[0];
            } else if (prices.length >= 2) {
              // Если две цены, то первая старая, вторая текущая
              old_price = Math.max(...prices);
              price = Math.min(...prices);
            }
          }
        }
        
        // Если не нашли, ищем другими способами
        if (price === 0) {
          const priceText = getTextContent('.current-price') || 
                            getTextContent('.price') || 
                            getTextContent('.product-price') || 
                            getTextContent('[itemprop="price"]') || '';
          price = parseFloat(priceText.replace(/[^\d]/g, '')) || 0;
          
          const oldPriceText = getTextContent('.old-price') || 
                               getTextContent('.product-old-price') || '';
          old_price = oldPriceText ? parseFloat(oldPriceText.replace(/[^\d]/g, '')) : null;
        }
        
        // Описание - формируем из доступных данных
        let description = '';
        
        // Ищем описание в разных местах
        const descSelectors = [
          '.product-description',
          '.description',
          '[itemprop="description"]',
          '.item-description',
          '.detail-text',
          '.product-detail-text',
          '.tab-content',
          '#description'
        ];
        
        for (const selector of descSelectors) {
          const elem = document.querySelector(selector);
          if (elem && elem.textContent.trim().length > 50) {
            description = elem.textContent.trim();
            break;
          }
        }
        
        // Если описание не найдено, формируем из названия и характеристик
        if (!description || description.length < 50) {
          description = `${name} - качественная мебель от производителя. `;
          
          // Добавляем размеры если есть
          const sizeText = document.querySelector('.size, [class*="size"], [class*="Size"]');
          if (sizeText) {
            description += sizeText.textContent.trim() + '. ';
          }
          
          // Добавляем материал если есть
          const materialText = document.querySelector('[class*="material"], [class*="Material"]');
          if (materialText) {
            description += 'Материал: ' + materialText.textContent.trim() + '. ';
          }
        }
        
        // Ограничиваем длину
        if (description.length > 500) {
          description = description.substring(0, 497) + '...';
        }
        
        // Артикул
        const sku = getTextContent('.article') || 
                     getTextContent('.sku') || 
                     getTextContent('.artikul') || 
                     getTextContent('[itemprop="sku"]') || '';

        // Изображения - берем УНИКАЛЬНУЮ миниатюру из каталога
        const images = [];
        
        // Если передали миниатюру из каталога - используем её
        if (thumbnailUrl && thumbnailUrl.includes('/upload/')) {
          let imgUrl = thumbnailUrl.startsWith('http') ? 
                      thumbnailUrl : 
                      `https://mebel-moskva.ru${thumbnailUrl}`;
          
          // Преобразуем миниатюру в полноразмерное изображение
          // resize_cache/iblock/XXX/445_320_2/file.jpg -> iblock/XXX/file.jpg
          imgUrl = imgUrl.replace(/\/resize_cache\/(iblock\/[^/]+)\/[^/]+\//, '/$1/');
          
          images.push(imgUrl);
        }
        
        // Ищем дополнительные изображения в галерее товара (если есть)
        const galleryImages = document.querySelectorAll(
          '.product-gallery img, .thumbnails img, .bx-pager img, [data-fancybox] img'
        );
        
        const seenUrls = new Set(thumbnailUrl ? [thumbnailUrl] : []);
        
        galleryImages.forEach(img => {
          if (images.length >= 5) return;
          
          const src = img.src || img.getAttribute('src');
          if (!src || seenUrls.has(src)) return;
          
          if (src.includes('/upload/iblock/') && !src.includes('logo') && !src.includes('banner')) {
            let fullSrc = src.startsWith('http') ? src : `https://mebel-moskva.ru${src}`;
            fullSrc = fullSrc.replace(/\/resize_cache\/(iblock\/[^/]+)\/[^/]+\//, '/$1/');
            images.push(fullSrc);
            seenUrls.add(src);
          }
        });

        // Характеристики - парсим таблицу характеристик
        const attributes = [];
        const attrSelectors = [
          '.characteristics table tr',
          '.props-list tr',
          '.properties table tr',
          '.char-table tr',
          '.params tr'
        ];
        
        for (const selector of attrSelectors) {
          const rows = document.querySelectorAll(selector);
          if (rows.length > 0) {
            rows.forEach(row => {
              const cells = row.querySelectorAll('td, th');
              if (cells.length >= 2) {
                const name = cells[0].textContent.trim();
                const value = cells[1].textContent.trim();
                if (name && value && name.length < 100) {
                  attributes.push({ name, value });
                }
              }
            });
            if (attributes.length > 0) break;
          }
        }
        
        // Если не нашли таблицу, ищем списки
        if (attributes.length === 0) {
          const listItems = document.querySelectorAll('.characteristics li, .properties li, .params li');
          listItems.forEach(item => {
            const text = item.textContent.trim();
            if (text.includes(':')) {
              const [name, value] = text.split(':').map(s => s.trim());
              if (name && value) {
                attributes.push({ name, value });
              }
            }
          });
        }

        return {
          name,
          price,
          old_price,
          description,
          sku,
          images,
          attributes
        };
      }, catalogThumbnail);

      // Валидация данных товара
      if (!productData.name || productData.name === 'Без названия' || productData.name.length < 3) {
        throw new Error('Некорректное название товара');
      }

      if (!productData.price || productData.price <= 0) {
        throw new Error('Некорректная цена товара');
      }

      if (productData.images.length === 0) {
        logger.warn(`У товара ${productData.name} нет изображений`);
      }

      // Генерируем slug
      const slug = generateSlug(productData.name) + '-' + Date.now();

      // Проверяем существование товара
      let product = await Product.findOne({
        where: { source_url: url }
      });

      if (product) {
        // Обновляем существующий товар
        await product.update({
          name: productData.name,
          price: productData.price,
          old_price: productData.old_price,
          description: productData.description || 'Описание отсутствует',
          discount_percent: productData.old_price ? 
            Math.round(((productData.old_price - productData.price) / productData.old_price) * 100) : 0,
          is_sale: !!productData.old_price
        });
        
        this.stats.updated++;
        logger.success(`Товар обновлен: ${productData.name}`);
      } else {
        // Создаем новый товар
        product = await Product.create({
          category_id: categoryId,
          name: productData.name,
          slug,
          sku: productData.sku || `SKU-${Date.now()}`,
          description: productData.description || 'Описание отсутствует',
          price: productData.price,
          old_price: productData.old_price,
          discount_percent: productData.old_price ? 
            Math.round(((productData.old_price - productData.price) / productData.old_price) * 100) : 0,
          in_stock: true,
          stock_quantity: 10,
          is_sale: !!productData.old_price,
          is_new: true,
          source_url: url,
          meta_title: productData.name,
          meta_description: productData.description ? productData.description.substring(0, 160) : productData.name
        });
        
        this.stats.added++;
        logger.success(`Товар добавлен: ${productData.name}`);

        // Сохраняем изображения
        if (productData.images.length > 0) {
          await this.saveProductImages(product.id, productData.images);
        }

        // Сохраняем характеристики
        if (productData.attributes.length > 0) {
          for (const attr of productData.attributes) {
            await ProductAttribute.create({
              product_id: product.id,
              attribute_name: attr.name,
              attribute_value: attr.value
            });
          }
        }
      }

    } catch (error) {
      logger.error(`Ошибка парсинга страницы товара ${url}`, { error: error.message });
      throw error;
    } finally {
      await page.close();
    }
  }

  // Сохранение изображений товара
  async saveProductImages(productId, imageUrls) {
    const productDir = path.join(__dirname, '../../frontend/public/images/products', productId.toString());
    
    // Создаем папку для товара
    if (!fs.existsSync(productDir)) {
      fs.mkdirSync(productDir, { recursive: true });
    }

    let sortOrder = 0;
    const https = require('https');
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    
    for (const imageUrl of imageUrls.slice(0, 5)) { // Максимум 5 изображений
      try {
        // Скачиваем изображение с отключенной проверкой SSL
        const response = await axios.get(imageUrl, { 
          responseType: 'arraybuffer', 
          timeout: 15000,
          httpsAgent,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://mebel-moskva.ru/'
          }
        });
        
        const imageName = `image-${sortOrder + 1}.jpg`;
        const imagePath = path.join(productDir, imageName);
        
        // Оптимизируем и сохраняем изображение
        await sharp(response.data)
          .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(imagePath);
        
        // Создаем запись в БД
        await ProductImage.create({
          product_id: productId,
          image_url: `/images/products/${productId}/${imageName}`,
          is_main: sortOrder === 0,
          sort_order: sortOrder
        });

        // Обновляем main_image у товара
        if (sortOrder === 0) {
          await Product.update(
            { main_image: `/images/products/${productId}/${imageName}` },
            { where: { id: productId } }
          );
        }

        sortOrder++;
        logger.success(`Изображение ${sortOrder} сохранено для товара ${productId}`);
      } catch (error) {
        logger.error(`Ошибка сохранения изображения ${imageUrl.substring(0, 50)}`, { error: error.message });
      }
    }
    
    return sortOrder;
  }

  // Задержка
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Получить статус парсера
  getStatus() {
    return {
      isRunning: this.isRunning,
      stats: this.stats
    };
  }

  // Остановить парсер
  async stop() {
    if (this.browser) {
      await this.browser.close();
    }
    this.isRunning = false;
    logger.info('Парсер остановлен');
  }
}

// Экспортируем единственный экземпляр
const parserService = new ParserService();
module.exports = parserService;

