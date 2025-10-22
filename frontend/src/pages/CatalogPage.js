import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api/productsAPI';
import { categoriesAPI } from '../api/categoriesAPI';
import ProductCard from '../components/product/ProductCard';
import './CatalogPage.css';

const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    is_sale: searchParams.get('is_sale') || '',
    is_featured: searchParams.get('is_featured') || '',
    sort: searchParams.get('sort') || 'created_at',
    order: searchParams.get('order') || 'DESC'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAllCategories();
      console.log('Категории в каталоге:', response);
      if (response.data?.data) {
        console.log('Устанавливаем категории из response.data.data:', response.data.data.length);
        setCategories(response.data.data);
      } else if (Array.isArray(response)) {
        console.log('Устанавливаем категории из response:', response.length);
        setCategories(response);
      } else if (response && Array.isArray(response.data)) {
        console.log('Устанавливаем категории из response.data:', response.data.length);
        setCategories(response.data);
      } else {
        console.log('Категории не найдены, устанавливаем пустой массив');
        setCategories([]);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: searchParams.get('page') || 1,
        size: 20,
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        min_price: searchParams.get('min_price') || '',
        max_price: searchParams.get('max_price') || '',
        is_sale: searchParams.get('is_sale') || '',
        is_featured: searchParams.get('is_featured') || '',
        sort: searchParams.get('sort') || 'created_at',
        order: searchParams.get('order') || 'DESC'
      };

      // Удаляем пустые параметры
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      console.log('=== ЗАГРУЗКА ТОВАРОВ ===');
      console.log('Параметры:', params);
      
      const response = await productsAPI.getAllProducts(params);
      console.log('Ответ API:', response);
      console.log('response.data:', response.data);
      console.log('response.data.items:', response.data?.items);
      console.log('response.data.data.items:', response.data?.data?.items);
      console.log('Количество товаров:', response.data?.data?.items?.length || response.data?.items?.length);
      
      setProducts(response.data?.data?.items || response.data?.items || []);
      setTotalPages(response.data?.data?.totalPages || response.data?.totalPages || 1);
      setCurrentPage(response.data?.data?.currentPage || response.data?.currentPage || 1);
      setTotalItems(response.data?.data?.totalItems || response.data?.totalItems || 0);
      
      console.log('Состояние обновлено:');
      console.log('- products:', response.data.data?.items?.length || response.data.items?.length || 0);
      console.log('- totalItems:', response.data.data?.totalItems || response.data.totalItems || 0);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // Обновляем URL
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      category: '',
      min_price: '',
      max_price: '',
      is_sale: '',
      is_featured: '',
      sort: 'created_at',
      order: 'DESC'
    });
    setSearchParams({});
  };

  const handlePageChange = (page) => {
    searchParams.set('page', page);
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="catalog-page">
      <div className="container">
        <h1>Каталог товаров</h1>

        <div className="catalog-layout">
          {/* Фильтры */}
          <aside className="catalog-sidebar">
            <div className="filter-header">
              <h3>Фильтры</h3>
              <button className="btn-link" onClick={handleResetFilters}>
                Сбросить все
              </button>
            </div>

            <div className="filter-section">
              <h3>Поиск</h3>
              <input
                type="text"
                className="input"
                placeholder="Название товара..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {console.log('Проверяем категории:', categories, 'length:', categories.length)}
            {categories.length > 0 && (
              <div className="filter-section">
                <h3>Категории</h3>
                <div className="categories-filter">
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="category"
                      checked={!filters.category}
                      onChange={() => handleFilterChange('category', '')}
                    />
                    <span>Все категории</span>
                  </label>
                  {categories
                    .filter(cat => cat.slug !== 'all')
                    .map(category => (
                      <label key={category.id} className="checkbox-label">
                        <input
                          type="radio"
                          name="category"
                          checked={filters.category === category.slug}
                          onChange={() => handleFilterChange('category', category.slug)}
                        />
                        <span>{category.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            <div className="filter-section">
              <h3>Цена</h3>
              <div className="price-inputs">
                <input
                  type="number"
                  className="input"
                  placeholder="От"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
                <input
                  type="number"
                  className="input"
                  placeholder="До"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>
            </div>

            <div className="filter-section">
              <h3>Специальные предложения</h3>
              <div className="checkbox-filters">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.is_sale === 'true'}
                    onChange={(e) => handleFilterChange('is_sale', e.target.checked ? 'true' : '')}
                  />
                  <span>Распродажа</span>
                </label>
              </div>
            </div>

          </aside>

          {/* Товары */}
          <div className="catalog-content">
            <div className="catalog-header">
              <div className="products-count">
                Найдено товаров: {totalItems}
              </div>

              <div className="sort-wrapper">
                <label>Сортировка:</label>
                <select
                  className="input sort-select"
                  value={`${filters.sort}_${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('_');
                    const newFilters = { ...filters, sort, order };
                    setFilters(newFilters);
                    
                    // Обновляем URL
                    const params = new URLSearchParams();
                    Object.entries(newFilters).forEach(([key, val]) => {
                      if (val) params.set(key, val);
                    });
                    setSearchParams(params);
                  }}
                >
                  <option value="created_at_DESC">Новинки</option>
                  <option value="price_ASC">Сначала дешевые</option>
                  <option value="price_DESC">Сначала дорогие</option>
                  <option value="name_ASC">По названию (А-Я)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading">Загрузка товаров...</div>
            ) : products.length === 0 ? (
              <div className="no-products">Товары не найдены</div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-secondary"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Назад
                    </button>
                    
                    <span className="page-info">
                      Страница {currentPage} из {totalPages}
                    </span>
                    
                    <button
                      className="btn btn-secondary"
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Вперед
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;

