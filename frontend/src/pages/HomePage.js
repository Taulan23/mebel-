import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/productsAPI';
import ProductCard from '../components/product/ProductCard';
import './HomePage.css';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const [featured, sale] = await Promise.all([
        productsAPI.getFeaturedProducts(),
        productsAPI.getSaleProducts()
      ]);
      
      setFeaturedProducts(featured.data?.data || featured.data || []);
      setSaleProducts(sale.data?.data || sale.data || []);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container loading">Загрузка...</div>;
  }

  return (
    <div className="home-page">
      {/* Баннер */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>Мебель для вашего дома</h1>
            <p>Качественная мебель по доступным ценам</p>
          </div>
        </div>
      </section>

      {/* Популярные товары */}
      {featuredProducts.length > 0 && (
        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <h2>Популярные товары</h2>
              <Link to="/catalog?is_featured=true" className="view-all-link">
                Смотреть все →
              </Link>
            </div>
            <div className="products-grid">
              {featuredProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Товары со скидкой */}
      {saleProducts.length > 0 && (
        <section className="products-section sale-section">
          <div className="container">
            <div className="section-header">
              <h2>Распродажа</h2>
              <Link to="/catalog?is_sale=true" className="view-all-link">
                Смотреть все →
              </Link>
            </div>
            <div className="products-grid">
              {saleProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Преимущества */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Быстрая доставка</h3>
              <p>Доставим ваш заказ в течение 1-3 дней</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">✓</div>
              <h3>Гарантия качества</h3>
              <p>Официальная гарантия на всю продукцию</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Удобная оплата</h3>
              <p>Наличными, картой или онлайн</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👤</div>
              <h3>Поддержка 24/7</h3>
              <p>Всегда готовы помочь с выбором</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

