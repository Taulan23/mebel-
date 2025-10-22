import React from 'react';
import './ContactsPage.css';

const ContactsPage = () => {
  return (
    <div className="contacts-page">
      <div className="container">
        <h1>Контакты</h1>

        <div className="contacts-content">
          <div className="contacts-grid">
            <section className="contact-section">
              <h2>Свяжитесь с нами</h2>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-info">
                  <h3>Телефон</h3>
                  <p><a href="tel:88007700405">8 800 770 04 05</a></p>
                  <p className="contact-detail">Бесплатно по России</p>
                  <p className="contact-detail">Пн-Вс: 9:00-21:00 (МСК)</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📱</div>
                <div className="contact-info">
                  <h3>Мобильный</h3>
                  <p><a href="tel:+74957950405">+7 (495) 795-04-05</a></p>
                  <p className="contact-detail">Для Москвы и области</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div className="contact-info">
                  <h3>Email</h3>
                  <p><a href="mailto:info@mebel2025.ru">info@mebel2025.ru</a></p>
                  <p className="contact-detail">Ответим в течение 1 часа</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">💬</div>
                <div className="contact-info">
                  <h3>Мессенджеры</h3>
                  <p><a href="https://t.me/mebel2025">Telegram</a></p>
                  <p><a href="https://wa.me/74957950405">WhatsApp</a></p>
                </div>
              </div>
            </section>

            <section className="contact-section">
              <h2>Адрес магазина</h2>
              
              <div className="address-info">
                <div className="address-icon">📍</div>
                <div>
                  <h3>Москва</h3>
                  <p>ул. Примерная, д. 1, корп. 2</p>
                  <p>м. Центральная (5 мин пешком)</p>
                </div>
              </div>

              <div className="schedule">
                <h3>Режим работы:</h3>
                <p>Понедельник - Воскресенье: 9:00 - 21:00</p>
                <p>Без выходных и праздников</p>
              </div>

              <div className="map-container">
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?um=constructor%3A7e8e8f7f8f8f8f8f8f8f8f8f8f8f8f8f&amp;source=constructor" 
                  width="100%" 
                  height="400" 
                  frameBorder="0"
                  title="Карта расположения магазина"
                  style={{ border: 0, borderRadius: '8px' }}
                ></iframe>
              </div>
            </section>
          </div>

          <section className="contact-section full-width">
            <h2>Отделы</h2>
            <div className="departments-grid">
              <div className="department">
                <h3>Отдел продаж</h3>
                <p>📞 +7 (495) 795-04-05, доб. 1</p>
                <p>📧 sales@mebel2025.ru</p>
              </div>
              <div className="department">
                <h3>Служба поддержки</h3>
                <p>📞 +7 (495) 795-04-05, доб. 2</p>
                <p>📧 support@mebel2025.ru</p>
              </div>
              <div className="department">
                <h3>Отдел доставки</h3>
                <p>📞 +7 (495) 795-04-05, доб. 3</p>
                <p>📧 delivery@mebel2025.ru</p>
              </div>
              <div className="department">
                <h3>Бухгалтерия</h3>
                <p>📞 +7 (495) 795-04-05, доб. 4</p>
                <p>📧 accounting@mebel2025.ru</p>
              </div>
            </div>
          </section>

          <section className="contact-section full-width social-section">
            <h2>Мы в соцсетях</h2>
            <div className="social-links-grid">
              <a href="https://vk.com/mebel2025" className="social-link" target="_blank" rel="noopener noreferrer">
                <div className="social-icon">👥</div>
                <div>
                  <h3>ВКонтакте</h3>
                  <p>Новости и акции</p>
                </div>
              </a>
              <a href="https://t.me/mebel2025" className="social-link" target="_blank" rel="noopener noreferrer">
                <div className="social-icon">✈️</div>
                <div>
                  <h3>Telegram</h3>
                  <p>Онлайн-консультант</p>
                </div>
              </a>
              <a href="https://instagram.com/mebel2025" className="social-link" target="_blank" rel="noopener noreferrer">
                <div className="social-icon">📷</div>
                <div>
                  <h3>Instagram</h3>
                  <p>Фото интерьеров</p>
                </div>
              </a>
              <a href="https://youtube.com/mebel2025" className="social-link" target="_blank" rel="noopener noreferrer">
                <div className="social-icon">🎥</div>
                <div>
                  <h3>YouTube</h3>
                  <p>Видеообзоры товаров</p>
                </div>
              </a>
            </div>
          </section>

          <section className="contact-section full-width form-section">
            <h2>Напишите нам</h2>
            <form className="contact-form">
              <div className="form-row">
                <input type="text" className="input" placeholder="Ваше имя *" required />
                <input type="tel" className="input" placeholder="Телефон *" required />
              </div>
              <input type="email" className="input" placeholder="Email" />
              <textarea className="input" rows="5" placeholder="Ваше сообщение *" required></textarea>
              <button type="submit" className="btn btn-primary">Отправить сообщение</button>
            </form>
          </section>

          <section className="contact-section full-width info-section">
            <h2>Реквизиты</h2>
            <div className="requisites">
              <p><strong>ООО "Мебель Москва"</strong></p>
              <p>ИНН: 7700000000</p>
              <p>КПП: 770001001</p>
              <p>ОГРН: 1007700000000</p>
              <p>Юридический адрес: 123456, г. Москва, ул. Примерная, д. 1</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;

