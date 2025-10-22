import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>О компании</h3>
            <ul>
              <li><Link to="/about" onClick={scrollToTop}>О нас</Link></li>
              <li><Link to="/contacts" onClick={scrollToTop}>Контакты</Link></li>
              <li><Link to="/delivery" onClick={scrollToTop}>Доставка и оплата</Link></li>
              <li><Link to="/privacy" onClick={scrollToTop}>Политика конфиденциальности</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Покупателям</h3>
            <ul>
              <li><Link to="/catalog" onClick={scrollToTop}>Каталог</Link></li>
              <li><Link to="/catalog?is_sale=true" onClick={scrollToTop}>Акции</Link></li>
              <li><Link to="/orders" onClick={scrollToTop}>Мои заказы</Link></li>
              <li><Link to="/profile" onClick={scrollToTop}>Личный кабинет</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Контакты</h3>
            <ul>
              <li><a href="tel:88007700405">8 800 770 04 05</a></li>
              <li><a href="mailto:info@mebel2025.ru">info@mebel2025.ru</a></li>
              <li>Москва, ул. Примерная, д. 1</li>
              <li>Пн-Вс: 9:00-21:00</li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Мы в соцсетях</h3>
            <div className="social-links">
              <a href="https://vk.com" target="_blank" rel="noopener noreferrer">ВКонтакте</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer">Telegram</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YouTube</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2025 Мебель Москва. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

