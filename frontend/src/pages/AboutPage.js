import React from 'react';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="container">
        <h1>О компании</h1>

        <div className="about-content">
          <section className="about-section">
            <h2>Добро пожаловать в Мебель Москва!</h2>
            <p>
              Мы - современный интернет-магазин мебели, предлагающий широкий ассортимент качественной 
              мебели для дома и офиса. Наша миссия - сделать красивую и функциональную мебель доступной 
              для каждого.
            </p>
          </section>

          <section className="about-section">
            <h2>Почему выбирают нас?</h2>
            <div className="advantages-grid">
              <div className="advantage-item">
                <div className="advantage-icon">🏆</div>
                <h3>Высокое качество</h3>
                <p>Работаем только с проверенными производителями. Вся мебель сертифицирована и соответствует стандартам качества.</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">💰</div>
                <h3>Доступные цены</h3>
                <p>Прямые поставки от производителей позволяют нам предлагать лучшие цены на рынке без наценок посредников.</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">🚚</div>
                <h3>Быстрая доставка</h3>
                <p>Доставка по Москве и области в течение 1-3 дней. Доступна доставка по всей России.</p>
              </div>
              <div className="advantage-item">
                <div className="advantage-icon">🛡️</div>
                <h3>Гарантия</h3>
                <p>Официальная гарантия на всю продукцию. Бесплатное гарантийное обслуживание.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Наши преимущества</h2>
            <ul className="features-list">
              <li>✓ Более 5000 товаров в каталоге</li>
              <li>✓ Бесплатная консультация дизайнера</li>
              <li>✓ Помощь в выборе и подборе мебели</li>
              <li>✓ Профессиональная сборка</li>
              <li>✓ Рассрочка 0% на покупки</li>
              <li>✓ Программа лояльности для постоянных клиентов</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Наша история</h2>
            <p>
              Компания "Мебель Москва" была основана с целью изменить подход к продаже мебели в России. 
              Мы объединили опыт лучших мебельных салонов с удобством онлайн-покупок, создав 
              современный интернет-магазин с широким ассортиментом и выгодными ценами.
            </p>
            <p>
              За годы работы мы помогли тысячам клиентов обустроить их дома и офисы, и продолжаем 
              развиваться, расширяя ассортимент и улучшая сервис.
            </p>
          </section>

          <section className="about-section stats-section">
            <h2>Наши достижения</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-number">5000+</div>
                <div className="stat-label">Товаров в каталоге</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">10000+</div>
                <div className="stat-label">Довольных клиентов</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Брендов-партнеров</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Поддержка клиентов</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

