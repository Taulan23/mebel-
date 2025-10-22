import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../hooks/useCart';
import axios from '../../api/axios';
import './Header.css';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data?.data) {
        setCategories(response.data.data);
      } else if (Array.isArray(response)) {
        setCategories(response);
      } else if (response && Array.isArray(response.data)) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <div className="header-contacts">
              <a href="tel:88007700405">8 800 770 04 05</a>
              <span>9:00-21:00 (МСК)</span>
            </div>
            <nav className="header-nav">
              <Link to="/about" onClick={scrollToTop}>О компании</Link>
              <Link to="/delivery" onClick={scrollToTop}>Доставка</Link>
              <Link to="/contacts" onClick={scrollToTop}>Контакты</Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="header-main">
        <div className="container">
          <div className="header-main-content">
            <Link to="/" className="logo" onClick={scrollToTop}>
              <h1>Мебель Москва</h1>
            </Link>

            <div className="search-form">
              <input
                type="text"
                className="search-input"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
              />
              <button type="button" className="search-btn" onClick={handleSearch}>
                🔍
              </button>
            </div>

            <div className="header-actions">
              {isAuthenticated() ? (
                <div className="user-menu">
                  <Link to="/profile" className="user-link" onClick={scrollToTop}>
                    {user?.first_name || 'Профиль'}
                  </Link>
                  {isAdmin() && (
                    <Link to="/admin" className="admin-link" onClick={scrollToTop}>
                      Админ панель
                    </Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">
                    Выход
                  </button>
                </div>
              ) : (
                <Link to="/login" className="login-link">
                  Войти
                </Link>
              )}

              <Link to="/cart" className="cart-link" onClick={scrollToTop}>
                🛒 Корзина {getItemsCount() > 0 && <span className="cart-count">{getItemsCount()}</span>}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="header-nav-main">
        <div className="container">
          <nav className="main-nav">
            <Link to="/catalog" onClick={scrollToTop}>Каталог</Link>
            {categories
              .filter(cat => cat.is_active !== false)
              .slice(0, 4) // Показываем только первые 4 категории
              .map(category => (
                <Link 
                  key={category.id} 
                  to={`/catalog?category=${category.slug}`} 
                  onClick={scrollToTop}
                >
                  {category.name}
                </Link>
              ))}
            <Link to="/catalog?is_sale=true" onClick={scrollToTop}>Распродажа</Link>
          </nav>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-content">
            <nav className="mobile-nav">
              <Link to="/catalog" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Каталог</Link>
              <Link to="/catalog?category=beds" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Кровати</Link>
              <Link to="/catalog?category=wardrobes" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Шкафы</Link>
              <Link to="/catalog?category=tables" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Столы</Link>
              <Link to="/catalog?is_sale=true" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Распродажа</Link>
              <Link to="/help" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Справка</Link>
              <Link to="/about" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>О компании</Link>
              <Link to="/delivery" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Доставка</Link>
              <Link to="/contacts" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Контакты</Link>
              {isAuthenticated() ? (
                <>
                  <Link to="/profile" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Профиль</Link>
                  {isAdmin() && (
                    <Link to="/admin" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Админ панель</Link>
                  )}
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Выход</button>
                </>
              ) : (
                <Link to="/login" onClick={() => { setIsMobileMenuOpen(false); scrollToTop(); }}>Войти</Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

